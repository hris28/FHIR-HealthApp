const VITALS = {
  heartRate: { code:"8867-4", label:"Heart Rate", unit:"beats/min" },
  weight:    { code:"29463-7", label:"Body Weight", unit:"kg" },
  height:    { code:"8302-2", label:"Body Height", unit:"cm" },
  // BP is tricky on this server; keep it optional later
};

function populateVitals(selectEl) {
  const opts = Object.entries(VITALS).map(([k,v]) => ({ value:k, label:v.label }));
  setOptions(selectEl, opts);
}

function obsToSeriesPoints(observations) {
  // returns {categories:[], data:[]}
  const categories = [];
  const data = [];

  observations.forEach(o => {
    const dt = o.effectiveDateTime || o.effectivePeriod?.start;
    const val = o.valueQuantity?.value;
    if (!dt || val === undefined || val === null) return;
    categories.push(dt.substring(0,10));
    data.push(Number(val));
  });

  return { categories, data };
}

function drawVitalChart({ containerId, chartType, title, unit, categories, seriesName, data }) {
  Highcharts.chart(containerId, {
    chart: { type: chartType },
    title: { text: title },
    xAxis: { categories },
    yAxis: { title: { text: unit } },
    series: [{ name: seriesName, data }]
  });
}

function drawNoData(title) {
  Highcharts.chart("chart", {
    chart: { type:"line" },
    title: { text: title },
    subtitle: { text: "No data available for this patient + selection." },
    series: []
  });
}

function drawBreakdownBar(countsObj) {
  const categories = Object.keys(countsObj);
  const data = categories.map(k => countsObj[k]);

  Highcharts.chart("breakdownChart", {
    chart: { type:"bar" },
    title: { text: "Observation counts by type (sample)" },
    xAxis: { categories },
    yAxis: { title: { text: "Count" } },
    series: [{ name:"Observations", data }]
  });
}

function computeObservationCounts(observations) {
  const counts = {};
  observations.forEach(o => {
    const label =
      o.code?.text ||
      o.code?.coding?.[0]?.display ||
      o.code?.coding?.[0]?.code ||
      "Unknown";

    counts[label] = (counts[label] || 0) + 1;
  });

  // keep top 12 to avoid a giant unreadable bar chart
  const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 12);
  return Object.fromEntries(sorted);
}
