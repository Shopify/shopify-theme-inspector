/* eslint-disable babel/camelcase */
export interface TokenResponseBody {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  issued_token_type: string;
  refresh_token: string;
  id_token: string;
}

export interface AccessToken {
  accessToken: string;
  accessTokenDate: number;
  expiresIn: number;
  scope: string;
  tokenType: string;
  refreshToken: string;
  issuedTokenType: string;
  idToken: string;
}
