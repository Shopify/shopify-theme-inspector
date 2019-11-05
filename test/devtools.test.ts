import {mockProfileData} from './mock-data/mock-profile-data';
import {setDevtoolsEval} from './test-helpers';

describe('Devtools', () => {
  beforeAll(async () => {
    const dummyPage = await browser.newPage();
    await dummyPage.waitFor(2000);

    const extensionName = 'Shopify DevTools';

    const targets = await browser.targets();
    console.log(targets);
    // @ts-ignore
    const extensionTarget = targets.find(({_targetInfo}) => {
      return (
        _targetInfo.title === extensionName &&
        _targetInfo.type === 'background_page'
      );
    });
    // @ts-ignore
    const extensionUrl = extensionTarget._targetInfo.url || '';
    const [, , extensionID] = extensionUrl.split('/');
    console.log(`!!!!!!!!!!!${extensionID}`);
    await setDevtoolsEval(page);
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().endsWith('profile_liquid=true')) {
        request.respond({
          status: 200,
          contentType: 'text/html',
          body: mockProfileData,
        });
      } else {
        request.continue();
      }
    });
    await page.goto(`chrome-extension://${extensionID}/devtools.html`);
  });

  it('test initial message for devtools window is displayed', async () => {
    const elementText = await page.$eval('.initial', elem => elem.innerHTML);
    expect(elementText).toStrictEqual('No profiling recorded yet');
  });

  it('test flamegraph shows when valid profile data exists', async () => {
    // @ts-ignore
    await page.$eval('[data-refresh-button]', elem => elem.click());
    const flamegraphElement = await page.$eval(
      '.d3-flame-graph',
      elem => elem.innerHTML,
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
      elem => elem.innerHTML,
    );
    expect(elementHtml).not.toBeNull();
  });
});
