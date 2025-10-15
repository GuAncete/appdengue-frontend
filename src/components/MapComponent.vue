<template>
  <div id="map-container"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- INÍCIO DA CORREÇÃO GLOBAL ---
// Garante que o ícone padrão do Leaflet (incluindo a sombra) sempre funcione.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
// --- FIM DA CORREÇÃO GLOBAL ---

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

  // Lógica de Geolocalização
  if (navigator.geolocation) {
    // Pede a localização atual do dispositivo
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // SUCESSO: Obtivemos a localização
        const userLocation = [position.coords.latitude, position.coords.longitude];
        
        // Centraliza o mapa na localização do usuário com um zoom mais próximo
        map.value.setView(userLocation, 15);

        // --- INÍCIO DA IMPLEMENTAÇÃO NOVA ---
        // Adiciona um marcador azul para a localização do usuário
        L.marker(userLocation, {
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        }).addTo(map.value) // Adiciona ao mapa principal
          .bindPopup("Você está aqui!")
          .openPopup();
        // --- FIM DA IMPLEMENTAÇÃO NOVA ---
      },
      (error) => {
        // ERRO: O usuário negou ou houve uma falha. O mapa continuará na localização padrão.
        console.warn("Não foi possível obter a localização do usuário:", error.message);
      }
    );
  } else {
    // Se o navegador não suportar geolocalização, informa no console.
    console.error("Geolocalização não é suportada por este navegador.");
  }
});

// SUBSTITUA SEU WATCH ANTIGO POR ESTE
watch(() => props.ocorrencias, (newOcorrencias) => {
  if (!map.value || !markersLayer.value) return;
  markersLayer.value.clearLayers();

  newOcorrencias.forEach(ocorrencia => {

    // Define as opções do ícone baseado no status da denúncia
    const iconOptions = {
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    };

    if (ocorrencia.data_fim) {
      // Se finalizada, usa o ícone verde
      iconOptions.iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
    } else {
      // Se pendente, usa o ícone vermelho
      iconOptions.iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
    }

    // Cria um ícone novinho em folha para cada marcador
    const markerIcon = L.icon(iconOptions);

    const marker = L.marker([ocorrencia.lat, ocorrencia.lng], { icon: markerIcon }).addTo(markersLayer.value);

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

