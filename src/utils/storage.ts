const extensionId = chrome.runtime.id;
const prepend = `${extensionId.slice(0, 7)}-`;

export function saveToLocalStorage(key: string, value: string): Promise<void> {
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

export function clearLocalStorage() {
  chrome.storage.local.clear();
}
