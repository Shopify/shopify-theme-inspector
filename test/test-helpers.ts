const evalCondition = `
  if(value === 'window.location.href'){
    cb('https://shop1.myshopify.io/?profile_liquid=true');
  } else {
    cb(true)
  }`;

export function setDevtoolsEval(page: any) {
  return page.evaluateOnNewDocument(`
      window.chrome = window.chrome || {};
      window.chrome.devtools = window.chrome.devtools || {};
      window.chrome.devtools.inspectedWindow = window.chrome.devtools.inspectedWindow || {};
      window.chrome.devtools.panels = window.chrome.devtools.panels || {};

      window.chrome.devtools.inspectedWindow.eval = function(value, cb){${evalCondition}};
      window.chrome.devtools.panels.create = () => {};
      `);
}
