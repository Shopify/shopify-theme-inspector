export enum RenderBackend {
  StorefrontRenderer = 'storefront-renderer',
}

export const env = {
  OAUTH2_DOMAIN: 'accounts.shopify.com',
  DEV_OAUTH2_DOMAIN: 'identity.myshopify.io',
  OAUTH2_CLIENT_ID: 'ff2a91a2-6854-449e-a37d-c03bcd181126',
  DEV_OAUTH2_CLIENT_ID: '1d7f695c-42e2-493a-a6dc-be12d4117d58',
  OAUTH2_SUBJECT_ID: {
    [RenderBackend.StorefrontRenderer]: 'ee139b3d-5861-4d45-b387-1bc3ada7811c',
  },
  DEV_OAUTH2_SUBJECT_NAME: {
    [RenderBackend.StorefrontRenderer]: 'storefront-renderer-development',
  },
  DEVTOOLS_SCOPE: {
    [RenderBackend.StorefrontRenderer]:
      'https://api.shopify.com/auth/shop.storefront-renderer.devtools',
  },
  OAUTH_LOCAL_STORAGE_KEY: 'shopifyDevToolsAuthResults',
};
