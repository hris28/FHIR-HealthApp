/*
 * - Query FHIR Location resources from the SMART demo server
 * - Display them as markers on a Leaflet map
 * - Show a tooltip on hover
 * - Show a detailed popup on click
 */

// Create FHIR client. Connect to the SMART Health IT demo FHIR server.
const client = FHIR.client("https://r3.smarthealthit.org");

// DOM
const filterSelect = document.querySelector("#filterSelect");

// Initialize Leaflet map
const map = L.map("map").setView(
    [39.5, -98.35], // US-centered view
    4 //Zoom level
); 

// Map OpenStreetMap tiles as the base layer
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// Store markers so we can remove them later
let markers = [];

// Store all locations once
let allLocations = [];
let uniqueLocations = [];

// Load/fetch location data from FHIR API
/* client.request("Location")
  .then(displayLocations)
  .catch(console.error); */
  // above renders the locations immediately. below stores it first.
  client.request("Location")
  .then(bundle => {
    if (!bundle.entry) {
      console.warn("No Location data returned");
      return;
    }

console.log(
  allLocations.map(l => ({
    name: l.name,
    hasPosition: !!l.position,
    type: l.type?.[0]?.coding?.[0]?.display
  }))
);

    allLocations = bundle.entry.map(e => e.resource);
    uniqueLocations = dedupeByName(allLocations);

    // Initial render
    displayLocations(uniqueLocations);
  })
  .catch(console.error);

// Deduplicate locations by name
function dedupeByName(locations) {
  const seen = new Map();

  locations.forEach(loc => {
    if (!loc.name) return;
    if (!seen.has(loc.name)) {
      seen.set(loc.name, loc);
    }
  });

  return Array.from(seen.values());
}

function displayLocations(locations) {
  clearMarkers();
// We are no longer passing a FHIR Bundle. We are passing an array of Location resources.
  locations.forEach(location => {
    if (!location.position) return;

    const lat = location.position.latitude;
    const lng = location.position.longitude;

    const marker = L.marker([lat, lng]).addTo(map);

    marker.bindTooltip(
      location.name || "Unnamed Location",
      { direction: "top" }
    );

    marker.bindPopup(popupContent(location));

    marker.on("click", function () {
      map.setView(this.getLatLng(), 8);
    });

    markers.push(marker);
  });
}

function popupContent(location) {
  const name = location.name || "Unnamed Location";

  const address = location.address
    ? `
        ${location.address.line?.join(", ") || ""}<br/>
        ${location.address.city || ""},
        ${location.address.state || ""}
      `
    : "Address not available";

  /* const type = location.type?.[0]?.coding?.[0]?.display
    || "Unknown type"; */

  const hasCoords = location.position
    ? "Has coordinates"
    : "No coordinates";

  return `
    <strong>${name}</strong><br/>
    <em>${hasCoords}</em><br/><br/>
    ${address}
  `;

}


function clearMarkers() {
  markers.forEach(marker => marker.remove());
  markers = [];
}

filterSelect.addEventListener("change", () => {
  const value = filterSelect.value;

  if (value === "ALL") {
    displayLocations(uniqueLocations);
  }

  if (value === "MAPPABLE") {
    displayLocations(uniqueLocations.filter(l => l.position));
  }

  if (value === "UNMAPPABLE") {
    clearMarkers();
    alert("These locations do not have coordinates and cannot be mapped.");
  }
});
/*
function populateTypeFilter(locations) {
  const seenTypes = new Set();

  typeSelect.innerHTML = `<option value="ALL">All Locations</option>`;

  locations.forEach(loc => {
    const type = loc.type?.[0]?.coding?.[0]?.display;
    if (type) seenTypes.add(type);
  });

  seenTypes.forEach(type => {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type;
    typeSelect.appendChild(opt);
  });
}

typeSelect.addEventListener("change", () => {
  const selected = typeSelect.value;

  if (selected === "ALL") {
    displayLocations(allLocations);
  } else {
    const filtered = allLocations.filter(loc =>
      loc.type?.[0]?.coding?.[0]?.display === selected
    );
    displayLocations(filtered);
  }
}); */

/* Debug manually
console.log(
  allLocations.map(l =>
    l.type?.[0]?.coding?.[0]?.display
  )
);
*/