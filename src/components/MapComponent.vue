<template>
  <div id="map-container" :class="{ 'add-mode-cursor': isAddingMode }"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Ícones Customizados ---
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// --- PROPS E EMITS ---
const props = defineProps({
  ocorrencias: { type: Array, required: true },
  isAddingMode: { type: Boolean, default: false }
});
const emit = defineEmits(['map-click']);

const map = ref(null);
const markersLayer = ref(null);

onMounted(() => {
  // Coordenadas aproximadas de Balsamo
  const bounds = L.latLngBounds(
    [-20.76, -49.60], // sudoeste
    [-20.72, -49.56]  // nordeste
  );

  map.value = L.map('map-container', {
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
  }).setView([-20.738426674460733, -49.579619095461986], 15);



  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map.value);

  markersLayer.value = L.layerGroup().addTo(map.value);

  map.value.on('click', (e) => {
    if (props.isAddingMode) {
      emit('map-click', { lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });

  setTimeout(() => {
    if (map.value) {
      map.value.invalidateSize();
    }
  }, 100);
});

watch(() => props.ocorrencias, (newOcorrencias) => {
  if (!map.value || !markersLayer.value) return;
  markersLayer.value.clearLayers();

  newOcorrencias.forEach(ocorrencia => {
    let icone;
    if (ocorrencia.status === 'pendente') icone = redIcon;
    else if (ocorrencia.status === 'resolvido') icone = greenIcon;
    else icone = blueIcon;

    const marker = L.marker([ocorrencia.lat, ocorrencia.lng], { icon: icone }).addTo(markersLayer.value);

    if (ocorrencia.id !== 'temp') {
      marker.bindPopup(`<b>Ocorrência #${ocorrencia.id}</b><br>${ocorrencia.descricao}`);
    }
  });
}, { deep: true });

</script>

<style scoped>
/* CSS ATUALIZADO para forçar o preenchimento do ecrã */
#map-container {
  position: fixed;
  /* Fixa o mapa diretamente na janela do navegador */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  width: 100vw;
}

.add-mode-cursor {
  cursor: crosshair !important;
}
</style>

<style>
/* Estilos Globais para garantir que o layout da página não tenha margens */
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
