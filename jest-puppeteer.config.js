const path = require('path');

const EXTENSION_PATH = path.resolve(__dirname, 'dist');

module.exports = {
  launch: {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--user-agent=PuppeteerAgent',
      '--no-sandbox',
    ],
  },
};
