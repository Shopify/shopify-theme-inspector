import './styles/popup.css';
import {oauth2} from './background';
import {UserInfo} from './types';

const selectors = {
  popupSignedIn: '[data-popup-signed-in]',
  popupSignIn: '[data-popup-sign-in]',
  popupSignedInPrompt: '[data-signed-in-prompt]',
};

async function setSignedInPopup() {
  document.querySelector(selectors.popupSignedIn)!.classList.remove('hide');
  document.querySelector(selectors.popupSignIn)!.classList.add('hide');
  const userInfo: UserInfo = await oauth2.getUserInfo();
  document.querySelector(
    selectors.popupSignedInPrompt,
  )!.innerHTML = `You are logged in as <b>${userInfo.given_name}</b>`;
}

function setSignInPopup() {
  document.querySelector(selectors.popupSignIn)!.classList.remove('hide');
  document.querySelector(selectors.popupSignedIn)!.classList.add('hide');
}

async function setupPopupWindow() {
  const isLoggedIn = await oauth2.hasValidClientToken();

  if (isLoggedIn) {
    setSignedInPopup();
  } else {
    setSignInPopup();
  }
}

document.querySelector(`[data-sign-in]`)!.addEventListener('click', () => {
  chrome.runtime.sendMessage({
    type: 'authenticate',
  });
});

document.querySelector(`[data-sign-out]`)!.addEventListener('click', () => {
  chrome.runtime.sendMessage({
    type: 'signOut',
  });
  setSignInPopup();
});

setupPopupWindow();
