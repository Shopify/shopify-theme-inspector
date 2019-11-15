import {AccessToken} from '../../src/types';

export const mockAccessToken = {
  accessToken: '123456789',
  accessTokenDate: new Date().getTime() - 100000,
  expiresIn: new Date().getTime() + 100000,
  scope: 'openid email',
  tokenType: 'Access',
  refreshToken: '123456789',
  issuedTokenType: 'Bearer',
} as AccessToken;
