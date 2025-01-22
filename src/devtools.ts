import Toolbar from './components/toolbar';
import {
  getBrowserTheme,
  getProfileData,
} from './utils';

import './styles/devtools.css';

const selectors = {
  refreshButton: '[data-refresh-button]',
  flamegraphContainer: '[data-flamegraph-container]',
  loadingAnimation: '[data-loading-animation]',
  initialMessage: '[data-initial-message]',
  notProfilableMessage: '[data-page-not-profilable]',
  speedscopeWrapper: '[data-speedscope-wrapper]',
};


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

async function refreshPanel() {
  let node = document.querySelector(selectors.initialMessage)
  while (node && node.firstChild) {
    node.removeChild(node.firstChild);
  }
  document
    .querySelector(selectors.speedscopeWrapper)!
    .classList.add('loading-fade');
  document.querySelector(selectors.loadingAnimation)!.classList.remove('hide');
  document.querySelector(selectors.notProfilableMessage)!.classList.add('hide');

  const url = await getInspectedWindowURL();

  try {
    console.log('Getting profile data...');
    const profileData = await getProfileData(url);
    const speedscopeIframe = document.getElementById('speedscope-iframe') as HTMLIFrameElement;
    speedscopeIframe.contentWindow?.postMessage({ 
      type: 'loadProfile', 
      profileData: profileData
    }, '*');

    document
      .querySelector(selectors.speedscopeWrapper)!
      .classList.remove('hide');

  } catch (error) {
    console.error(error);
    document.querySelector(selectors.speedscopeWrapper)!.classList.add('hide');
    document
      .querySelector(selectors.notProfilableMessage)!
      .classList.remove('hide');
  }

  document.querySelector(selectors.loadingAnimation)!.classList.add('hide');
  document
    .querySelector(selectors.speedscopeWrapper)!
    .classList.remove('loading-fade');
}