import * as d3 from 'd3';
import * as flamegraph from 'd3-flame-graph';
import 'd3-flame-graph/dist/d3-flamegraph.css';

chrome.devtools.panels.create('Shopify', '', './devtools.html');

function cleanLiquidProfileData(entries) {
  return entries.map(function(entry) {
    return {
      name: `${entry.partial} ${entry.code} (line#${entry.line_number})`,
      value: entry.total_time,
      children: cleanLiquidProfileData(entry.children),
    };
  });
}

chrome.devtools.inspectedWindow.eval('window.location.href', function(
  result: string,
) {
  const url = result;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `${url}/.json?profile_liquid`, true);
  xhr.onload = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.response);
        const cleanData = {
          name: data.name,
          value: data.value,
          children: cleanLiquidProfileData(data.children),
        };

        const flameGraph = flamegraph.flamegraph().width(600);

        const details = document.getElementById('details');
        flameGraph.setDetailsElement(details);

        d3.select('#chart')
          .datum(cleanData)
          .call(flameGraph);
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function() {
    console.error(xhr.statusText);
  };
  xhr.send(null);
});
