import * as d3 from 'd3';
import * as flamegraph from 'd3-flame-graph';
import 'd3-flame-graph/dist/d3-flamegraph.css';
// import './panel.css';
// import './main.css';

chrome.devtools.panels.create('Shopify', '', './devtools.html', function() {
  return displayFlameGraph();
});

function formatLiquidProfileData(entries) {
  return entries.map(function(entry) {
    return {
      name: `${entry.partial} ${entry.code} (line#${entry.line_number})`,
      value: entry.total_time,
      children: formatLiquidProfileData(entry.children),
    };
  });
}

function getProfileURL(): Promise<string> {
  return new Promise(resolve => {
    chrome.devtools.inspectedWindow.eval('window.location.href', function(
      result: string,
    ) {
      resolve(result);
    });
  });
}

async function getProfileData() {
  const url = new URL(await getProfileURL());
  url.searchParams.set('profile_liquid', 'true');
  const response = await fetch(url.href);
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  if (doc === null) {
    return;
  }
  const profileData = JSON.parse(
    doc.querySelector('#liquidProfileData')!.innerHTML,
  );
  // eslint-disable-next-line consistent-return
  return cleanProfileData(profileData);
}

function cleanProfileData(
  profileData: {name: any; value: any; children: any} | null,
) {
  let cleanData;

  if (profileData !== null) {
    cleanData = {
      name: profileData.name,
      value: profileData.value,
      children: formatLiquidProfileData(profileData.children),
    };
  }
  return cleanData;
}

async function displayFlameGraph() {
  const profile = await getProfileData();

  const flameGraph = flamegraph
    .flamegraph()
    .inverted(true)
    .cellHeight(20);

  const details = document.getElementById('details');
  flameGraph.setDetailsElement(details);

  d3.select('#chart')
    .datum(profile)
    .call(flameGraph);
}
