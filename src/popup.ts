import nullthrows from 'nullthrows';
import './styles/popup.css';

nullthrows(document.getElementById('signInButton')).addEventListener(
  'click',
  () => {
    chrome.runtime.sendMessage({
      type: 'authenticate',
    });
  },
);
