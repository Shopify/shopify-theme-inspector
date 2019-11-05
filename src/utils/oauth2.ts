import crypto from 'crypto';
import {boundMethod} from 'autobind-decorator';
import {OpenIdConfig} from '../types';

const OPENID_CONFIG_PATH = '.well-known/openid-configuration.json';

export class Oauth2 {
  static async fetchOpenIdConfig(domain) {
    const response = await fetch(`https://${domain}/${OPENID_CONFIG_PATH}`);

    return response.json();
  }

  clientId: string;
  config: OpenIdConfig;

  public constructor(clientId, config) {
    this.clientId = clientId;
    this.config = config;
  }

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

  private getAuthResult(url, interactive) {
    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow({url, interactive}, callbackURL => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }

        return resolve(callbackURL);
      });
    });
  }

  @boundMethod
  private async exchangeCodeForToken(code, verifier) {
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

  private extractCode(responseURL) {
    const {searchParams} = new URL(responseURL);
    const error = searchParams.get('error');
    const code = searchParams.get('code');

    if (error) {
      throw new Error(searchParams.get('error_description') || error);
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

  private base64URLEncode(str) {
    return str
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/[=]/g, '');
  }

  private sha256(buffer) {
    return crypto
      .createHash('sha256')
      .update(buffer)
      .digest();
  }
}

export default ChromeClient;
