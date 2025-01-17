export interface ClientTokenResponseBody {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  issued_token_type: string;
  refresh_token: string;
  id_token: string;
}

export interface ClientAccessToken {
  accessToken: string;
  accessTokenDate: number;
  expiresIn: number;
  scope: string;
  tokenType: string;
  refreshToken: string;
  issuedTokenType: string;
  idToken: string;
}

export interface SubjectTokenResponseBody {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  issued_token_type: string;
}

export interface SubjectAccessToken {
  accessToken: string;
  accessTokenDate: number;
  tokenType: string;
  expiresIn: number;
  scope: string;
  issuedTokenType: string;
}
