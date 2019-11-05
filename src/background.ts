import {env} from './env';
import {isDev, Oauth2, getCurrentTabURL} from './utils';

const DEVTOOLS_SCOPE = 'https://api.shopify.com/auth/shop.storefront.devtools';

const identityDomain = isDev ? env.DEV_OAUTH2_DOMAIN : env.OAUTH2_DOMAIN;
const clientId = isDev ? env.DEV_OAUTH2_CLIENT_ID : env.OAUTH2_CLIENT_ID;
const subjectId = isDev ? env.DEV_OAUTH2_SUBJECT_ID : env.OAUTH2_SUBJECT_ID;

const clientAuthParams = [['scope', `openid profile email ${DEVTOOLS_SCOPE}`]];
const oauth2 = new Oauth2(clientId, identityDomain, {clientAuthParams});

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
    chrome.pageAction.setPopup({tabId, popup: './popupSignIn.html'});
  } else {
    chrome.pageAction.setPopup({tabId, popup: './popup.html'});
  }

  chrome.pageAction.show(tabId);
}

// Create a listener which handles when detectShopify.js, which executes in the
// the same context as a tab, sends the results of of whether or not Shopify was
// detected
chrome.runtime.onMessage.addListener((event, sender) => {
  if (sender.tab && sender.tab.id) {
    setIconAndPopup(event.hasDetectedShopify, sender.tab.id);
  }
});

// Create a listener which handles when the Sign In button is click from the popup
// or DevTools panel.
chrome.runtime.onMessage.addListener(async event => {
  if (event.type !== 'authenticate') {
    return;
  }

  try {
    await oauth2.authenticate();
  } catch (error) {
    console.log('Authentication Error:', error.message);
  }
});

// Listen for 'request-core-access-token' event and respond to the messenger
// with a valid Shopify Core access token. This may trigger a login popup window
// if needed.
chrome.runtime.onMessage.addListener((event, _, sendResponse) => {
  if (event.type !== 'request-core-access-token') {
    return false;
  }

  getCurrentTabURL()
    .then(({origin}) => {
      const params = [
        ['destination', `${origin}/admin`],
        ['scope', DEVTOOLS_SCOPE],
      ];
      return oauth2.getSubjectAccessToken(subjectId, params);
    })
    .then(token => {
      sendResponse({token});
    })
    .catch(error => {
      sendResponse({error});
    });

  return true;
});
