
const client = FHIR.client("https://r3.smarthealthit.org");

// Fixed patient to keep data coherent
// const PATIENT_ID = "fb3fd3da-5d0d-4a86-9e31-55f12edb5ec3"; // scope all queries to a single patient to ensure clinically coherent time-series data

// LOINC codes for vital signs
const VITALS = {
  heartRate: {
    code: "8867-4",
    label: "Heart Rate",
    unit: "beats/min",
    type: "single",       // FHIR structure
    chartType: "line"     // visualization
  },
  weight: {
    code: "29463-7",
    label: "Body Weight",
    unit: "kg",
    type: "single",
    chartType: "line"
  },
  height: {
    code: "8302-2",
    label: "Body Height",
    unit: "cm",
    type: "single",
    chartType: "column"
  },
  bloodPressure: {
    code: "85354-9", // BP panel
    label: "Blood Pressure",
    unit: "mmHg",
    type: "panel",
    chartType: "line"
  }
};

// DOM references
const patientSelect = document.querySelector("#patientSelect");
const vitalSelect = document.querySelector("#vitalSelect");
const loadBtn = document.querySelector("#loadBtn");

// Initial load
// loadPatients(); // loads all patients
loadVitals();
loadPatientsForVital(vitalSelect.value);

vitalSelect.addEventListener("change", () => {
  loadPatientsForVital(vitalSelect.value);
});

loadBtn.addEventListener("click", loadSelectedVital);


// Load all patients
/* function loadPatients() {
  client.request("Patient")
    .then(data => {
      if (!data.entry) return;

      patientSelect.innerHTML = "";

      data.entry.forEach(e => {
        const patient = e.resource;
        const opt = document.createElement("option");

        opt.value = patient.id;
        opt.textContent =
          patient.name?.[0]
            ? `${patient.name[0].given?.[0] || ""} ${patient.name[0].family || ""}`
            : patient.id;

        patientSelect.appendChild(opt);
      });

      loadSelectedVital(); // auto-load first patient
    })
    .catch(console.error);
} */

// Populate vital dropdown
function loadVitals() {
    vitalSelect.innerHTML = "";   // fix for duplication of vital selection options

  for (let key in VITALS) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = VITALS[key].label;
    vitalSelect.appendChild(opt);
  }
}

function loadPatientsForVital(vitalKey) {
  const vital = VITALS[vitalKey];
  patientSelect.innerHTML = "";

  const query =
    `Observation?code=http://loinc.org|${vital.code}&_count=100`;

  client.request(query)
    .then(data => {
      if (!data.entry) return;

      const patientIds = new Set();

      data.entry.forEach(e => {
        const ref = e.resource.subject?.reference;
        if (ref?.startsWith("Patient/")) {
          patientIds.add(ref.split("/")[1]);
        }
      });

      patientIds.forEach(loadPatientOption);
    })
    .catch(console.error);
}

function loadPatientOption(patientId) {
  client.request("Patient/" + patientId)
    .then(patient => {
      const opt = document.createElement("option");
      opt.value = patient.id;
      opt.textContent =
        patient.name?.[0]
          ? `${patient.name[0].given?.[0] || ""} ${patient.name[0].family || ""}`
          : patient.id;

      patientSelect.appendChild(opt);
    })
    .catch(console.error);
}


// Main loader, load selected vital for patient
function loadSelectedVital() {
  const patientId = patientSelect.value;
  const vitalKey = vitalSelect.value;
  const vital = VITALS[vitalKey];

  if (!patientId || !vital) return;

  const query =
    `Observation?patient=${patientId}` +
    `&code=http://loinc.org|${vital.code}` +
    `&_sort=date`;

  client.request(query)
    .then(data => {
      if (!data.entry || data.entry.length === 0) {
        drawNoDataChart(vital.label);
        return;
      }

      if (vital.type === "panel") {
        handleBloodPressure(data, vital);
      } else {
        handleSingleVital(data, vital);
      }
    })
    .catch(console.error);
}


// Handle simple single-value vitals
function handleSingleVital(data, vital) {
  const dates = [];
  const values = [];

  data.entry.forEach(e => {
    const obs = e.resource;
    if (!obs.valueQuantity || !obs.effectiveDateTime) return;

    dates.push(obs.effectiveDateTime.substring(0, 10));
    values.push(obs.valueQuantity.value);
  });

  if (values.length === 0) {
    drawNoDataChart(vital.label);
    return;
  }

  drawChart({
    title: `${vital.label} Over Time`,
    yAxisLabel: vital.unit,
    categories: dates,
    series: [{
      name: vital.label,
      data: values
    }],
    chartType: vital.chartType
  });
}

// Handle blood pressure (two series panel)
function handleBloodPressure(data, vital) {
  const dates = [];
  const systolic = [];
  const diastolic = [];

  data.entry.forEach(e => {
    const obs = e.resource;
    if (!obs.component || !obs.effectiveDateTime) return;

    let sys, dia;

    obs.component.forEach(c => {
      const code = c.code?.coding?.[0]?.code;
      if (code === "8480-6") sys = c.valueQuantity?.value;
      if (code === "8462-4") dia = c.valueQuantity?.value;
    });

    if (sys && dia) {
      dates.push(obs.effectiveDateTime.substring(0, 10));
      systolic.push(sys);
      diastolic.push(dia);
    }
  });

  if (systolic.length === 0) {
    drawNoDataChart("Blood Pressure");
    return;
  }

  drawChart({
    title: "Blood Pressure Over Time",
    yAxisLabel: "mmHg",
    categories: dates,
    series: [
      { name: "Systolic", data: systolic },
      { name: "Diastolic", data: diastolic }
    ],
    chartType: vital.chartType
  });
}

// Highcharts renderer
function drawChart({ title, yAxisLabel, categories, series, chartType }) {
  Highcharts.chart("container", {
    chart: { type: chartType },
    title: { text: title },
    xAxis: { categories },
    yAxis: {
      title: { text: yAxisLabel }
    },
    series
  });
}

// no-data fallback
function drawNoDataChart(label) {
  Highcharts.chart("container", {
    chart: { type: "line" },
    title: { text: `${label}` },
    subtitle: { text: "No data available for this patient" },
    series: []
  });
}