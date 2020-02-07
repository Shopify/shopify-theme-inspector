import {escape} from 'lodash';
import Toolbar from './components/toolbar';
import LiquidFlamegraph from './components/liquid-flamegraph';
import {
  getProfileData,
  setTotalTime,
  getBrowserTheme,
  emptyHTMLNode,
} from './utils';

import './styles/devtools.css';

const selectors = {
  refreshButton: '[data-refresh-button]',
  flamegraphContainer: '[data-flamegraph-container]',
  loadingAnimation: '[data-loading-animation]',
  initialMessage: '[data-initial-message]',
  notProfilableMessage: '[data-page-not-profilable]',
  flamegraphWrapper: '[data-flamegraph-wrapper]',
  searchButton: '[data-search-button]',
  clearButton: '[data-clear-button]',
  searchParam: '[data-search-param]',
};

let liquidFlamegraph: LiquidFlamegraph;

chrome.devtools.inspectedWindow.eval(
  `typeof window.Shopify === 'object'`,
  function(isShopifyStore: boolean) {
    if (isShopifyStore) {
      chrome.devtools.panels.create('Shopify', '', './devtools.html');

      if (getBrowserTheme() === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }

      addEventListenerToButtons();
    }
  },
);

function addEventListenerToButtons() {
  const toolbar = new Toolbar();

  toolbar.refreshButton.addEventListener('click', refreshPanel);
  toolbar.zoomOutButton.addEventListener('click', zoomOutFlamegraph);

  document
    .querySelector(selectors.searchButton)!
    .addEventListener('click', function(event) {
      event.preventDefault();
      search();
    });

  document
    .querySelector(selectors.clearButton)!
    .addEventListener('click', function(event) {
      event.preventDefault();
      clear();
    });
}

function search() {
  const searchParam = (document.querySelector(
    selectors.searchParam,
  ) as HTMLInputElement).value;

  if (typeof liquidFlamegraph.flamegraph !== 'undefined') {
    liquidFlamegraph.flamegraph.search(escape(searchParam));
  }
}

function clear() {
  (document.querySelector(selectors.searchParam) as HTMLInputElement).value =
    '';

  if (typeof liquidFlamegraph.flamegraph !== 'undefined') {
    liquidFlamegraph.flamegraph.clear();
  }
}

function getInspectedWindowURL(): Promise<URL> {
  return new Promise(resolve => {
    chrome.devtools.inspectedWindow.eval(
      'Shopify.shop + document.location.pathname',
      function(currentUrl: string) {
        resolve(new URL(`https://${currentUrl}`));
      },
    );
  });
}

async function refreshPanel() {
  emptyHTMLNode(document.querySelector(selectors.initialMessage));
  document
    .querySelector(selectors.flamegraphWrapper)!
    .classList.add('loading-fade');
  document.querySelector(selectors.loadingAnimation)!.classList.remove('hide');
  document.querySelector(selectors.notProfilableMessage)!.classList.add('hide');

  let profile: FormattedProfileData;
  const url = await getInspectedWindowURL();

  try {
    try {
      // Try first to make an unauthorized request if the beta flag is enabled
      profile = await getProfileData(url, false);
    } catch (error) {
      // If no profiling data exists in first request, try an authorized request
      console.error(error);
      profile = await getProfileData(url);
    }

    liquidFlamegraph = new LiquidFlamegraph(
      document.querySelector(selectors.flamegraphContainer),
      profile,
      url,
    );

    // All events happening here are synchronous. The set timeout is for UI
    // purposes so that timing information gets displayed after the flamegraph is shown.
    setTimeout(function() {
      setTotalTime(profile.value);
    }, 300);

    document
      .querySelector(selectors.flamegraphWrapper)!
      .classList.remove('hide');
  } catch (error) {
    console.error(error);
    document.querySelector(selectors.flamegraphWrapper)!.classList.add('hide');
    document
      .querySelector(selectors.notProfilableMessage)!
      .classList.remove('hide');
  }

  document.querySelector(selectors.loadingAnimation)!.classList.add('hide');
  document
    .querySelector(selectors.flamegraphWrapper)!
    .classList.remove('loading-fade');
}

function zoomOutFlamegraph() {
  if (typeof liquidFlamegraph.flamegraph !== 'undefined') {
    liquidFlamegraph.flamegraph.resetZoom();
  }
}
