const els = {
  patientSelect: document.querySelector("#patientSelect"),
  refreshBtn: document.querySelector("#refreshBtn"),

  patientCard: document.querySelector("#patientCard"),
  conditionsBody: document.querySelector("#conditionsBody"),
  medsBody: document.querySelector("#medsBody"),

  addPatientBtn: document.querySelector("#addPatientBtn"),
  editPatientBtn: document.querySelector("#editPatientBtn"),
  deletePatientBtn: document.querySelector("#deletePatientBtn"),

  noteInput: document.querySelector("#noteInput"),
  addNoteBtn: document.querySelector("#addNoteBtn"),
  notesList: document.querySelector("#notesList"),

  vitalSelect: document.querySelector("#vitalSelect"),
  chartSelect: document.querySelector("#chartSelect"),
  addObsBtn: document.querySelector("#addObsBtn"),

  locFilterSelect: document.querySelector("#locFilterSelect"),
  reloadMapBtn: document.querySelector("#reloadMapBtn"),
  mapHint: document.querySelector("#mapHint"),
};

const AppState = {
  patientId: null,
  notesByPatient: {} // client-owned data
};

// Tabs
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".tabpanel").forEach(p => p.classList.add("hidden"));
    document.querySelector(`#tab-${btn.dataset.tab}`).classList.remove("hidden");
  });
});

// Init
initMap();
populateVitals(els.vitalSelect);

boot();

async function boot() {
  const patients = await fetchPatients();

  setOptions(els.patientSelect, patients.map(p => ({
    value: p.id,
    label: p.name?.[0]
      ? `${p.name[0].given?.[0] || ""} ${p.name[0].family || ""}`.trim() || p.id
      : p.id
  })));

  AppState.patientId = els.patientSelect.value;
  await refreshAll();
}

// Patient change
els.patientSelect.addEventListener("change", async () => {
  AppState.patientId = els.patientSelect.value;
  await refreshAll();
});

els.refreshBtn.addEventListener("click", refreshAll);

// Refresh all panels
async function refreshAll() {
  const pid = AppState.patientId;
  if (!pid) return;

  // Overview
  const patient = await fetchPatient(pid);
  renderPatientCard(els.patientCard, patient);

  const conditions = await searchConditions(pid);
  renderConditions(els.conditionsBody, conditions);

  // Records
  const meds = await searchMedicationRequests(pid);
  renderMedicationRequests(els.medsBody, meds);

  // Notes (client-owned)
  renderNotes();

  // Analytics
  await refreshCharts();

  // Map
  await refreshMap();
}

/* CRUD: Patient */
els.addPatientBtn.addEventListener("click", async () => {
  const first = prompt("First name?");
  const last = prompt("Last name?");
  if (!first || !last) return;

  const created = await createPatient(first, last);

  // reload patients dropdown
  const patients = await fetchPatients();
  setOptions(els.patientSelect, patients.map(p => ({
    value: p.id,
    label: p.name?.[0]
      ? `${p.name[0].given?.[0] || ""} ${p.name[0].family || ""}`.trim() || p.id
      : p.id
  })));

  els.patientSelect.value = created.id;
  AppState.patientId = created.id;
  await refreshAll();
});

els.editPatientBtn.addEventListener("click", async () => {
  const pid = AppState.patientId;
  const patient = await fetchPatient(pid);

  const curFirst = patient.name?.[0]?.given?.[0] || "";
  const curLast  = patient.name?.[0]?.family || "";

  const first = prompt("First name?", curFirst);
  const last  = prompt("Last name?", curLast);
  if (!first || !last) return;

  await patchPatientName(pid, first, last);
  await refreshAll();
});

els.deletePatientBtn.addEventListener("click", async () => {
  const pid = AppState.patientId;
  if (!confirm("Delete this patient?")) return;

  await deleteResource("Patient", pid);

  // re-bootstrap
  await boot();
});

/* Client-owned notes */
els.addNoteBtn.addEventListener("click", () => {
  const pid = AppState.patientId;
  const text = els.noteInput.value.trim();
  if (!text) return;

  AppState.notesByPatient[pid] ||= [];
  AppState.notesByPatient[pid].push({ text, ts: new Date().toISOString() });

  els.noteInput.value = "";
  renderNotes();
});

function renderNotes() {
  const pid = AppState.patientId;
  const notes = AppState.notesByPatient[pid] || [];

  els.notesList.innerHTML = "";
  notes.forEach((n, idx) => {
    const li = document.createElement("li");
    li.textContent = n.text;

    const del = document.createElement("button");
    del.textContent = "[X]";
    del.className = "btn btn-del";
    del.addEventListener("click", () => {
      notes.splice(idx, 1);
      renderNotes();
    });

    li.appendChild(document.createTextNode(" "));
    li.appendChild(del);
    els.notesList.appendChild(li);
  });
}

/* Charts */
els.vitalSelect.addEventListener("change", refreshCharts);
els.chartSelect.addEventListener("change", refreshCharts);

els.addObsBtn.addEventListener("click", async () => {
  const pid = AppState.patientId;
  const text = prompt("Observation description (text)?", "Manual entry");
  const value = prompt("Value?");
  const unit = prompt("Unit?", "");

  if (!value) return;
  await createObservation(pid, text, Number(value), unit || "");
  await refreshCharts();
});

async function refreshCharts() {
  const pid = AppState.patientId;
  const vitalKey = els.vitalSelect.value;
  const chartType = els.chartSelect.value;

  const vital = VITALS[vitalKey];
  if (!vital) return;

  const obs = await searchObservationsByLoinc(pid, vital.code);

  const { categories, data } = obsToSeriesPoints(obs);
  if (data.length === 0) {
    drawNoData(`${vital.label} Over Time`);
  } else {
    drawVitalChart({
        containerId: "chart",
      chartType,
      title: `${vital.label} Over Time`,
      unit: vital.unit,
      categories,
      seriesName: vital.label,
      data
    });
  }

  const sample = await fetchObservationSample(pid);
  const counts = computeObservationCounts(sample);
  drawBreakdownBar(counts);
}

/* Map */
let cachedLocations = null;

els.reloadMapBtn.addEventListener("click", refreshMap);
els.locFilterSelect.addEventListener("change", refreshMap);

async function refreshMap() {
  if (!cachedLocations) cachedLocations = await fetchLocations();

  // dataset reality: types often missing; coordinates sparse; so we filter by name presets
  const filter = els.locFilterSelect.value;

  let filtered = cachedLocations.filter(l => l.position?.latitude && l.position?.longitude);

  if (filter === "NAME_ELECTRIC") filtered = cachedLocations.filter(l => (l.name || "").includes("Electric City"));
  if (filter === "NAME_SCRANTON") filtered = cachedLocations.filter(l => (l.name || "").includes("Scranton"));

  const stats = renderLocationsOnMap(filtered);

  els.mapHint.textContent =
    `Loaded ${stats.total} Location resources; ${stats.withCoords} have coordinates on this server.`;
}
