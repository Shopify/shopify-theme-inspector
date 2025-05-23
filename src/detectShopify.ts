import type { DetectShopifyMessage, DetectShopifyEmployeeMessage } from './types/messages';

// Use regex on document to test for a Shopify site
// Look for a DOM script element that contains `Shopify.shop =`
// generated by {{content_for_header}}.
let hasDetectedShopify = false;

const scripts = document.querySelectorAll('script');
for (let i = 0; i < scripts.length; i++) {
  const content = scripts[i].textContent;
  if (typeof content === 'string') {
    if (/Shopify\.shop\s*=/.test(content)) {
      hasDetectedShopify = true;
      break;
    }
  }
}

const shopifyMessage: DetectShopifyMessage = {
  type: 'detect-shopify',
  hasDetectedShopify,
};

chrome.runtime.sendMessage(shopifyMessage);

if (document.location.search.includes('shopify_employee')) {
  const employeeMessage: DetectShopifyEmployeeMessage = {
    type: 'detect-shopify-employee',
    hasDetectedShopifyEmployee: true,
  };
  chrome.runtime.sendMessage(employeeMessage);
}
