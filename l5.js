/* 
   Lesson 5 — jQuery Intro:
   $(selector)
   .remove()
   .attr(), .html(), .addClass()
   jQuery event binding: .on("click", fn)
   Creating DOM elements with $("<tag>")
   */

document.querySelector("#btnRunSample1").addEventListener("click", () => {
  const as = document.querySelectorAll("#links a");

  // Vanilla JS cannot remove a NodeList with .remove()
  for (const a of as) a.remove();

  const btn = document.createElement("a");
  btn.innerHTML = "jQuery CDN (Content Delivery Network)";
  btn.classList.add("special-button");
  btn.href = "javascript:;";
  btn.title = "Custom Link!";
  btn.addEventListener("click", () => {
    window.open("https://releases.jquery.com/");
  });

  document.querySelector("#links").append(btn);
});


// jQuery version
$("#btnRunSample2").on("click", () => {

  $("#links a").remove();  // works on entire set

  const btn = $("<a>");
  btn.html("jQuery CDN (Content Delivery Network)");
  btn.attr({"href": "javascript:;", "title": "Custom Link!"});
  btn.on("click", () => window.open("https://releases.jquery.com/"));

  $("#links").append(btn);
});
