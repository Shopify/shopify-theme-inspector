import nullthrows from 'nullthrows';

function injectCode(code: string) {
  const script = document.createElement('script');
  script.textContent = code;

  nullthrows(document.documentElement).appendChild(script);
}

// Listen for the message posted by the window from the code we are injecting
// below into the current page
window.addEventListener('message', function(evt) {
  if (evt.source !== window || !evt.data) {
    return;
  }
  if (typeof evt.data.hasDetectedShopify !== 'undefined') {
    chrome.runtime.sendMessage({
      hasDetectedShopify: evt.data.hasDetectedShopify,
      url: evt.data.url,
    });
  }
});

// We need to inject this detect code into the current page because even though
// this Content Script has access to the same DOM as the current page, it does
// not share the same JS global scope.
const detectShopify = `
  window.postMessage({
    hasDetectedShopify: typeof window.Shopify !== 'undefined',
    url: document.location.href,
  }, '*');
`;

injectCode(detectShopify);
