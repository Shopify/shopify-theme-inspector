import { SubjectAccessToken } from './AccessToken';

export interface DetectShopifyMessage {
  type: 'detect-shopify';
  hasDetectedShopify: boolean;
}

export interface DetectShopifyEmployeeMessage {
  type: 'detect-shopify-employee';
  hasDetectedShopifyEmployee: boolean;
}

export interface AuthMessage {
  type: 'authenticate';
  origin: string;
}

export interface SignOutMessage {
  type: 'signOut';
  origin: string;
}

export interface RequestCoreAccessTokenMessage {
  type: 'request-core-access-token';
  origin: string;
}

export interface RequestUserNameMessage {
  type: 'request-user-name';
  origin: string;
}

export interface RequestAuthStatusMessage {
  type: 'request-auth-status';
  origin: string;
}

// Response Types
export interface CoreAccessTokenResponse {
  token?: SubjectAccessToken;
  error?: string;
}

export interface AuthResponse {
  success?: boolean;
  error?: any;
}

export interface UserNameResponse {
  name?: string;
  nickname?: string;
  error?: string;
}

export interface AuthStatusResponse {
  isLoggedIn?: boolean;
  error?: string;
}

export type ChromeMessage = 
  | DetectShopifyMessage 
  | DetectShopifyEmployeeMessage
  | AuthMessage
  | SignOutMessage
  | RequestCoreAccessTokenMessage
  | RequestUserNameMessage
  | RequestAuthStatusMessage; 