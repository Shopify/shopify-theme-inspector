import './styles/popup.css';

const selectors = {
  popupSignedIn: '[data-popup-signed-in]',
  popupSignIn: '[data-popup-sign-in]',
  popupSignedInPrompt: '[data-signed-in-prompt]',
};

const popupSignedIn = document.querySelector(selectors.popupSignedIn);
const popupSignIn = document.querySelector(selectors.popupSignIn);
const signInButton = document.querySelector(`[data-sign-in]`);
const signOutButton = document.querySelector(`[data-sign-out]`);

async function setSignedInPopup() {
  const popupSignedInPrompt = document.querySelector(
    selectors.popupSignedInPrompt,
  );

  if (popupSignedIn) popupSignedIn.classList.remove('hide');
  if (popupSignIn) popupSignIn.classList.add('hide');

  const name = await getUserName();
  if (popupSignedInPrompt)
    popupSignedInPrompt.innerHTML = `You are logged in as <b>${name}</b>`;
}

function setSignInPopup() {
  if (popupSignIn) popupSignIn.classList.remove('hide');
  if (popupSignedIn) popupSignedIn.classList.add('hide');
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
  signInButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'authenticate',
    });
  });
}

if (signOutButton) {
  signOutButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({type: 'signOut'}, payload => {
      if (payload && payload.error) {
        console.error('Logout error:', payload.error);
      } else {
        setSignInPopup();
      }
    });
  });
}

function getUserName(): Promise<String> {
  return new Promise((resolve, reject) => {
    return chrome.runtime.sendMessage(
      {type: 'request-user-name'},
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
