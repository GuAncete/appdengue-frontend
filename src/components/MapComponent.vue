<template>
  <div id="map-container"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Garante que o ícone padrão do Leaflet sempre funcione.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const props = defineProps({
  ocorrencias: { type: Array, required: true },
});
const emit = defineEmits(['marker-click']);

const map = ref(null);
const markersLayer = ref(null);

onMounted(() => {
  const defaultLocation = [-20.421, -50.972];
  map.value = L.map('map-container').setView(defaultLocation, 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map.value);
  
  markersLayer.value = L.layerGroup().addTo(map.value);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = [position.coords.latitude, position.coords.longitude];
        map.value.setView(userLocation, 15);
        L.marker(userLocation, {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        }).addTo(map.value)
          .bindPopup("Você está aqui!")
          .openPopup();
      },
      (error) => {
        console.warn("Não foi possível obter a localização do usuário:", error.message);
      }
    );
  } else {
    console.error("Geolocalização não é suportada por este navegador.");
  }
});

// Observa qualquer mudança na lista de ocorrências.
watch(() => props.ocorrencias, (newOcorrencias) => {
  if (!map.value || !markersLayer.value) return;

  markersLayer.value.clearLayers();

  newOcorrencias.forEach(ocorrencia => {
    const iconOptions = {
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    };

    if (ocorrencia.data_fim) {
      iconOptions.iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
    } else {
      iconOptions.iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
    }

    const markerIcon = L.icon(iconOptions);
    const marker = L.marker([ocorrencia.lat, ocorrencia.lng], { icon: markerIcon });
    
    marker.on('click', () => {
      emit('marker-click', ocorrencia.id);
    });

    marker.addTo(markersLayer.value);
  });
}, { deep: true, immediate: true }); // immediate: true garante que os marcadores sejam desenhados na primeira carga.

</script>

<style scoped>
#map-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
}
</style>

