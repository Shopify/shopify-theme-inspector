import {mockProfileData} from './mock-data/mock-profile-data';

const evalCondition = `
  if(value === 'window.location.href'){
    cb('https://shop1.myshopify.io/?profile_liquid=true');
  } else {
    cb(true)
  }`;

export function setDevtoolsEval(page: any) {
  return page.evaluateOnNewDocument(`
      window.chrome = window.chrome || {};
      window.chrome.devtools = window.chrome.devtools || {};
      window.chrome.devtools.inspectedWindow = window.chrome.devtools.inspectedWindow || {};
      window.chrome.devtools.panels = window.chrome.devtools.panels || {};

      window.chrome.devtools.inspectedWindow.eval = function(value, cb){${evalCondition}};
      window.chrome.devtools.panels.create = () => {};
      `);
}

export async function getExtensionId(): Promise<string> {
  const dummyPage = await browser.newPage();
  await dummyPage;

  const extensionName = 'Shopify DevTools';

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
  const [, , extensionId] = extensionUrl.split('/');
  return extensionId;
}

export async function setupRequestInterception() {
  await setDevtoolsEval(page);
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().endsWith('profile_liquid=true')) {
      request.respond({
        status: 200,
        contentType: 'text/html',
        body: mockProfileData,
      });
    } else {
      request.continue();
    }
  });
}
