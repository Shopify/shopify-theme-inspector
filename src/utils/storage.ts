const extensionId = chrome.runtime.id;
const prepend = `${extensionId.slice(0, 7)}-`;

export function saveToLocalStorage(key: string, value: string) {
  const prependedKey = prepend + key;

  return new Promise(resolve => {
    chrome.storage.local.set({[prependedKey]: value}, function() {
      resolve();
    });
  });
}

export function getFromLocalStorage(key: string): Promise<string | undefined> {
  const prependedKey = prepend + key;

  return new Promise(resolve => {
    chrome.storage.local.get([prependedKey], function(data) {
      return resolve(data[prependedKey]);
    });
  });
}

export function saveIdTokenToLocalStorage(value: string) {
  const key = 'idToken';

  return new Promise(resolve => {
    chrome.storage.local.set({[key]: value}, function() {
      resolve();
    });
  });
}

export function getIdTokenFromStorage(): Promise<string | undefined> {
  const key = 'idToken';

  return new Promise(resolve => {
    chrome.storage.local.get([key], function(data) {
      return resolve(data[key]);
    });
  });
}

export function clearLocalStorage() {
  chrome.storage.local.clear();
}
