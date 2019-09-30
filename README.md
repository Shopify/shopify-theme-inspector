# shopify-devtools

Devtool to profile and visualize liquid performance.

## Installing the extension locally
1. Navigate to chrome://extensions in your browser. You can also access this page by clicking on the Chrome menu on the top right side of the Omnibox, hovering over More Tools and selecting Extensions.
2. Check the box next to Developer Mode.
3. Click Load Unpacked Extension and select the directory for your "shopify-devtools" extension.

You should now be able to see this extension on your browser toolbar. On your local store open chrome dev tools and you will be able to see the `Shopify` panel.

### Other requirements
For this devtools to work for now there are some additional steps to the setup.
1. Activate the `profile_liquid` beta flag for your local store.
2. Use the `?profile_liquid` query param when accessing local store.

