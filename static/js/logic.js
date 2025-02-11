// Create the 'basemap' tile layer that will be the background of our map.
let basemap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  }
);

// Create the map object with center and zoom options.
let map = L.map("map", {
  center: [40.7, -94.5],
  zoom: 5
});

// Then add the 'basemap' tile layer to the map.
basemap.addTo(map);

// Function to determine marker size based on earthquake magnitude
function markerSize(magnitude) {
  return magnitude * 4;
}

// Function to determine marker color based on earthquake depth
function getColor(depth) {
  return depth > 100 ? '#800026' :
         depth > 50  ? '#BD0026' :
         depth > 20  ? '#E31A1C' :
         depth > 10  ? '#FC4E2A' :
         depth > 5   ? '#FD8D3C' :
         depth > 0   ? '#FEB24C' :
                       '#FFEDA0';
}

// Load earthquake data and add to map
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(
  (data) => {
    L.geoJson(data, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: markerSize(feature.properties.mag),
          fillColor: getColor(feature.geometry.coordinates[2]),
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place + "<br>Depth: " + feature.geometry.coordinates[2] + " km");
      }
    }).addTo(map);
  }
);

// Load and display tectonic plates data
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(
  (plateData) => {
    L.geoJson(plateData, {
      color: "orange",
      weight: 2
    }).addTo(map);
  }
);

// Create a legend to display information about the map
var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "legend"),
      depths = [0, 5, 10, 20, 50, 100],
      labels = [];

  // Loop through our density intervals and generate a label with a colored square for each interval
  div.innerHTML = '<strong>Depth (km)</strong><br>';
  for (var i = 0; i < depths.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(depths[i] + 1) + '">&nbsp;&nbsp;&nbsp;&nbsp;</i> ' +
      depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
  }

  return div;
};

// Adding legend to the map
legend.addTo(map);
