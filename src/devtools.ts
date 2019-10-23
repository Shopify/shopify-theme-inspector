import Toolbar from './components/toolbar';
import LiquidFlamegraph from './components/liquid-flamegraph';
import {toggleDisplay, getProfileData, setTotalTime} from './utils';

import './styles/main.css';

const selectors = {
  refreshButton: '[data-refresh-button]',
  flamegraphContainer: '[data-flamegraph-container]',
  loadingAnimation: '[data-loading-animation]',
  initialMessage: '[data-initial-message]',
};

const toolbar = new Toolbar();
let liquidFlamegraph: LiquidFlamegraph;

chrome.devtools.panels.create('Shopify', '', './devtools.html');

toolbar.refreshButton.addEventListener('click', refreshPanel);
toolbar.zoomOutButton.addEventListener('click', zoomOutFlamegraph);

async function refreshPanel() {
  document.querySelector(selectors.initialMessage)!.innerHTML = '';
  toggleDisplay(selectors.loadingAnimation);
  const profile = await getProfileData();
  toggleDisplay(selectors.loadingAnimation);

  liquidFlamegraph = new LiquidFlamegraph(
    document.querySelector(selectors.flamegraphContainer),
    profile,
  );

  setTimeout(function() {
    setTotalTime(profile.value);
  }, 300);
}

function zoomOutFlamegraph() {
  if (typeof liquidFlamegraph.flamegraph !== 'undefined') {
    liquidFlamegraph.flamegraph.resetZoom();
  }
}
