export function getURL(): Promise<string> {
  return new Promise(resolve => {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
      const url = tabs[0].url;
      resolve(url);
    });
  });
}

export async function isDev(): Promise<boolean> {
  const url = await getURL();
  return url.includes('shop1.myshopify');
}

export function getThemeId() {
  return new Promise(resolve => {
    chrome.devtools.inspectedWindow.eval('Shopify.theme.id', (result: string) =>
      resolve(result),
    );
  });
}
