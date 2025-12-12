

const client = FHIR.client("https://r3.smarthealthit.org");
// Creates a connection to the SMART Health IT demo server
// Allows us to make authenticated FHIR requests without API keys
// FHIR servers expose data via REST endpoints
// The SMART client simplifies request formatting and parsing

let currentResource = "Patient";

// DOM references
const resourceSelect = document.querySelector("#resourceSelect");
const searchInput   = document.querySelector("#searchInput");
const searchBtn     = document.querySelector("#searchBtn");
const addBtn        = document.querySelector("#addBtn");
const tableHead     = document.querySelector("#tableHead");
const tableBody     = document.querySelector("#tableBody");

// Events. Read.
resourceSelect.addEventListener("change", () => {
  currentResource = resourceSelect.value;
  searchResource();
});

searchBtn.addEventListener("click", searchResource);
addBtn.addEventListener("click", addResource);

// Display tables
function displayPatients(data) {
  displayHeaders(["ID", "First Name", "Last Name", "Actions"]);
  tableBody.innerHTML = "";

  if (!data.entry) return;

  data.entry.forEach(e => addPatientRow(e.resource));
}

function displayObservations(data) {
// console.log("Observation bundle:", data);
  displayHeaders(["ID", "Type", "Value", "Unit", "Actions"]);
  tableBody.innerHTML = "";

  if (!data.entry) 
    return "Entry not found";

  data.entry.forEach(e => addObservationRow(e.resource));
}

function displayHeaders(headers) {
  tableHead.innerHTML = "";
  const tr = document.createElement("tr");
  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    tr.appendChild(th);
  });
  tableHead.appendChild(tr);
}

// Row builders
function addPatientRow(patient) {
  const tr = document.createElement("tr");

  tr.appendChild(td(patient.id));
  tr.appendChild(td(patient.name?.[0]?.given?.[0] || ""));
  tr.appendChild(td(patient.name?.[0]?.family || ""));

  const actions = document.createElement("td");

actions.appendChild(
  actionBtn("[Edit]", () => updatePatient(patient, tr), "btn-edit")
);
actions.appendChild(
  actionBtn("[X]", () => deleteResource("Patient", patient.id, tr), "btn-del")
);


  tr.appendChild(actions);
  tableBody.appendChild(tr);
}

function addObservationRow(obs) {
  const tr = document.createElement("tr");

  tr.appendChild(td(obs.id || ""));
  tr.appendChild(td(obs.code?.text || obs.code?.coding?.[0]?.display || ""));
  tr.appendChild(td(
    obs.valueQuantity?.value ||
    obs.valueString ||
    ""
  ));
  tr.appendChild(td(obs.valueQuantity?.unit || ""));

  const actions = document.createElement("td");
  actions.appendChild(
    actionBtn("[X]", () => deleteResource("Observation", obs.id, tr), "btn-del")
  );

  tr.appendChild(actions);
  tableBody.appendChild(tr);
}

// Search
function searchResource() {
// console.log("FHIR request:", url);
  const q = searchInput.value.trim();

  if (currentResource === "Patient") {
    const url = q ? "Patient?name=" + q : "Patient";
    client.request("Patient?name=" + q)
      .then(displayPatients)
      .catch(console.error);
  }

  if (currentResource === "Observation") {
    client.request("Observation")
      .then(displayObservations)
      .catch(console.error);
  }
}

// Create
function addResource() {
  if (currentResource === "Patient") addPatient();
  if (currentResource === "Observation") addObservation();
}

function addPatient() {
  const firstname = prompt("First name?");
  const lastname  = prompt("Last name?");

  if (!firstname || !lastname) return;

  const patient = {
    resourceType: "Patient",
    name: [{ given: [firstname], family: lastname }]
  };

  client.create(patient).then(addPatientRow);
}

function addObservation() {
  const value = prompt("Value?");
  const unit  = prompt("Unit?");
  const text  = prompt("Observation description?");

  if (!value) return;

  const obs = {
    resourceType: "Observation",
    status: "final",
    code: { text },
    valueQuantity: { value, unit }
  };

  client.create(obs).then(addObservationRow);
}

// Update (only patient, not observation)
function updatePatient(patient, row) {
  const firstname = prompt("First name?", patient.name[0].given[0]);
  const lastname  = prompt("Last name?", patient.name[0].family);

  if (!firstname || !lastname) return;

  client.patch("Patient/" + patient.id, [
    { op: "replace", path: "/name/0/given/0", value: firstname },
    { op: "replace", path: "/name/0/family", value: lastname }
  ]).then(updated => {
    row.remove();
    addPatientRow(updated);
  });
}

// Delete
function deleteResource(type, id, row) {
  if (!confirm("Delete this item?")) return;

  client.delete(type + "/" + id);
  row.remove();
}

// Helper Function
function td(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function actionBtn(label, fn, className) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.className = className;
  btn.onclick = fn;
  return btn;
}


function emptyTable() {
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";
}

/* function cell(text) {
  let td = document.createElement("td");
  td.innerText = text;
  return td;
} */

  // auto-load patients at page open
  client.request("Patient")
  .then(displayPatients)
  .catch(console.error);
