// import nullthrows from 'nullthrows';
import './styles/popup.css';

try {
  document.querySelector(`[data-sign-in]`)!.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'authenticate',
    });
  });
} catch (error) {
  console.log(error);
}

try {
  document.querySelector(`[data-sign-out]`)!.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'signOut',
    });
  });
} catch (error) {
  console.log(error);
}
