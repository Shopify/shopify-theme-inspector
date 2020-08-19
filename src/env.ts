export enum RenderBackend {
  Core = 'core',
  StorefrontRenderer = 'storefront-renderer',
}

export const env = {
  OAUTH2_DOMAIN: 'accounts.shopify.com',
  DEV_OAUTH2_DOMAIN: 'identity.myshopify.io',
  OAUTH2_CLIENT_ID: 'ff2a91a2-6854-449e-a37d-c03bcd181126',
  DEV_OAUTH2_CLIENT_ID: '1d7f695c-42e2-493a-a6dc-be12d4117d58',
  OAUTH2_SUBJECT_ID: {
    [RenderBackend.Core]:
      '7ee65a63608843c577db8b23c4d7316ea0a01bd2f7594f8a9c06ea668c1b775c',
    [RenderBackend.StorefrontRenderer]: 'ee139b3d-5861-4d45-b387-1bc3ada7811c',
  },
  DEV_OAUTH2_SUBJECT_ID: {
    [RenderBackend.Core]:
      'e92482cebb9bfb9fb5a0199cc770fde3de6c8d16b798ee73e36c9d815e070e52',
    [RenderBackend.StorefrontRenderer]: '73922abc-7637-443a-bad5-aee8c0b63ba6',
  },
  OAUTH_LOCAL_STORAGE_KEY: 'shopifyDevToolsAuthResults',

  renderBackend: RenderBackend.Core,
};
