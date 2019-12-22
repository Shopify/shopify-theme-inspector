import manifest from '../src/manifest.json';
import {mockProfileData} from './mock-data/mock-profile-data';
import openIdConfiguration from './mock-data/openid-configuration.json';
import {mockAccessToken} from './mock-data/mock-access-token';

export function mockChromeTabs(page: any) {
  return page.evaluateOnNewDocument(`
    window.chrome = window.chrome || {};
    window.chrome.tabs = window.chrome.tabs || {};

    window.chrome.tabs.query = function(options, cb) {
      cb([{url: 'https://shop1.myshopify.io/?profile_liquid=true'}])
    }
  `);
}

export function setDevtoolsEval(page: any) {
  return page.evaluateOnNewDocument(`
      window.chrome = window.chrome || {};
      window.chrome.devtools = window.chrome.devtools || {};
      window.chrome.devtools.inspectedWindow = window.chrome.devtools.inspectedWindow || {};
      window.chrome.devtools.panels = window.chrome.devtools.panels || {};

      window.chrome.devtools.inspectedWindow.eval = function(value, cb){
        if (value === "typeof window.Shopify === 'object'") {
          return cb(true)
        } else if (value === "document.location.href") {
          return cb('https://shop1.myshopify.io')
        }
      };
      window.chrome.devtools.panels.create = () => {};
      `);
}

export function mockChromeSendMessage(page: any) {
  return page.evaluateOnNewDocument(`
  window.chrome = window.chrome || {};
  window.chrome.runtime = window.chrome.runtime || {};

  window.chrome.runtime.sendMessage = function(payload, cb) {
    if(payload.type === 'request-core-access-token') {
      console.log('Mocked Send Message: request-core-access-token');
      return cb({token: JSON.parse('${JSON.stringify(mockAccessToken)}')});
    }

    return cb({error: 'Unable to mock Chrome Send Message'});
  }
  `);
}

export async function getExtensionId(): Promise<string> {
  const dummyPage = await browser.newPage();
  await dummyPage;

  const extensionName = manifest.name;

  const targets = await browser.targets();
  // @ts-ignore
  const extensionTarget = targets.find(({_targetInfo}) => {
    return (
      _targetInfo.title === extensionName &&
      _targetInfo.type === 'background_page'
    );
  });
  // @ts-ignore
  const extensionUrl = extensionTarget._targetInfo.url || '';
  const extensionId = extensionUrl.split('/')[2];
  return extensionId;
}

export async function setupRequestInterception(page: any) {
  await setDevtoolsEval(page);
  await page.setRequestInterception(true);

  page.on('request', (request: any) => {
    const url = new URL(request.url());

    if (url.searchParams.get('profile_liquid')) {
      request.respond({
        status: 200,
        contentType: 'text/html',
        body: mockProfileData,
      });
    } else if (url.pathname === '/.well-known/openid-configuration.json') {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(openIdConfiguration),
      });
    } else {
      request.continue();
    }
  });
}
