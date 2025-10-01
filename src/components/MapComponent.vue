<template>
  <div id="map-container"></div>
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

// --- PROPS E EMITS ---
const props = defineProps({
  ocorrencias: { type: Array, required: true },
});
const emit = defineEmits(['marker-click']);

const map = ref(null);
const markersLayer = ref(null);

onMounted(() => {
  // Define uma localização padrão (fallback)
  const defaultLocation = [-20.421, -50.972];
  
  // Inicializa o mapa com a localização padrão
  map.value = L.map('map-container').setView(defaultLocation, 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map.value);
  
  markersLayer.value = L.layerGroup().addTo(map.value);

  // **** LÓGICA DE GEOLOCALIZAÇÃO INICIAL RESTAURADA ****
  if (navigator.geolocation) {
    // Pede a localização atual do dispositivo
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // SUCESSO: Centra o mapa na localização do utilizador
        const userLocation = [position.coords.latitude, position.coords.longitude];
        map.value.setView(userLocation, 15); // Usa um zoom mais próximo
      },
      (error) => {
        // ERRO: O utilizador negou ou houve uma falha. O mapa já está na localização padrão.
        console.warn("Não foi possível obter a localização do utilizador:", error.message);
      }
    );
  }

  // Garante que o mapa se redimensiona corretamente
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
    let icone = ocorrencia.status === 'resolvido' ? greenIcon : redIcon;

    const marker = L.marker([ocorrencia.lat, ocorrencia.lng], { icon: icone }).addTo(markersLayer.value);
    
    // O clique no marcador agora emite um evento para o App.vue
    marker.on('click', () => {
      emit('marker-click', ocorrencia.id);
    });
  });
}, { deep: true });
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

