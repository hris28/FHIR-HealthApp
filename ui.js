function setOptions(selectEl, options) {
  selectEl.innerHTML = "";
  options.forEach(({ value, label }) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    selectEl.appendChild(opt);
  });
}

function td(text) {
  const el = document.createElement("td");
  el.textContent = text ?? "";
  return el;
}

function renderPatientCard(container, patient) {
  const name = patient.name?.[0]
    ? `${patient.name[0].given?.[0] || ""} ${patient.name[0].family || ""}`.trim()
    : "(no name)";

  container.innerHTML = `
    <div><strong>${name}</strong></div>
    <div class="muted">ID: ${patient.id}</div>
    <div class="muted">Gender: ${patient.gender || "—"} | Birthdate: ${patient.birthDate || "—"}</div>
  `;
}

function renderConditions(tbody, conditions) {
  tbody.innerHTML = "";
  conditions.forEach(c => {
    const tr = document.createElement("tr");
    tr.appendChild(td(c.id));
    tr.appendChild(td(c.code?.text || c.code?.coding?.[0]?.display || ""));
    tr.appendChild(td(c.code?.coding?.[0]?.code || ""));
    tbody.appendChild(tr);
  });
}

function renderMedicationRequests(tbody, meds) {
  tbody.innerHTML = "";
  meds.forEach(m => {
    const tr = document.createElement("tr");
    tr.appendChild(td(m.id));
    tr.appendChild(td(m.medicationCodeableConcept?.text || m.medicationCodeableConcept?.coding?.[0]?.display || ""));
    tr.appendChild(td(m.status || ""));
    tbody.appendChild(tr);
  });
}
