export function getCurrentTabURL(): Promise<URL> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
      const url = tabs[0].url;

      if (url) {
        resolve(new URL(url));
      }

      reject(new Error('Unable to retrieve URL'));
    });
  });
}

export async function isDev(): Promise<boolean> {
  const {href} = await getCurrentTabURL();
  return href.includes('shop1.myshopify');
}

export function getThemeId() {
  return new Promise(resolve => {
    chrome.devtools.inspectedWindow.eval('Shopify.theme.id', (result: string) =>
      resolve(result),
    );
  });
}
