# Shopify Theme Inspector for Chrome

A Chrome DevTools plugin that visualizes Shopify Liquid render profiling data so you can triage long-running code and reduce server response times.

![Elements](https://user-images.githubusercontent.com/4837696/70237825-018e5780-1736-11ea-9fda-3691e73abf28.png)

## Install
Visit the Chrome Web Store and install the [Shopify Theme Inspector for Chrome](https://chrome.google.com/webstore/detail/shopify-theme-inspector-f/fndnankcflemoafdeboboehphmiijkgp).

## How to use
> 🙋‍♀️ In order to proceed, you will need a [Shopify single login account](https://help.shopify.com/en/manual/your-account/logging-in/sso-migration-guide).

1. Navigate to your Shopify store.
2. [Open Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/open).
3. Navigate to the Shopify tab, located in the top group of tabs in Chrome DevTools.
4. Click the **↻** (Load Profile Button) to request and view your Liquid profile [flamegraph](http://www.brendangregg.com/FlameGraphs/cpuflamegraphs.html#Description).

## FAQ
### Can I profile any Shopify store I want?
No, you can only profile stores that are linked to your [single login Shopify account](https://help.shopify.com/en/manual/your-account/logging-in/sso-migration-guide). If you can't log into the store admin with your Shopify account, you won't be able to request profiling data.

### I'm not seeing the Shopify tab in Chrome DevTools
The Shopify tab will only show when viewing a Shopify Online Store.

### I received an error page which says "This page cannot be profiled."

If you see this error, it may be because of one of the following conditions:
  * Your account does not have access to the current store you are trying to profile.
  * You might be trying to profile a checkout page, which is not supported by this extension.
  * There was an unhandled error in the request, e.g. timeout, lost connection, etc.

If it was none of the errors above you can right click on Shopify DevTools , inspect page, and view console for error details.

## Contributing
To learn more about how to contribute to this project check out the [contributing](https://github.com/Shopify/shopify-devtools/blob/master/CONTRIBUTING.md) documentation.

If you find a bug please open an issue [here](https://github.com/Shopify/shopify-devtools/issues/new).

If you would like to request a feature, checkout out the [feature request](https://github.com/Shopify/shopify-devtools/blob/master/FEATURE_REQUEST.md) documentation.



