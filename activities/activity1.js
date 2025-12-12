/* CRUD assignment */

// let items = [];  
// our list stored in memory only (not saved anywhere)

// pre-filled data
let data = {
    patients: [
        { id: 1, firstname: "Marinette", lastname: "Dupain-Cheng", age: 28 },
        { id: 2, firstname: "Elend", lastname: "Venture", age: 41 },
        { id: 3, firstname: "Gojo", lastname: "Satoru", age: 30 }
    ],
    medications: [
        { id: 1, name: "Lisinopril", dose: "10mg" },
        { id: 2, name: "Metformin", dose: "500mg" },
        { id: 3, name: "Venlafaxine Hydrochlorine", dose: "37.5mg" },
        { id: 3, name: "Bupropion HCl XL (Wellbutrin XL)", dose: "150mg" },
        { id: 3, name: "Lisdexamfetamine (Vyvanse)", dose: "50mg" }
    ],
    diagnoses: [
        { id: 1, condition: "Hypertension", code: "I10" },
        { id: 2, condition: "Diabetes Mellitus Type 2", code: "H24" },
        { id: 3, condition: "GAD (generalized anxiety disorder)", code: "E11" },
        { id: 3, condition: "Attention deficit hyperactivity disorder (ADHD), predominantly inattentive type", code: "J14" }
    ]
};

let nextID = 100; // Used for mock IDs
let currentCategory = "patients";

// Get references to DOM elements
const categorySelect = document.querySelector("#categorySelect");
const tableHead = document.querySelector("#tableHead");
const tableBody = document.querySelector("#tableBody");
const addBtn = document.querySelector("#addBtn");

/* bconst input = document.querySelector("#newItemInput");
const addBtn = document.querySelector("#addItemBtn");
const list = document.querySelector("#itemList"); 

addBtn.addEventListener("click", addItem); */

// Event listeners
categorySelect.addEventListener("change", () => {
    currentCategory = categorySelect.value;

    // Update Add Button Text
    if (currentCategory === "patients") {
        addBtn.textContent = "Add Patient";
        displayTable();
    } 
    else if (currentCategory === "medications") {
        addBtn.textContent = "Add Medication";
        displayTable();
    } 
    else if (currentCategory === "diagnoses") {
        addBtn.textContent = "Add Diagnosis";
        displayTable();
    }

    // if category is empty. 
    // do before looping rows in displayTable()
    let items = data[currentCategory];
    if (items.length === 0) {
        let emptyRow = document.createElement("tr");
        let td = document.createElement("td");
        td.colSpan = 5;
        td.style.textAlign = "center";
        td.style.color = "#666";
        td.textContent = "No items in this category.";
        emptyRow.appendChild(td);
        tableBody.appendChild(emptyRow);
        return; 
    }

    displayTable();
});

addBtn.addEventListener("click", addItem);

// Read (Display table)
function displayTable() {
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    let items = data[currentCategory];

    // Create headers based on category
    let headers = [];

    if (currentCategory === "patients") {
        headers = ["ID", "First Name", "Last Name", "Age", "Actions"];
    }
    if (currentCategory === "medications") {
        headers = ["ID", "Name", "Dose", "Actions"];
    }
    if (currentCategory === "diagnoses") {
        headers = ["ID", "Condition", "Code", "Actions"];
    }

    // Build header row
    let trHead = document.createElement("tr");
    headers.forEach(h => {
        let th = document.createElement("th");
        th.innerHTML = h;
        trHead.appendChild(th);
    });
    tableHead.appendChild(trHead);

    // Build data rows
    items.forEach(item => { // don't need to use i for item bc indexOf(item) gives position as needed. Reference identity is stronger than numeric index.
        let tr = document.createElement("tr"); // strings vs. objects

        // Insert fields depending on category
        if (currentCategory === "patients") {
            tr.appendChild(cell(item.id));
            tr.appendChild(cell(item.firstname));
            tr.appendChild(cell(item.lastname));
            tr.appendChild(cell(item.age));
        }
        if (currentCategory === "medications") {
            tr.appendChild(cell(item.id));
            tr.appendChild(cell(item.name));
            tr.appendChild(cell(item.dose));
        }
        if (currentCategory === "diagnoses") {
            tr.appendChild(cell(item.id));
            tr.appendChild(cell(item.condition));
            tr.appendChild(cell(item.code));
        }

        // Action buttons
        let actionTd = document.createElement("td");

        // Delete button (uses .bind to preserve item + row reference)
        let delBtn = document.createElement("button");
        delBtn.innerHTML = "[Delete]";
        delBtn.className = "btn-del";
        delBtn.onclick = deleteItem.bind({
            item: item,
            row: tr
        });
        actionTd.appendChild(delBtn);

        // Edit button
        let editBtn = document.createElement("button");
        editBtn.innerHTML = "[Edit]";
        editBtn.className = "btn-edit";
        editBtn.onclick = editItem.bind({
            item: item,
            row: tr
        });
        actionTd.appendChild(editBtn);

        tr.appendChild(actionTd);
        tableBody.appendChild(tr);
    });
}

// Helper - Build simple table cell
function cell(text) {
    let td = document.createElement("td");
    td.innerHTML = text;
    return td;
}


/* Create */
function addItem() {
    let obj = { id: nextID++ };

    if (currentCategory === "patients") {
        obj.firstname = prompt("First Name:");
        obj.lastname = prompt("Last Name:");
        obj.age = prompt("Age:");
    }

    if (currentCategory === "medications") {
        obj.name = prompt("Medication Name:");
        obj.dose = prompt("Dose:");
    }

    if (currentCategory === "diagnoses") {
        obj.condition = prompt("Condition:");
        obj.code = prompt("Code:");
    }

    if (!obj.firstname && !obj.name && !obj.condition) return;

    data[currentCategory].push(obj);
    displayTable();
}

/* function addItem() {
  const text = input.value.trim();
  if (text === "") {
    alert("Please enter a value.");
    return;
  }

  items.push(text);
  input.value = "";
  input.focus();

  displayList();
} */


/* Read (Display list) 
function displayList() {
  list.innerHTML = "";

  items.forEach((itemText, index) => {
    const li = document.createElement("li");
    li.textContent = itemText;

    // Create edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "[Edit]";
    editBtn.classList.add("small-btn");
    editBtn.onclick = () => editItem(index);

    // Create delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "[X]";
    delBtn.classList.add("small-btn");
    delBtn.onclick = () => deleteItem(index);

    li.append(editBtn, delBtn);
    list.appendChild(li);
  });
} */

/* Update (be sure to Edit item in-place without changing its index) */
  function editItem() {
    let item = this.item;

    if (currentCategory === "patients") {
        item.firstname = prompt("First Name:", item.firstname);
        item.lastname = prompt("Last Name:", item.lastname);
        item.age = prompt("Age:", item.age);
    }

    if (currentCategory === "medications") {
        item.name = prompt("Medication Name:", item.name);
        item.dose = prompt("Dose:", item.dose);
    }

    if (currentCategory === "diagnoses") {
        item.condition = prompt("Condition:", item.condition);
        item.code = prompt("Code:", item.code);
    }

    displayTable();
}


/* Delete */
function deleteItem() {
    if (!confirm("Delete this item?")) return;

    let arr = data[currentCategory];
    let item = this.item;

    let index = arr.indexOf(item);
    if (index > -1) arr.splice(index, 1);

    this.row.remove(); // Direct DOM removal
}

/* function deleteItem(index) {
  if (confirm("Delete this item?")) {
    items.splice(index, 1);
    renderList();
  }
} */

  displayTable(); // initial load

