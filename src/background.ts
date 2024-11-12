import {env, RenderBackend} from './env';
import {isDev, Oauth2} from './utils';

const COLLABORATORS_SCOPE =
  'https://api.shopify.com/auth/partners.collaborator-relationships.readonly';

// Add persistent state management since service workers can be terminated
let shopifyEmployee = false;
let renderBackend = RenderBackend.StorefrontRenderer;

// Store state in chrome.storage for persistence
chrome.storage.local.get(['shopifyEmployee', 'renderBackend'], (result) => {
  shopifyEmployee = result.shopifyEmployee || false;
  renderBackend = result.renderBackend || RenderBackend.StorefrontRenderer;
});

function getOauth2Client(origin: string) {
  const identityDomain = isDev(origin)
    ? env.DEV_OAUTH2_DOMAIN
    : env.OAUTH2_DOMAIN;
  const clientId = isDev(origin)
    ? env.DEV_OAUTH2_CLIENT_ID
    : env.OAUTH2_CLIENT_ID;
  const clientAuthParams = [
    [
      'scope',
      `openid profile ${
        shopifyEmployee === true ? 'employee' : ''
      } ${Object.values(env.DEVTOOLS_SCOPE).join(' ')} ${COLLABORATORS_SCOPE}`,
    ],
  ];

  return new Oauth2(clientId, identityDomain, {
    clientAuthParams,
  });
}

// Update icon setting function to use chrome.action instead of chrome.pageAction
function setIconAndPopup(active: string, tabId: number) {
  const iconType = active ? 'shopify' : 'shopify-dimmed';
  chrome.action.setIcon({
    tabId,
    path: {
      '16': `images/16-${iconType}.png`,
      '32': `images/32-${iconType}.png`,
      '48': `images/48-${iconType}.png`,
      '128': `images/128-${iconType}.png`,
    },
  });

  if (active) {
    chrome.action.setPopup({tabId, popup: './popupAuthFlow.html'});
  }
}

function getSubjectId(oauth: Oauth2, origin: string) {
  if (isDev(origin)) {
    return oauth.fetchClientId(env.DEV_OAUTH2_SUBJECT_NAME[renderBackend]);
  }
  return Promise.resolve(env.OAUTH2_SUBJECT_ID[renderBackend]);
}

// Helper functions to handle async operations
async function handleSignOut(origin: string, sendResponse: Function) {
  try {
    await getOauth2Client(origin).logoutUser();
    sendResponse();
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

async function handleAuthentication(origin: string, sendResponse: Function) {
  try {
    await getOauth2Client(origin).authenticate();
    sendResponse({ success: true });
  } catch (error) {
    console.error('Authentication Error:', error.message);
    sendResponse({ success: false, error });
  }
}

async function handleCoreAccessToken(message: any, sendResponse: Function) {
  const { origin, isCore } = message;

  renderBackend = isCore ? RenderBackend.Core : RenderBackend.StorefrontRenderer;
  chrome.storage.local.set({ renderBackend });

  const params = [
    [
      'scope',
      `${shopifyEmployee === true ? 'employee' : ''} ${
        env.DEVTOOLS_SCOPE[renderBackend]
      } ${COLLABORATORS_SCOPE}`,
    ],
  ];

  const destination =
    renderBackend === RenderBackend.Core ? `${origin}/admin` : '';

  const oauth = getOauth2Client(origin);

  try {
    const subjectId = await getSubjectId(oauth, origin);
    const token = await oauth.getSubjectAccessToken(
      destination,
      subjectId,
      params
    );
    sendResponse({ token });
  } catch (error) {
    sendResponse({ error });
  }
}

async function handleUserName(origin: string, sendResponse: Function) {
  try {
    const userInfo = await getOauth2Client(origin).getUserInfo();
    sendResponse({ name: userInfo.given_name });
  } catch (error) {
    sendResponse({ error });
  }
}

async function handleAuthStatus(origin: string, sendResponse: Function) {
  try {
    const isLoggedIn = await getOauth2Client(origin).hasValidClientToken();
    sendResponse({ isLoggedIn });
  } catch (error) {
    sendResponse({ error });
  }
}

// Update message listeners to use async/await pattern
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'signOut') {
    handleSignOut(message.origin, sendResponse);
    return true;
  }

  if (message.type === 'detect-shopify-employee' &&
      sender.tab?.id &&
      message.hasDetectedShopifyEmployee === true) {
    shopifyEmployee = true;
    chrome.storage.local.set({ shopifyEmployee: true });
  }

  if (message.type === 'detect-shopify' && sender.tab?.id) {
    setIconAndPopup(message.hasDetectedShopify, sender.tab.id);
  }

  if (message.type === 'authenticate') {
    handleAuthentication(message.origin, sendResponse);
    return true;
  }

  if (message.type === 'request-core-access-token') {
    handleCoreAccessToken(message, sendResponse);
    return true;
  }

  if (message.type === 'request-user-name') {
    handleUserName(message.origin, sendResponse);
    return true;
  }

  if (message.type === 'request-auth-status') {
    handleAuthStatus(message.origin, sendResponse);
    return true;
  }

  return false;
});

// Add service worker activation listener
chrome.runtime.onInstalled.addListener(() => {
  // Initialize extension state
  chrome.storage.local.set({
    shopifyEmployee: false,
    renderBackend: RenderBackend.StorefrontRenderer,
  });
});
