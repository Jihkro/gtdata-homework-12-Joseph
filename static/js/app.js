function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel
  console.log(`running BuildMeta for sample: ${sample}`);
  // Use `d3.json` to fetch the metadata for a sample
  d3.json(`http://localhost:5000/metadata/${sample}`).then(function(data){
    // Use d3 to select the panel with id of `#sample-metadata`
    console.log('inside of json request');
    var samplebox = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    samplebox.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    samplebox.append("ul");
    for (kv of Object.entries(data)){
      samplebox.append("li").text(`${kv[0]}: ${kv[1]}`);
    }

    // BONUS: Build the Gauge Chart
    buildGauge(data.WFREQ);
  });
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json(`http://localhost:5000/samples/${sample}`).then(function(data){

    maxotuid = Math.max.apply(Math,data.otu_ids);
    maxsample_value = Math.max.apply(Math,data.sample_values);
    // @TODO: Build a Bubble Chart using the sample data
    var bubbleData = [{
      x: data.otu_ids,
      y: data.sample_values,
      text: data.otu_labels,
      marker: {
        color: data.otu_ids.map( x => `rgb(${255 - Math.floor(255 * x/maxotuid)},0,${Math.floor(255 * x / maxotuid)})`),
        size: data.sample_values.map( x => 100 * x/maxsample_value),
        sizemin: 4
      },
      mode: "markers"
    }]

    Plotly.plot('bubble',bubbleData);

    // Grab values for highest 10 occurrences only
    var splicedsample_values = [];
    var splicedotu_ids = [];
    var splicedotu_labels = [];
    for(var i = 0; i<10; i++){
      let indexOfMaxValue = data.sample_values.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
      splicedsample_values.push(data.sample_values.splice(indexOfMaxValue,1)[0])
      splicedotu_ids.push(data.otu_ids.splice(indexOfMaxValue,1)[0])
      splicedotu_labels.push(data.otu_labels.splice(indexOfMaxValue,1)[0])
    }
    var othertotal = 0;
    for (i=0;i<data.sample_values.length;i++){
      othertotal += data.sample_values[i];
    }
    splicedsample_values.push(othertotal)
    splicedotu_ids.push("Other")
    splicedotu_labels.push("Other")

    // @TODO: Build a Pie Chart
    var pieData = [{
      values: splicedsample_values,
      labels: splicedotu_ids,
      type: "pie",
      hoverinfo: splicedotu_labels

    }]
    var pieLayout = {
      height: 500,
      width: 400
    }

    Plotly.newPlot('pie', pieData, pieLayout)
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  console.log('saw something changed');
  Plotly.deleteTraces('bubble',0);
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
