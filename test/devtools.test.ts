import chrome from 'sinon-chrome';

test('dummy test', () => {
  // const getUrl = function() {
  //   return chrome.runtime.getURL('popup-content.html');
  // };
  chrome.runtime.getURL.returns('http://localhost:1234/index.html');
  expect(true).toBe(true);
});
