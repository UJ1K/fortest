import Feature from "ol/Feature";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Icon from "ol/style/Icon";
import { Point, LineString } from "ol/geom";
import Geolocation from "ol/Geolocation";
import { map } from "./map";
import { OSM } from "ol/source";
import Overlay from "ol/Overlay";

// Layer peta dasar dengan OSM
export const layerPetaDasar = new TileLayer({
  source: new OSM(),
});

// Inisialisasi koordinat awal
let coordinatesStart = [null];

// Membuat fitur garis
const lineFeature = new Feature({
  geometry: new LineString([coordinatesStart]),
});

// Gaya untuk fitur garis
const styleLine = new Style({
  stroke: new Stroke({
    color: '#0080ff', // Warna biru terang
    width: 7,
  }),
});
lineFeature.setStyle(styleLine);

// Gaya untuk fitur lokasi saat ini
export const styleLokasiSekarang = new Style({
  image: new CircleStyle({
    radius: 10,
    fill: new Fill({
      color: '#0080ff',
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 3,
    }),
  }),
});

// Fitur lokasi saat ini
export const featureLokasiSekarang = new Feature({
  geometry: new Point([0, 0]),
});
featureLokasiSekarang.setStyle(styleLokasiSekarang);

// Layer untuk lokasi saat ini dan garis
export const layerLokasiSekarang = new VectorLayer({
  source: new VectorSource({
    features: [featureLokasiSekarang, lineFeature]
  }),
});

// Layer untuk ikon
const iconLayerSource = new VectorSource();
const iconLayer = new VectorLayer({
  source: iconLayerSource,
});

// Fungsi untuk mendapatkan rute dari OpenRouteService
async function getRoute(start, end) {
  const apiKey = '5b3ce3597851110001cf62482fbdefb3b9cc4fd298924d10d9ba22b1'; // Ganti dengan API key Anda
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (json.features && json.features.length > 0) {
      const coordinates = json.features[0].geometry.coordinates;
      const route = coordinates.map(coord => [coord[0], coord[1]]);
      lineFeature.getGeometry().setCoordinates(route);

      const distance = json.features[0].properties.segments[0].distance; 
      const duration = json.features[0].properties.segments[0].duration; 
      updatePopupContent(distance, duration);

      // Tambahkan ikon di titik akhir garis
      addEndIcon(route[route.length - 1]);
    }
  } catch (error) {
    console.error('Error fetching route:', error);
  }
}

// Fungsi untuk memperbarui konten popup
function updatePopupContent(distance, duration) {
  const distanceInKm = (distance / 1000).toFixed(2); 
  const durationInMinutes = (duration / 60).toFixed(2); 
  const popupContent = document.getElementById('popup-content');
  popupContent.innerHTML = `<p>Koordinat: ${coordinatesStart}</p><p>Jarak: ${distanceInKm} km</p><p>Waktu: ${durationInMinutes} menit</p>`; // Reset konten popup
}

// Fungsi untuk menambahkan ikon di titik akhir garis
function addEndIcon(coordinate) {
  // Hapus ikon sebelumnya
  iconLayerSource.clear();

  // Buat fitur ikon baru pada titik akhir garis
  const endIconFeature = new Feature({
    geometry: new Point(coordinate),
  });

  // Gaya untuk ikon titik akhir
  endIconFeature.setStyle(new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'Anchor.png', // Ganti dengan URL gambar ikon Anda
    }),
  }));

  // Tambahkan fitur ikon titik akhir ke sumber data
  iconLayerSource.addFeature(endIconFeature);
}

// Geolocation untuk mendapatkan lokasi saat ini
export const geolocation = new Geolocation({
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: map.getView().getProjection()
});
geolocation.setTracking(true);

geolocation.on('change:position', function() {
  const coordinates = geolocation.getPosition();
  featureLokasiSekarang.setGeometry(coordinates ? new Point(coordinates) : null);

  if (coordinates) {
    getRoute(coordinatesStart, coordinates);
  }
});

// Menambahkan layer ke peta
map.addLayer(layerPetaDasar);
map.addLayer(layerLokasiSekarang);
map.addLayer(iconLayer); 

map.on('singleclick', function (evt) {
  const clickedCoordinate = evt.coordinate;
  coordinatesStart = clickedCoordinate;

  // Perbarui rute dengan titik awal yang baru
  const coordinatesEnd = geolocation.getPosition();
  if (coordinatesEnd) {
    getRoute(coordinatesStart, coordinatesEnd);
  }

  // Update popup content and position
  const popupContent = document.getElementById('popup-content');
  popupContent.innerHTML = `<p>Koordinat: ${clickedCoordinate}</p>`; 
  popupOverlay.setPosition(clickedCoordinate);

  // Buat fitur ikon baru pada titik klik
  const iconFeature = new Feature({
    geometry: new Point(clickedCoordinate),
  });

  // Gaya untuk ikon
  iconFeature.setStyle(new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: '/home/user/fortest/public/Anchor.png', // Ganti dengan URL gambar ikon Anda
    }),
  }));

  // Tambahkan fitur ikon ke sumber data
  iconLayerSource.addFeature(iconFeature);
  console.log('Icon feature added:', iconFeature);
});

// Membuat popup overlay
const popupContainer = document.getElementById('popup');
// const popupContent1 = document.getElementById('popup-content');
const popupCloser = document.getElementById('popup-closer');

const popupOverlay = new Overlay({
  element: popupContainer,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  },
});
map.addOverlay(popupOverlay);

popupCloser.onclick = function () {
  popupOverlay.setPosition(undefined);
  popupCloser.blur();
  return false;
};
