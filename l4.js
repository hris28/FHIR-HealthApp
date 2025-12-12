/* 
   Lesson 4 — Advanced CRUD (Bind, Event Propagation,
                Input Validation, Duplicate Handling) */

let myShoppingList = [];

// References
const addBtn = document.querySelector("#add_button");
const input  = document.querySelector("#new_item");
const list   = document.querySelector("#shopping_list");

// Create
addBtn.addEventListener("click", addItemToMyList);
input.addEventListener("keyup", function(evt) {
  if (evt.keyCode === 13) addItemToMyList();
});

function addItemToMyList() {
  let item = input.value.trim();
  if (item === "") return;

  const idx = myShoppingList.indexOf(item);
  if (idx === -1) {
    myShoppingList.push(item);
  } else {
    console.log(item + " already exists.");
  }

  input.value = "";
  input.focus();
  showShoppingList();
}

// Read
function showShoppingList() {
  list.innerHTML = "";

  for (let i = 0; i < myShoppingList.length; i++) {
    const li = document.createElement("li");
    li.textContent = myShoppingList[i];
    list.appendChild(li);

    const del = document.createElement("a");
    del.textContent = " [X]";
    del.href = "javascript:;";
    
    del.addEventListener(
      "click",
      removeItemFromShoppingList.bind(li, myShoppingList[i], li)
    );

    li.append(del);
  }
}

// Delete
function removeItemFromShoppingList(item, li) {
  if (!confirm("Delete " + item + "?")) return;

  const idx = myShoppingList.indexOf(item);
  if (idx > -1) {
    myShoppingList.splice(idx, 1);
  }

  // Remove only this row instead of full re-render
  document.querySelector("#shopping_list").removeChild(li);
}

/* 
   Lesson 4B — Box Moving Interface:
   Event bubbling + e.stopPropagation()
   Selecting elements dynamically
   State management ("selectedBox")
   Moving items between containers
   Adding delay with setTimeout
   Cancelable moves (bonus)
   Promise-based move operations
*/

let selectedBox = null;
let pendingMove = null;
let boxID = 0;

function selectBox(e) {
  e.stopPropagation(); // Prevent clicking group from firing
  if (pendingMove) return; // Block selection during move

  selectedBox = this;

  document.querySelectorAll(".box")
    .forEach(b => b.classList.remove("selected"));

  this.classList.add("selected");
}

function moveSelectedBoxToGroup() {
  if (!selectedBox) return;

  // If already moving, cancel
  if (pendingMove) {
    console.log("Move canceled.");
    clearTimeout(pendingMove);
    pendingMove = null;
    return;
  }

  // Simulate server delay with Promise
  pendingMove = setTimeout(() => {
    this.append(selectedBox);
    selectedBox.classList.remove("selected");
    selectedBox = null;
    pendingMove = null;
  }, 500);
}

function addBox() {
  boxID++;
  const box = document.createElement("div");
  box.innerHTML = boxID;
  box.classList.add("box");
  group1.append(box);
  box.addEventListener("click", selectBox);
}

const btnAddBox = document.querySelector("#btnAddBox");
const group1 = document.querySelector("#group1");
const group2 = document.querySelector("#group2");

btnAddBox.addEventListener("click", addBox);
group1.addEventListener("click", moveSelectedBoxToGroup);
group2.addEventListener("click", moveSelectedBoxToGroup);
