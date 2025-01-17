import {env, RenderBackend} from './env';
import {isDev, Oauth2} from './utils';
import type { ChromeMessage } from './types/messages';

const COLLABORATORS_SCOPE =
  'https://api.shopify.com/auth/partners.collaborator-relationships.readonly';
let shopifyEmployee = false;
let renderBackend = RenderBackend.StorefrontRenderer;

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

// Change icon from colored to greyscale depending on whether or not Shopify has
// been detected
function setIconAndPopup(active: boolean, tabId: number) {
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
  chrome.action.enable(tabId);
}

function getSubjectId(oauth: Oauth2, origin: string) {
  if (isDev(origin)) {
    return oauth.fetchClientId(env.DEV_OAUTH2_SUBJECT_NAME[renderBackend]);
  }
  return Promise.resolve(env.OAUTH2_SUBJECT_ID[renderBackend]);
}

chrome.runtime.onMessage.addListener((message: ChromeMessage, sender, sendResponse) => {
  switch (message.type) {
    case 'detect-shopify':
      if (sender.tab?.id) {
        setIconAndPopup(message.hasDetectedShopify, sender.tab.id);
      }
      break;
      
    case 'detect-shopify-employee':
      if (message.hasDetectedShopifyEmployee) {
        shopifyEmployee = true;
      }
      break;
      
    case 'signOut':
      getOauth2Client(message.origin)
        .logoutUser()
        .then(() => {
          sendResponse();
        })
        .catch(({message}) => {
          sendResponse({error: message});
        });
      return true;
      
    case 'authenticate':
      getOauth2Client(message.origin)
        .authenticate()
        .then(() => {
          sendResponse({success: true});
        })
        .catch(error => {
          console.log('Authentication Error:', error.message);
          sendResponse({success: false, error});
        });
      return true;
      
    case 'request-core-access-token': {
      const params = [
        [
          'scope',
          `${shopifyEmployee === true ? 'employee' : ''} ${
            env.DEVTOOLS_SCOPE[RenderBackend.StorefrontRenderer]
          } ${COLLABORATORS_SCOPE}`,
        ],
      ];

      const oauth = getOauth2Client(message.origin);

      getSubjectId(oauth, message.origin)
        .then(subjectId => {
          return oauth.getSubjectAccessToken(subjectId, params);
        })
        .then(token => {
          sendResponse({token});
        })
        .catch(error => {
          sendResponse({error});
        });
      return true;
    }

    case 'request-user-name': {
      getOauth2Client(message.origin)
        .getUserInfo()
        .then(userInfo => {
          const name = userInfo.given_name;
          sendResponse({name});
        })
        .catch(error => {
          sendResponse({error});
        });
      return true;
    }

    case 'request-auth-status': {
      getOauth2Client(message.origin)
        .hasValidClientToken()
        .then(isLoggedIn => {
          sendResponse({isLoggedIn});
        })
        .catch(error => {
          sendResponse({error});
        });
      return true;
    }
  }
});
