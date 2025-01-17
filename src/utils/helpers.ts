const IS_CHROME = navigator.userAgent.indexOf('Firefox') < 0;

export function isDev(origin: string): boolean {
  return (
    origin.includes('shop1.myshopify') ||
    origin.includes('shop1-fast.myshopify') ||
    origin.includes('us.spin.dev')
  );
}

export function getThemeId(): Promise<string> {
  return new Promise(resolve => {
    chrome.devtools.inspectedWindow.eval(
      'Shopify.theme.id',
      {useContentScriptContext: false},
      (result: any, _: any) => {
        resolve(result as string);
      }
    );
  });
}

export type BrowserTheme = 'dark' | 'light';

// Copied from React Devtools https://github.com/facebook/react/blob/ba932a5ad953d7cb36bca273cfeab7eac5700f82/packages/react-devtools-extensions/src/utils.js#L45
export function getBrowserTheme(): BrowserTheme {
  if (IS_CHROME) {
    // chrome.devtools.panels added in Chrome 18.
    // chrome.devtools.panels.themeName added in Chrome 54.
    // @ts-ignore
    return chrome.devtools.panels.themeName === 'dark' ? 'dark' : 'light';
  } else if (chrome.devtools && chrome.devtools.panels) {
    // chrome.devtools.panels.themeName added in Firefox 55.
    // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/devtools.panels/themeName

    // @ts-ignore
    switch (chrome.devtools.panels.themeName) {
      case 'dark':
        return 'dark';
      default:
        return 'light';
    }
  } else {
    return 'light';
  }
}
