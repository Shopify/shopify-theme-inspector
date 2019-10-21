# shopify-devtools

Devtool to profile and visualize liquid performance.

## Installing the extension locally
1. Run the command `dev clone shopify-devtools` to clone the repository.
2. Run `yarn` and then `yarn build`.
3. Navigate to `chrome://extensions` in your browser. You can also access this page by clicking on the Chrome menu on the top right side of the Omnibox, hovering over More Tools and selecting Extensions.
4. Check the box next to Developer Mode.
5. Click Load Unpacked Extension and select the `/dist` directory in the `shopify-devtools` folder.

You should now be able to see this extension on your browser toolbar. On your local store open chrome dev tools and you will be able to see the `Shopify` panel.

### Other requirements
For this devtools to work for now there are some additional steps to the setup.
1. Activate the `profile_liquid` beta flag for your local store.
2. Use the `?profile_liquid=true` query param when accessing local store.

