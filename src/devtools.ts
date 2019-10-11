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
  const request = new XMLHttpRequest();
  request.responseType = 'document';
  request.open('GET', `${url}?profile_liquid`, true);
  request.onload = function() {
    if (request.readyState === 4) {
      if (request.status === 200) {
        let data;
        const scriptTag = request.responseXML!.querySelector(
          '#liquidProfileData',
        );
        if (scriptTag !== null) {
          data = JSON.parse(scriptTag.innerHTML);
        }
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
        console.error(request.statusText);
      }
    }
  };
  request.onerror = function() {
    console.error(request.statusText);
  };
  request.send(null);
});
