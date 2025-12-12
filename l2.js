/* =========================================================
   LESSON 2 — JavaScript Events, `this`, and DOM Manipulation
   =========================================================
   This file covers:

   ✔ Selecting DOM elements
   ✔ Using event listeners
   ✔ How `this` behaves inside an event
   ✔ Updating HTML content (.innerHTML)
   ✔ Looping over list items
   ✔ parseInt and why it's needed
========================================================= */

// ============
// 1. Rename Buttons
// ============

/*
 When you click a button, the event listener triggers renameButton().
 Inside renameButton(), the keyword `this` refers to the button
 that was clicked.

 Example:
   - If user clicks btn2, then `this === <button id="btn2">`
*/

function renameButton() {
  const newLabel = prompt("What should this button be called?");

  // User clicked Cancel → newLabel is null
  if (newLabel === null) return;

  const cleaned = newLabel.trim();
  if (cleaned !== "") {
    // "Reassigning" means changing the value stored in a variable/property.
    // Here, we are replacing the text displayed on the button.
    this.innerHTML = cleaned;
  }
}

// Attach renameButton() to all three demo buttons.
document.querySelector("#btn1").addEventListener("click", renameButton);
document.querySelector("#btn2").addEventListener("click", renameButton);
document.querySelector("#btn3").addEventListener("click", renameButton);


// ============
// 2. Double Numbers in List
// ============

/*
 This function demonstrates:
  - querySelectorAll() to get multiple DOM elements
  - Looping through a NodeList
  - parseInt() for converting strings to numbers
  - Updating list items dynamically
*/

function doubleListNumbers() {
  const items = document.querySelectorAll("#list2 li");

  for (let i = 0; i < items.length; i++) {
    const currentText = items[i].innerHTML.trim();
    const num = parseInt(currentText, 10);  // parse base-10 number

    if (!isNaN(num)) {
      items[i].innerHTML = num * 2;
    }
  }
}

document.querySelector("#doubleListBtn")
        .addEventListener("click", doubleListNumbers);
