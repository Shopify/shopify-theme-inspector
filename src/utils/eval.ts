export function getURL(): Promise<string> {
  return new Promise(resolve => {
    chrome.devtools.inspectedWindow.eval(
      'window.location.href',
      (result: string) => resolve(result),
    );
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
