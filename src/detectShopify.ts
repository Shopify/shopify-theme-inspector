// Use regex on document to test for a shopify site
// Look for a DOM script element that contains
//    "Shopify.shop ="
// This is auto-generated from content_for_header
const findShopifyScript = Array.from(
  document.querySelectorAll('script'),
).filter(script => {
  return /Shopify\.shop =/.test(script.textContent || '');
});

if (findShopifyScript.length) {
  chrome.runtime.sendMessage({
    type: 'detect-shopify',
    hasDetectedShopify: true,
  });
}
