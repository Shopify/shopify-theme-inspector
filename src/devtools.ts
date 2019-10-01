import * as d3 from "d3";
import * as flamegraph from "d3-flame-graph";
import "d3-flame-graph/dist/d3-flamegraph.css";

chrome.devtools.panels.create("Shopify",
  "shopify.png",
  "devtools.html"
);

// function onClick(d) {
//   console.info("Clicked on " + d.data.name);
// }

function cleanLiquidProfileData(entries) {
  return entries.map(function (entry){
    return {
      name: `${entry.partial} ${entry.code} (line#${entry.line_number})`,
      value: entry.total_time,
      children: cleanLiquidProfileData(entry.children),
    };
  });
}

chrome.devtools.inspectedWindow.eval(`document.getElementById('liquidProfileData').innerHTML`, function(result: string) {
  var data = JSON.parse(result);
  var cleanData = {
    name: data.name,
    value: data.value,
    children: data.children.map(element => {
      return cleanLiquidProfileData(element);
    }),
  }

  cleanData.children = cleanData.children.flat();
  var flameGraph = flamegraph()
  .width(600);
  
  var details = document.getElementById("details");
  flameGraph.setDetailsElement(details);

  d3.select("#chart")
    .datum(cleanData)
    .call(flameGraph);
});
 
 
