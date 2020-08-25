import {env} from './env';
import {isDev, Oauth2, getRenderBackend} from './utils';

const DEVTOOLS_SCOPE = 'https://api.shopify.com/auth/shop.storefront.devtools';
const COLLABORATORS_SCOPE =
  'https://api.shopify.com/auth/partners.collaborator-relationships.readonly';
let shopifyEmployee = false;

function getOauth2Client(origin: string) {
  const identityDomain = isDev(origin)
    ? env.DEV_OAUTH2_DOMAIN
    : env.OAUTH2_DOMAIN;
  const clientId = isDev(origin)
    ? env.DEV_OAUTH2_CLIENT_ID
    : env.OAUTH2_CLIENT_ID;
  const subjectId = isDev(origin)
    ? null
    : env.OAUTH2_SUBJECT_ID[env.renderBackend];
  const subjectName = isDev(origin)
    ? env.DEV_OAUTH2_SUBJECT_NAME[env.renderBackend]
    : null;
  const clientAuthParams = [
    [
      'scope',
      `openid profile ${
        shopifyEmployee === true ? 'employee' : ''
      } ${DEVTOOLS_SCOPE} ${COLLABORATORS_SCOPE}`,
    ],
  ];

  return new Oauth2(clientId, subjectId, subjectName, identityDomain, {
    clientAuthParams,
  });
}

// Change icon from colored to greyscale depending on whether or not Shopify has
// been detected
function setIconAndPopup(active: string, tabId: number) {
  const iconType = active ? 'shopify' : 'shopify-dimmed';
  chrome.pageAction.setIcon({
    tabId,
    path: {
      '16': `images/16-${iconType}.png`,
      '32': `images/32-${iconType}.png`,
      '48': `images/48-${iconType}.png`,
      '128': `images/128-${iconType}.png`,
    },
  });

  if (active) {
    chrome.pageAction.setPopup({tabId, popup: './popupAuthFlow.html'});
  }
  chrome.pageAction.show(tabId);
}

// Detect what storefront backend is used. Logic taken from Ubercorn.
if (typeof chrome.extension !== 'undefined') {
  chrome.webRequest.onHeadersReceived.addListener(
    response => {
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (response.url === tabs[0].url) {
          env.renderBackend = getRenderBackend(response);
          console.log('Detected render backend:', env.renderBackend, response);
        }
      });
    },
    {urls: ['http://*/*', 'https://*/*']},
    ['responseHeaders'],
  );
}

chrome.runtime.onMessage.addListener(({type, origin}, _, sendResponse) => {
  if (type !== 'signOut') return false;

  const oauth2 = getOauth2Client(origin);

  oauth2
    .logoutUser()
    .then(() => {
      sendResponse();
    })
    .catch(({message}) => {
      sendResponse({error: message});
    });

  return true;
});

// Create a listener which handles when detectShopify.js, which executes in the
// the same context as a tab, sends the results of of whether or not a Shopify
// employee was detected
chrome.runtime.onMessage.addListener((event, sender) => {
  if (
    sender.tab &&
    sender.tab.id &&
    event.type === 'detect-shopify-employee' &&
    event.hasDetectedShopifyEmployee === true
  ) {
    shopifyEmployee = true;
  }
});

// Create a listener which handles when detectShopify.js, which executes in the
// the same context as a tab, sends the results of of whether or not Shopify was
// detected
chrome.runtime.onMessage.addListener((event, sender) => {
  if (sender.tab && sender.tab.id && event.type === 'detect-shopify') {
    setIconAndPopup(event.hasDetectedShopify, sender.tab.id);
  }
});

// Create a listener which handles when the Sign In button is click from the popup
// or DevTools panel.
chrome.runtime.onMessage.addListener(({type, origin}, _, sendResponse) => {
  if (type !== 'authenticate') {
    return false;
  }

  const oauth2 = getOauth2Client(origin);

  oauth2
    .authenticate()
    .then(() => {
      sendResponse({success: true});
    })
    .catch(error => {
      console.log('Authentication Error:', error.message);
      sendResponse({success: false, error});
    });

  return true;
});

// Listen for 'request-core-access-token' event and respond to the messenger
// with a valid access token. This may trigger a login popup window if needed.
chrome.runtime.onMessage.addListener(({type, origin}, _, sendResponse) => {
  if (type !== 'request-core-access-token') {
    return false;
  }

  const oauth2 = getOauth2Client(origin);
  const params = [
    [
      'scope',
      `${
        shopifyEmployee === true ? 'employee' : ''
      } ${DEVTOOLS_SCOPE} ${COLLABORATORS_SCOPE}`,
    ],
  ];
  const destination = `${origin}/admin`;

  oauth2
    .getSubjectAccessToken(destination, params)
    .then(token => {
      sendResponse({token});
    })
    .catch(error => {
      sendResponse({error});
    });

  return true;
});

// Listen for the 'request-user-info' event and respond to the messenger
// with a the given_name of the currently logged in user.
chrome.runtime.onMessage.addListener(({type, origin}, _, sendResponse) => {
  if (type !== 'request-user-name') return false;

  const oauth2 = getOauth2Client(origin);

  oauth2
    .getUserInfo()
    .then(userInfo => {
      const name = userInfo.given_name;
      sendResponse({name});
    })
    .catch(error => {
      sendResponse({error});
    });

  return true;
});

// Listen for the 'request-auth-status' event and respond to the messenger
// with a boolean of user login status.
chrome.runtime.onMessage.addListener(({type, origin}, _, sendResponse) => {
  if (type !== 'request-auth-status') return false;

  const oauth2 = getOauth2Client(origin);

  oauth2
    .hasValidClientToken()
    .then(isLoggedIn => {
      sendResponse({isLoggedIn});
    })
    .catch(error => {
      sendResponse({error});
    });

  return true;
});
