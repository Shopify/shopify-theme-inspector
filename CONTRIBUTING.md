# Contributing Guide

## How to contribute

If you encounter a bug, think of a useful feature, or find something confusing in the docs, please [create a new issue](https://github.com/Shopify/shopify-devtools/issues/new)!

If you'd like to fix a bug, contribute to a feature or just correct a typo, please feel free to do so by opening a pull request.

If you're thinking of adding a big new feature, consider opening an issue first to discuss it to ensure it aligns to the direction of the project (and potentially save yourself some time!).

## Getting Started

To start working on the codebase:

#### 1. Fork the repo, then clone it:

```
git clone git@github.com:your-username/shopify-devtools.git
```

_Note: replace "your-username" with your GitHub handle_

#### 2. Install all package dependencies:

```
yarn
```

#### 3. Make some changes and write some tests for those changes. Run the tests with:

```
yarn test
```

#### 4. If your tests pass, commit your changes:

```
git commit -a -m="Your commit message"
```

#### 5. Push your commit to your Github fork:

```
git push origin master
```

#### 6. Open a Pull Request

See [Github's official documentation](https://help.github.com/articles/creating-a-pull-request-from-a-fork/) for more details.

## Loading the extension locally and testing changes
1. Run `yarn` and then `yarn build`.
2. Navigate to `chrome://extensions` in your browser. You can also access this page by clicking on the Chrome menu on the top right side of the Omnibox, hovering over More Tools and selecting Extensions.
3. Check the box next to Developer Mode.
4. Click Load Unpacked Extension and select the `/dist` directory in the `shopify-devtools` folder.

Now you should be able to actually test the changes you have made to the chrome extension locally. This ensures that you understand the effect your changes have and if you
are satisfied with them. If you make any UI changes it is good practice to include screenshots outlining the changes to make it easier for the reviewer.
