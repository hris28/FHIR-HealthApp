let map, markers = [];

function initMap() {
  map = L.map("map").setView([39.5, -98.35], 4);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
}

function clearMarkers() {
  markers.forEach(m => m.remove());
  markers = [];
}

function locationTypeLabel(loc) {
  return loc.type?.[0]?.coding?.[0]?.display || loc.type?.[0]?.text || "Unknown type";
}

function popupContent(loc) {
  const name = loc.name || "Unnamed";
  const type = locationTypeLabel(loc);

  const address = loc.address
    ? `${(loc.address.line||[]).join(", ")}<br/>${loc.address.city||""}, ${loc.address.state||""}`
    : "Address not available";

  return `<strong>${name}</strong><br/><em>${type}</em><br/><br/>${address}`;
}

function renderLocationsOnMap(locations) {
  clearMarkers();

  const withCoords = locations.filter(l => l.position?.latitude && l.position?.longitude);

  withCoords.forEach(loc => {
    const lat = loc.position.latitude;
    const lng = loc.position.longitude;

    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindTooltip(loc.name || "Unnamed Location");
    marker.bindPopup(popupContent(loc));

    marker.on("click", function () {
      map.setView(this.getLatLng(), 8);
    });

    markers.push(marker);
  });

  return { total: locations.length, withCoords: withCoords.length };
}
