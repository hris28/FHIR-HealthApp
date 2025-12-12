const client = FHIR.client("https://r3.smarthealthit.org");

// safe bundle helper
function bundleResources(bundle) {
  if (!bundle || !bundle.entry) return [];
  return bundle.entry.map(e => e.resource).filter(Boolean);
}

async function fetchPatients() {
  const b = await client.request("Patient?_count=50");
  return bundleResources(b);
}

async function fetchPatient(patientId) {
  return client.request(`Patient/${patientId}`);
}

async function searchConditions(patientId) {
  const b = await client.request(`Condition?patient=${patientId}&_count=50`);
  return bundleResources(b);
}

async function searchMedicationRequests(patientId) {
  const b = await client.request(`MedicationRequest?patient=${patientId}&_count=50`);
  return bundleResources(b);
}

async function searchObservationsByLoinc(patientId, loincCode) {
  const q =
    `Observation?patient=${patientId}` +
    `&code=http://loinc.org|${loincCode}` +
    `&_sort=date&_count=200`;
  const b = await client.request(q);
  return bundleResources(b);
}

// simple “breakdown” query: pull recent obs and count by code.text/display
async function fetchObservationSample(patientId) {
  const b = await client.request(`Observation?patient=${patientId}&_count=200`);
  return bundleResources(b);
}

// CRUD
async function createPatient(first, last) {
  const patient = { resourceType:"Patient", name:[{ given:[first], family:last }] };
  return client.create(patient);
}

async function patchPatientName(patientId, first, last) {
  return client.patch(`Patient/${patientId}`, [
    { op:"replace", path:"/name/0/given/0", value:first },
    { op:"replace", path:"/name/0/family", value:last }
  ]);
}

async function deleteResource(type, id) {
  return client.delete(`${type}/${id}`);
}

async function createObservation(patientId, text, value, unit) {
  const obs = {
    resourceType: "Observation",
    status: "final",
    subject: { reference: `Patient/${patientId}` },
    code: { text },
    valueQuantity: { value, unit }
  };
  return client.create(obs);
}

// Locations (limited coords, but still useful)
async function fetchLocations() {
  const b = await client.request("Location?_count=200");
  return bundleResources(b);
}
