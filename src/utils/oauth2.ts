import crypto from 'crypto';
import {
  OpenIdConfig,
  AccessToken,
  TokenResponseBody,
  TokenIntrospection,
  UserInfo,
} from '../types';
import {saveToLocalStorage, getFromLocalStorage, clearLocalStorage} from '.';

const OPENID_CONFIG_PATH = '.well-known/openid-configuration.json';
// This makes sure token does not expire after checking and in between making the request
const TOKEN_EXPIRATION_SAFETY_BUFFER = 60000;

interface Oauth2Options {
  webAuthFlowOptions: Partial<chrome.identity.WebAuthFlowOptions>;
  clientAuthParams: string[][];
}

type Oauth2OptionsArgument = Partial<Oauth2Options>;

const DEFAULT_OPTIONS: Oauth2Options = {
  webAuthFlowOptions: {
    interactive: true,
  },
  clientAuthParams: [],
};

export class Oauth2 {
  clientId: string;
  domain: string;
  options: Oauth2Options;
  config?: OpenIdConfig;

  public constructor(
    clientId: string,
    domain: string,
    options: Oauth2OptionsArgument,
  ) {
    this.clientId = clientId;
    this.domain = domain;
    this.options = {...DEFAULT_OPTIONS, ...options};
  }

  /**
   * Request a new oauth2 access token from the clientId and clientScope specified in the constructor
   */
  public authenticate(params: string[][] = []): Promise<AccessToken> {
    const {clientId} = this;
    const {clientAuthParams} = this.options;
    return this.getValidAccessTokenAndSave(
      clientId,
      [...clientAuthParams, ...params],
      this.getNewAccessToken,
    );
  }

  /**
   * Get a valid access token for the given application via storage, refresh
   * token, or via token exchange using a valid client token.
   *
   * @param subjectId - The Id of the application we want to exchange a token with
   * @param scope - The scope we want for the token if we need to request a new one
   */
  public getSubjectAccessToken(
    subjectId: string,
    params: string[][],
  ): Promise<AccessToken> {
    return this.getValidAccessTokenAndSave(
      subjectId,
      params,
      this.exchangeToken,
    );
  }

  /*
   * Check to see if client token exists in local and is valid
   */
  public async hasValidClientToken(): Promise<Boolean> {
    const token = await this.getAccessTokenFromStorage(this.clientId);
    if (typeof token !== 'undefined') {
      if (this.isAccessTokenInvalid(token)) {
        await this.authenticate();
      }
      return true;
    }

    return false;
  }

  public async logoutUser() {
    const token = await this.getAccessTokenFromStorage(this.clientId);
    const url = new URL(`https://identity.myshopify.io/api/v1/logout`);
    if (token) {
      url.search = new URLSearchParams([
        ['id_token_hint', token.idToken],
      ]).toString();
    }
    const response = await fetch(url.href, {
      method: 'delete',
      headers: {Authorization: `Bearer ${token!.accessToken}`},
    });

    if (response.ok) {
      this.deleteAccessToken();
      return true;
    }

    throw Error(response.statusText);
  }

  public async getUserInfo(): Promise<UserInfo> {
    const config = await this.getConfig();
    const token = await this.getAccessTokenFromStorage(this.clientId);
    const url = new URL(config.userinfo_endpoint);
    const response = await fetch(url.href, {
      headers: {Authorization: `Bearer ${token!.accessToken}`},
    });

    if (response.ok) return response.json();

    throw Error(response.statusText);
  }

  /**
   * When an application is presented with an access token, Identity's Token
   * Introspection endpoint must be used to verify the validity of the access
   * token before proceeding further.
   *
   * @param {accessToken} - The token which you want to introspect
   */
  public async introspectToken({
    accessToken,
  }: AccessToken): Promise<TokenIntrospection> {
    const config = await this.getConfig();
    const url = new URL(config.introspection_endpoint);

    url.search = new URLSearchParams([['token', accessToken]]).toString();
    const response = await fetch(url.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) return response.json();

    throw Error(response.statusText);
  }

  /**
   * Try to get the associated from storage, or from refresh token, or request a
   * new token using the provided callback method.
   *
   * @param id - Unique ID of the application we're getting a token for
   * @param scope - The scope of the token
   * @param cb - A callback which will be used to request a new token if it's not available in storage or via refresh token
   */
  private async getValidAccessTokenAndSave(
    id: string,
    params: string[][],
    cb: (uuid: string, params: string[][]) => Promise<AccessToken>,
  ): Promise<AccessToken> {
    let token = await this.getAccessTokenFromStorage(id);
    // If no access token then start new access token flow
    if (typeof token === 'undefined') {
      token = await cb.call(this, id, params);
    } else if (await this.isAccessTokenInvalid(token)) {
      // If there is an access token but its not valid or expired
      if (token.refreshToken) {
        // There is a refresh token
        try {
          token = await this.refreshClientAccessToken(id, token.refreshToken);
        } catch (error) {
          // If refresh token is rejected
          if (error.contains('401')) {
            token = await cb.call(this, id, params);
          } else {
            throw error;
          }
        }
      } else {
        // No refresh token so request a new access token
        token = await cb.call(this, id, params);
      }
    }

    return this.saveAccessTokenToStorage(id, token);
  }

  private deleteAccessToken() {
    clearLocalStorage();
  }

  /**
   * Request a new valid access token for the given application id using a
   * refresh token.
   *
   * @param id - ID of the given application
   * @param refreshToken - The refresh token included in the last valid token we had
   */
  private async refreshClientAccessToken(id: string, refreshToken: string) {
    const config = await this.getConfig();
    const url = new URL(config.token_endpoint);

    url.search = new URLSearchParams([
      ['grant_type', 'refresh_token'],
      ['refresh_token', refreshToken],
      ['client_id', id],
    ]).toString();

    const response = await fetch(url.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.ok) return this.normalizeTokenResponse(response);

    throw Error(response.statusText);
  }

  /**
   *  Request a new access token for the given application, presenting a login
   *  prompt if required.
   *
   * @param id - The id of the application we're requesting a token for
   * @param scope - The scope of the access token we're requesting
   */
  private async getNewAccessToken(id: string, params: string[][]) {
    const {
      secret: codeVerifier,
      hashed: codeChallenge,
    } = this.generateRandomChallengePair();
    const config = await this.getConfig();
    const url = new URL(config.authorization_endpoint);

    url.search = new URLSearchParams([
      ['redirect_uri', this.getRedirectURL()],
      ['client_id', id],
      ['code_challenge', codeChallenge],
      ['code_challenge_method', 'S256'],
      ['response_type', 'code'],
      ...params,
    ]).toString();

    const resultUrl = await this.launchWebAuthFlow(url.href);
    const code = this.extractCode(resultUrl);
    return this.exchangeCodeForToken(code, codeVerifier);
  }

  /**
   * Check an access token to see if it has expired yet.
   *
   * @param param0 - An object of type AccessToken
   */
  private isAccessTokenInvalid(token: AccessToken): boolean {
    const {accessTokenDate, expiresIn} = token;

    // If token expires in the next minute, consider it invalid
    return (
      new Date().getTime() >=
      accessTokenDate + expiresIn - TOKEN_EXPIRATION_SAFETY_BUFFER
    );
  }

  /**
   * Fetches an OpenId configuration from a given domain, which contains details
   * used to make an oauth2 request from a given service, such as the authorization
   * url or token url. Only will make a network request for the config if it
   * hasn't already been done.
   */

  private async getConfig(): Promise<OpenIdConfig> {
    const {domain, config} = this;
    const url = `https://${domain}/${OPENID_CONFIG_PATH}`;

    if (typeof config === 'undefined') {
      const result = await fetch(url);
      if (!result.ok) throw Error(result.statusText);
      return (this.config = await result.json());
    } else {
      return config;
    }
  }

  /**
   * Check local storage to see if we have a token saved.
   *
   * @param id - The application id associated to the token we want to get
   */
  private async getAccessTokenFromStorage(
    id: string,
  ): Promise<AccessToken | undefined> {
    const data = await getFromLocalStorage(id);
    if (typeof data === 'undefined') {
      return data;
    }

    return JSON.parse(data);
  }

  /**
   * Save an access token to local storage
   * @param id - The application id associated to the token we want to save
   * @param data - An AccessToken
   */
  private async saveAccessTokenToStorage(id: string, data: AccessToken) {
    await saveToLocalStorage(id, JSON.stringify(data));
    return data;
  }

  /**
   * Exchange a valid access token for a new access token for another Identity application
   *
   * @param accessToken - A valid access token
   * @param audienceId - The unique ID of the application you want a new access token from
   */
  private async exchangeToken(
    applicationId: string,
    params: string[][],
  ): Promise<AccessToken> {
    const {clientId} = this;
    const config = await this.getConfig();
    const {accessToken} = await this.authenticate();
    const url = new URL(config.token_endpoint);

    url.search = new URLSearchParams([
      ['grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange'],
      ['client_id', clientId],
      ['audience', applicationId],
      ['subject_token', accessToken],
      ['subject_token_type', 'urn:ietf:params:oauth:token-type:access_token'],
      ...params,
    ]).toString();

    const response = await fetch(url.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.ok) return this.normalizeTokenResponse(response);

    throw Error(response.statusText);
  }

  /**
   * Convert the response from the token endpoint into a valid AccessToken object
   * The expires_in time in the response is in seconds, coverted to ms here
   *
   * @param response - A successful response from the oauth/token endpoint
   */
  private async normalizeTokenResponse(
    response: Response,
  ): Promise<AccessToken> {
    const responseDateHeader = response.headers.get('Date');
    const accessTokenDate = responseDateHeader
      ? new Date(responseDateHeader).valueOf()
      : new Date().valueOf();
    const body: TokenResponseBody = await response.json();

    return {
      accessToken: body.access_token,
      accessTokenDate,
      expiresIn: body.expires_in * 1000,
      scope: body.scope,
      tokenType: body.token_type,
      issuedTokenType: body.issued_token_type,
      refreshToken: body.refresh_token,
      idToken: body.id_token,
    };
  }

  /**
   * Use Chrome's Identity API to get an oauth2 authorization code. This can be
   * optionally done via an interactive popup window that presents a login view.
   *
   * @param url - The oauth2 authorization URL
   */
  private launchWebAuthFlow(url: string): Promise<string> {
    const {webAuthFlowOptions} = this.options;
    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        {...webAuthFlowOptions, url},
        callbackURL => {
          if (chrome.runtime.lastError) {
            return reject(new Error(chrome.runtime.lastError.message));
          }

          return resolve(callbackURL);
        },
      );
    });
  }

  /**
   * Exchange an authorization code for an access token for application clientId
   * specified in the constructor
   *
   * @param code - An authorization code that is recieved from the RedirectURI of a successful login/authorization flow.
   * @param verifier - The code verifier code associated to the code challenge sent during the authorization flow.
   */
  private async exchangeCodeForToken(
    code: string,
    verifier: string,
  ): Promise<AccessToken> {
    const {clientId} = this;
    const config = await this.getConfig();
    const url = new URL(config.token_endpoint);

    url.search = new URLSearchParams([
      ['redirect_uri', this.getRedirectURL()],
      ['grant_type', 'authorization_code'],
      ['code_verifier', verifier],
      ['client_id', clientId],
      ['code', code],
    ]).toString();

    const response = await fetch(url.href, {method: 'POST'});

    if (response.ok) return this.normalizeTokenResponse(response);

    throw Error(response.statusText);
  }

  /**
   * After a successful authorization, the page is redirected. The URL of the
   * redirected page contains the authorization code. This method extracts that
   * code from the provided redirect URL.
   *
   * @param redirectURL - The redirectURL provided after authorization
   */
  private extractCode(redirectURL: string): string {
    const {searchParams} = new URL(redirectURL);
    const error = searchParams.get('error');
    const code = searchParams.get('code');

    if (error) {
      throw new Error(searchParams.get('error_description') || error);
    }

    if (!code) {
      throw new Error('RedirectURI code does not exist');
    }

    return code;
  }

  private generateRandomChallengePair() {
    const secret = this.base64URLEncode(crypto.randomBytes(32));
    const hashed = this.base64URLEncode(this.sha256(secret));
    return {secret, hashed};
  }

  private getRedirectURL() {
    return chrome.identity.getRedirectURL('auth0');
  }

  private base64URLEncode(str: Buffer) {
    return str
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/[=]/g, '');
  }

  private sha256(buffer: string) {
    return crypto
      .createHash('sha256')
      .update(buffer)
      .digest();
  }
}
