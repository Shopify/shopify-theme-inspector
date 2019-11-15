/* eslint-disable babel/camelcase */

export interface TokenIntrospection {
  valid: boolean;
  scope: string;
  client_id: string;
  token_type: string;
  exp: number;
  iat: number;
  sub: string;
  aud: string;
  iss: 'https://accounts.shopify.com';
  dest: string;
  sid: string;
  act: {
    sub: string;
    iss: 'https://accounts.shopify.com';
  };
}
