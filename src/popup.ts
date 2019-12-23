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
    chrome.runtime.sendMessage(
      {
        type: 'authenticate',
        origin,
      },
      payload => {
        if (payload.success) {
          setSignedInPopup();
        }
      },
    );
    signInButton.innerHTML =
      '<div data-loading-animation class="loader" style="display: inline-block"></div>';
  });
}

if (signOutButton) {
  signOutButton.addEventListener('click', async () => {
    const {origin} = await getActiveTabURL();
    chrome.runtime.sendMessage({type: 'signOut', origin}, payload => {
      if (payload && payload.error) {
        console.error('Logout error:', payload.error);
      } else {
        setSignInPopup();
      }
    });
    signOutButton.innerHTML =
      '<div data-loading-animation class="loader" style="display: inline-block"></div>';
  });
}

async function getUserName(): Promise<String> {
  const {origin} = await getActiveTabURL();

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {type: 'request-user-name', origin},
      ({name, error}) => {
        if (error) {
          return reject(error);
        }
        return resolve(name);
      },
    );
  });
}

async function getAuthStatus(): Promise<boolean> {
  const {origin} = await getActiveTabURL();

  return new Promise(resolve => {
    return chrome.runtime.sendMessage(
      {type: 'request-auth-status', origin},
      ({isLoggedIn, error}) => {
        if (error) {
          return resolve(false);
        }
        return resolve(isLoggedIn);
      },
    );
  });
}

setupPopupWindow();
