// Change icon from colored to greyscale depending on whether or not Shopify has
// been detected
function setIcon(active: boolean, tabId: number) {
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
}

// Create a listener which handles when detectShopify.js, which executes in the
// the same context as a tab, sends the results of of whether or not Shopify was
// detected
chrome.runtime.onMessage.addListener((request, sender) => {
  if (sender.tab && sender.tab.id) {
    setIcon(request.hasDetectedShopify, sender.tab.id);
  }
});
