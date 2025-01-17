import { AuthResponse, AuthStatusResponse, UserNameResponse } from 'types/messages';
import './styles/popup.css';

const selectors = {
  popupSignedIn: '[data-popup-signed-in]',
  popupSignIn: '[data-popup-sign-in]',
  popupSignedInPrompt: '[data-signed-in-prompt]',
  loadingAnimation: '[data-loading-animation]',
};

const popupSignedIn = document.querySelector(selectors.popupSignedIn);
const popupSignIn = document.querySelector(selectors.popupSignIn);
const signInButton = document.querySelector(`[data-sign-in]`);
const signOutButton = document.querySelector(`[data-sign-out]`);

async function setSignedInPopup() {
  const popupSignedInPrompt = document.querySelector(
    `${selectors.popupSignedInPrompt} b`,
  );

  if (popupSignedIn) popupSignedIn.classList.remove('hide');
  if (popupSignIn) popupSignIn.classList.add('hide');

  const name = await getUserName();
  popupSignedInPrompt!.textContent = `${name}`;
}

function setSignInPopup() {
  if (popupSignIn) popupSignIn.classList.remove('hide');
  if (popupSignedIn) popupSignedIn.classList.add('hide');
}

// Active Tab is only available after certain methods, like pageAction, are invoked
// See https://developer.chrome.com/extensions/activeTab#invoking-activeTab for more info
function getActiveTabURL(): Promise<URL> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const url = tabs[0].url;

      if (url) {
        resolve(new URL(url));
      }

      reject(new Error('Unable to retrieve URL'));
    });
  });
}

async function setupPopupWindow() {
  const isLoggedIn = await getAuthStatus();

  if (isLoggedIn) {
    setSignedInPopup();
  } else {
    setSignInPopup();
  }
}

if (signInButton) {
  signInButton.addEventListener('click', async () => {
    const {origin} = await getActiveTabURL();
    chrome.runtime.sendMessage({
      type: 'authenticate',
      origin,
      }).then((response: AuthResponse) => {
        if (response && 'success' in response && response.success) {
          setSignedInPopup();
        }
        if (response && 'error' in response && response.error) {
          console.error('Authentication error:', response.error);
        }
        signInButton.querySelector('span')?.classList.add('hide');
        signInButton.querySelector('.loader')?.classList.remove('hide');
      });
  });
}

if (signOutButton) {
  signOutButton.addEventListener('click', async () => {
    const {origin} = await getActiveTabURL();
    chrome.runtime.sendMessage({
      type: 'signOut',
      origin,
      }).then((response: AuthResponse) => {
        if (response?.error) {
          console.error('Logout error:', response.error);
        } else {
          setSignInPopup();
        }
        signOutButton.querySelector('span')?.classList.add('hide');
        signOutButton.querySelector('.loader')?.classList.remove('hide'); 
      });
    
  });
}

async function getUserName(): Promise<string> {
  const {origin} = await getActiveTabURL();
  return chrome.runtime.sendMessage({
    type: 'request-user-name',
    origin,
  }).then((response: UserNameResponse) => {
    if (response?.error) {
      throw new Error(response.error);
    }
    return response.name || '';
  });
}

async function getAuthStatus(): Promise<boolean> {
  const {origin} = await getActiveTabURL();
  return chrome.runtime.sendMessage({
    type: 'request-auth-status',
    origin,
    }).then((response: AuthStatusResponse) => {
      if (response?.error) {
        return false;
    }
    return response.isLoggedIn || false;
  });
}

setupPopupWindow();
