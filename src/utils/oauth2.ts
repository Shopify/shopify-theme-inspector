import crypto from 'crypto';
import {boundMethod} from 'autobind-decorator';
import {OpenIdConfig, AccessToken} from '../types';
import {getURL} from '.';

const OPENID_CONFIG_PATH = '.well-known/openid-configuration.json';

export class Oauth2 {
  // Prettier complains if this is not here

  /**
   * Fetches an OpenId configuration from a given domain, which contains details
   * used to make an oauth2 request from a given service, such as the authorization
   * url or token url.
   *
   * @param domain - The domain which you want to fetch the config from.
   */

  static async fetchOpenIdConfig(domain: string): Promise<OpenIdConfig> {
    const result = await fetch(`https://${domain}/${OPENID_CONFIG_PATH}`);

    if (result.ok) return result.json();

    throw Error(result.statusText);
  }

  clientId: string;
  config: OpenIdConfig;

  public constructor(clientId: string, config: OpenIdConfig) {
    this.clientId = clientId;
    this.config = config;
  }

  /**
   * Request a new oauth2 access token from the clientId specified in the constructor
   *
   * @param params - Custom query parameters you want to include in the request
   * @param interactive - Enable and interactive login window using Chrome Identity API
   */
  @boundMethod
  public async authenticate(params: string[][] = [], interactive = true) {
    const {clientId} = this;
    const {secret, hashed} = this.generateRandomChallengePair();
    const url = new URL(this.config.authorization_endpoint);

    url.search = new URLSearchParams([
      ['redirect_uri', this.getRedirectURL()],
      ['client_id', clientId],
      ['code_challenge', hashed],
      ['code_challenge_method', 'S256'],
      ['response_type', 'code'],
      ...params,
    ]).toString();

    const resultUrl = await this.getAuthResult(url.href, interactive);
    const code = this.extractCode(resultUrl);
    return this.exchangeCodeForToken(code, secret);
  }

  /**
   * Exchange a valid access token for a new access token for another Identity application
   *
   * @param accessToken - A valid access token
   * @param audienceId - The unique ID of the application you want a new access token from
   */
  public async exchangeTokenForToken(
    accessToken: string,
    applicationId: string,
  ): Promise<AccessToken> {
    const {clientId} = this;
    const scopes = ['https://api.shopify.com/auth/shop.storefront.devtools'];
    const url = new URL(this.config.token_endpoint);

    url.search = new URLSearchParams([
      ['grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange'],
      ['client_id', clientId],
      ['audience', applicationId],
      ['scope', scopes.join('%20')],
      ['subject_token', accessToken],
      ['subject_token_type', 'urn:ietf:params:oauth:token-type:access_token'],
      ['destination', `${await getURL()}admin`],
    ]).toString();

    const result = await fetch(url.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    });

    if (result.ok) return result.json();

    throw Error(result.statusText);
  }

  /**
   * Use Chrome's Identity API to get an oauth2 authorization code. This can be
   * optionally done via an interactive popup window that presents a login view.
   *
   * @param url - The oauth2 authorization URL
   * @param interactive - Enable and interactive login window
   */
  private getAuthResult(url: string, interactive: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow({url, interactive}, callbackURL => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }

        return resolve(callbackURL);
      });
    });
  }

  /**
   * Exchange an authorization code for an access token for application clientId
   * specified in the constructor
   *
   * @param code - An authorization code that is recieved from the RedirectURI of a successful login/authorization flow.
   * @param verifier - The code verifier code associated to the code challenge sent during the authorization flow.
   */
  @boundMethod
  private async exchangeCodeForToken(
    code: string,
    verifier: string,
  ): Promise<AccessToken> {
    const {clientId} = this;
    const url = new URL(this.config.token_endpoint);

    url.search = new URLSearchParams([
      ['redirect_uri', this.getRedirectURL()],
      ['grant_type', 'authorization_code'],
      ['code_verifier', verifier],
      ['client_id', clientId],
      ['code', code],
    ]).toString();

    const result = await fetch(url.href, {method: 'POST'});

    if (result.ok) return result.json();

    throw Error(result.statusText);
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
