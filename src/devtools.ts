import escape from 'lodash.escape';
import {RenderBackend} from './env';
import Toolbar from './components/toolbar';
import LiquidFlamegraph from './components/liquid-flamegraph';
import {
  getProfileData,
  setTotalTime,
  setRenderingBackend,
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
      `document.location.host + document.location.pathname + document.location.search`,
      function(currentUrl: string) {
        resolve(new URL(`https://${currentUrl}`));
      },
    );
  });
}

function determineRenderBackend(): Promise<boolean> {
  return new Promise(resolve => {
    chrome.devtools.inspectedWindow.eval(
      `
      function determineRenderBackend() {
        const scripts = document.querySelectorAll('script');
        let isCore = false;
        for (let i = 0; i < scripts.length; i++) {
          const content = scripts[i].textContent;
          if (typeof content === 'string') {
            if (/BOOMR\\.application\\s*=\\s*"core"/.test(content)) {
              isCore = true;
              break;
            }
          }
        }
        return isCore
      }
      determineRenderBackend()
      `,
      function(isCore: boolean) {
        resolve(isCore);
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
  const isCore = await determineRenderBackend();

  const renderingBackend = isCore
    ? RenderBackend.Core
    : RenderBackend.StorefrontRenderer;

  try {
    profile = await getProfileData(url, isCore);

    liquidFlamegraph = new LiquidFlamegraph(
      document.querySelector(selectors.flamegraphContainer),
      profile,
      url,
    );

    // All events happening here are synchronous. The set timeout is for UI
    // purposes so that timing information gets displayed after the flamegraph is shown.
    setTimeout(function() {
      setTotalTime(profile.value);
      setRenderingBackend(renderingBackend);
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
