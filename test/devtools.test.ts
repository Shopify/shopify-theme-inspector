import {
  setupRequestInterception,
  mockChromeSendMessage,
  getExtensionId,
  mockChromeTabs,
} from './test-helpers';

describe('Devtools', () => {
  beforeAll(async () => {
    const extensionId = await getExtensionId();
    await setupRequestInterception(page);
    await mockChromeSendMessage(page);
    await mockChromeTabs(page);
    await page.goto(`chrome-extension://${extensionId}/devtools.html`);
  });

  it('test initial message for devtools window is displayed', async () => {
    const elementText = await page.$eval('.initial', elem => elem.textContent);
    expect(elementText).toStrictEqual('No profiling recorded yet');
  });

  it('test flamegraph shows when valid profile data exists', async () => {
    // @ts-ignore
    await page.$eval('[data-refresh-button]', elem => elem.click());
    await page.waitForSelector('.d3-flame-graph');
    const flamegraphElement = await page.$eval(
      '.d3-flame-graph',
      elem => elem.textContent,
    );
    expect(flamegraphElement).not.toBeNull();
  });

  it('test total liquid render time displayed when flamegraph loads', async () => {
    // @ts-ignore
    await page.$eval('[data-refresh-button]', elem => elem.click());
    const totalTime = await page.$eval(
      '[data-total-time]',
      elem => elem.textContent,
    );

    jest.useFakeTimers();
    setTimeout(function() {
      expect(totalTime).toBe('Total time to render liquid: 192ms');
    }, 100);
  });

  it('test click flamegraph node gives detailed information', async () => {
    // @ts-ignore
    await page.$eval('[data-refresh-button]', elem => elem.click());
    // @ts-ignore
    await page.$eval('.d3-flame-graph-label', elem => elem.click());
    const elementHtml = await page.$eval(
      '[data-detailed-info]',
      elem => elem.textContent,
    );
    expect(elementHtml).not.toBeNull();
  });
});
