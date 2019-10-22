import Toolbar from './components/toolbar';
import LiquidFlamegraph from './components/liquid-flamegraph';
import {domHelpers, getProfileData} from './utils';

import './styles/main.css';

const selectors = {
  refreshButton: '[data-refresh-button]',
  flamegraphContainer: '[data-flamegraph-container]',
  loadingAnimation: '[data-loading-animation]',
  initialMessage: '[data-initial-message]',
};

let liquidFlamegraph: LiquidFlamegraph;

chrome.devtools.inspectedWindow.eval(
  `typeof window.Shopify === 'object'`,
  function(isShopifyStore: boolean) {
    if (isShopifyStore) {
      chrome.devtools.panels.create('Shopify', '', './devtools.html');
      const toolbar = new Toolbar();

      toolbar.refreshButton.addEventListener('click', refreshPanel);
      toolbar.zoomOutButton.addEventListener('click', zoomOutFlamegraph);
    }
  },
);

async function refreshPanel() {
  document.querySelector(selectors.initialMessage)!.innerHTML = '';
  domHelpers.toggleDisplay(selectors.loadingAnimation);
  const profile = await getProfileData();
  domHelpers.toggleDisplay(selectors.loadingAnimation);

  liquidFlamegraph = new LiquidFlamegraph(
    document.querySelector(selectors.flamegraphContainer),
    profile,
  );

  setTimeout(function() {
    domHelpers.setTotalTime(profile.value);
  }, 300);
}

function zoomOutFlamegraph() {
  if (typeof liquidFlamegraph.flamegraph !== 'undefined') {
    liquidFlamegraph.flamegraph.resetZoom();
  }
}
