const extensionId = chrome.runtime.id;
const prepend = `${extensionId.slice(0, 7)}-`;

export function saveLocal(key: string, value: string) {
  const prependedKey = prepend + key;

  return new Promise(resolve => {
    chrome.storage.local.set({[prependedKey]: value}, function() {
      resolve();
    });
  });
}

export function getFromLocal(key: string): Promise<string> {
  const prependedKey = prepend + key;

  return new Promise(resolve => {
    chrome.storage.local.get([prependedKey], function(data) {
      return resolve(data[prependedKey]);
    });
  });
}
