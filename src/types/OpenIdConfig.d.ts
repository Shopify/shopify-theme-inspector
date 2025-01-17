export interface OpenIdConfig {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint: string;
  jwks_uri: string;
  introspection_endpoint: string;
  revocation_endpoint: string;
}
