import './styles/popup.css';

const selectors = {
  popupSignedIn: '[data-popup-signed-in]',
  popupSignIn: '[data-popup-sign-in]',
  popupSignedInPrompt: '[data-signed-in-prompt]',
};

async function setSignedInPopup() {
  document.querySelector(selectors.popupSignedIn)!.classList.remove('hide');
  document.querySelector(selectors.popupSignIn)!.classList.add('hide');
  const name = await getUserName();
  document.querySelector(
    selectors.popupSignedInPrompt,
  )!.innerHTML = `You are logged in as <b>${name}</b>`;
}

function setSignInPopup() {
  document.querySelector(selectors.popupSignIn)!.classList.remove('hide');
  document.querySelector(selectors.popupSignedIn)!.classList.add('hide');
}

async function setupPopupWindow() {
  const isLoggedIn = await getAuthStatus();

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

function getUserName(): Promise<String> {
  return new Promise((resolve, reject) => {
    return chrome.runtime.sendMessage(
      {type: 'request-user-info'},
      ({name, error}) => {
        if (error) {
          return reject(error);
        }
        return resolve(name);
      },
    );
  });
}

function getAuthStatus(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    return chrome.runtime.sendMessage(
      {type: 'request-auth-status'},
      ({isLoggedIn, error}) => {
        if (error) {
          return reject(error);
        }
        return resolve(isLoggedIn);
      },
    );
  });
}

setupPopupWindow();
