import {env} from './env';
import {isDev, Oauth2} from './utils';

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
    chrome.pageAction.show(tabId);
  } else {
    chrome.pageAction.hide(tabId);
  }
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
  const params = [['scope', 'openid'], ['device', 'chrome-extension']];

  const identityDomain = isDev ? env.DEV_OAUTH2_DOMAIN : env.OAUTH2_DOMAIN;
  const clientId = isDev ? env.DEV_OAUTH2_CLIENT_ID : env.OAUTH2_CLIENT_ID;
  const config = await Oauth2.fetchOpenIdConfig(identityDomain);
  const oauth2 = new Oauth2(clientId, config);

  try {
    const authResults = JSON.stringify(await oauth2.authenticate(params));
    localStorage[env.OAUTH_LOCAL_STORAGE_KEY] = authResults;
    console.log('Login Successful', authResults);
  } catch (error) {
    console.log('Login Error:', error.message);
  }
});
