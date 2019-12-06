# Shopify Theme Inspector for Chrome

A Chrome DevTools plugin that visualizes Shopify Liquid render profiling data so you can triage long-running code and reduce server response times.

![Elements](https://user-images.githubusercontent.com/4837696/70237825-018e5780-1736-11ea-9fda-3691e73abf28.png)

## Install
Visit the Chrome Web Store and install the [Shopify Theme Inspector for Chrome](https://chrome.google.com/webstore/detail/shopify-devtools/fndnankcflemoafdeboboehphmiijkgp).

## How to use
1. Navigate to any page of your Shopify Online store.
1. Click the Shopify icon in the top right corner of your browser (the extension) and log into your Shopify account to authenticate yourself as an admin or staff member of the store.
2. Open Chrome DevTools using `command(⌘) + shift + C` on a Mac and `control + shift + J` for Windows.
3. Navigate to the Shopify panel which should be visible in the same tab group as `Elements` and `Network`. If it is not visible click the `>>` icon to the right of the panel names and select Shopify.
4. Click the `↻` **Load Profile Button** to collect profiling data and view the Liquid profiling flamegraph. Click [here](http://www.brendangregg.com/FlameGraphs/cpuflamegraphs.html#Description) for more contexts on flamegraphs and how to read them.

## FAQ
### I'm not seeing the Shopify tab in Chrome DevTools
The Shopify Theme Inspector tab will only show up when viewing a page on a Shopify Online Store.

### I received an error page which says "This page cannot be profiled."

If you see this error, it may be because of one of the following conditions:
  * You are not currently on a Shopify store.
  * You might be trying to profile a checkout page, which is not supported by this extension.
  * There was an unhandled error in the request, e.g. timeout, lost connection, etc.

If it was none of the errors above you can right click, inspect page, and view console for error details.

## Contributing
If you find a bug please open an issue [here](https://github.com/Shopify/shopify-devtools/issues/new).

If you would like to request a feature checkout out the [feature request](https://github.com/Shopify/shopify-devtools/blob/master/FEATURE_REQUEST.md) documentation.

To learn more about how to contribute to this project check out the [contributing](https://github.com/Shopify/shopify-devtools/blob/master/CONTRIBUTING.md) documentation.

