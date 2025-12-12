/* ===================================================
   LESSON 3 — CRUD Using Simple Strings
   ===================================================
   You learn:
   ✔ Arrays as storage
   ✔ Create/Read/Update/Delete operations
   ✔ createElement + appendChild
   ✔ Binding events to dynamically created elements
=================================================== */

let patients = [];  // simple array of patient names

// DOM references
const pInput = document.querySelector("#newPatientInput");
const pBtn   = document.querySelector("#addPatientBtn");
const pList  = document.querySelector("#patientList");

// CREATE
pBtn.addEventListener("click", function() {
  const name = pInput.value.trim();
  if (name === "") return;

  patients.push(name);
  pInput.value = "";
  pInput.focus();

  renderPatients();
});

// READ
function renderPatients() {
  pList.innerHTML = "";

  for (let i = 0; i < patients.length; i++) {
    const li = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = patients[i];

    const btns = document.createElement("div");
    btns.classList.add("crud-buttons");

    // UPDATE
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("crud-btn", "crud-edit");
    editBtn.addEventListener("click", () => {
      const newName = prompt("Rename:", patients[i]);
      if (newName && newName.trim() !== "") {
        patients[i] = newName.trim();
        renderPatients();
      }
    });

    // DELETE
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("crud-btn", "crud-delete");
    deleteBtn.addEventListener("click", () => {
      if (confirm(`Delete "${patients[i]}"?`)) {
        patients.splice(i, 1);
        renderPatients();
      }
    });

    btns.append(editBtn, deleteBtn);
    li.append(label, btns);
    pList.append(li);
  }
}
