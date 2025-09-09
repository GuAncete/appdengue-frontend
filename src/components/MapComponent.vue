<template>
  <!-- Esta div é onde o mapa será renderizado -->
  <div id="map-container"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

// Importações essenciais do Leaflet
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Ícones Customizados ---
// (O código dos ícones permanece o mesmo)
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


// --- PROPS ---
// O componente agora DECLARA que precisa receber uma propriedade chamada 'ocorrencias'.
const props = defineProps({
  ocorrencias: {
    type: Array, // Deve ser uma lista (Array)
    required: true // É obrigatório que essa lista seja passada
  }
});

// Refs para guardar a instância do mapa e a camada de marcadores
const map = ref(null);
const markersLayer = ref(null);


onMounted(() => {
  // Inicializa o mapa UMA VEZ quando o componente é criado.
  map.value = L.map('map-container').setView([-20.4195, -49.9786], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map.value);

  // Cria uma camada (um "grupo") para colocar os marcadores. Isso facilita limpá-los depois.
  markersLayer.value = L.layerGroup().addTo(map.value);
});


// --- WATCHER ---
// Este bloco de código "assiste" a propriedade `ocorrencias`.
// Toda vez que a lista de ocorrências mudar, este código vai rodar novamente.
watch(() => props.ocorrencias, (newOcorrencias) => {
  // Se o mapa ou a camada de marcadores ainda não foram criados, não faça nada.
  if (!map.value || !markersLayer.value) return;

  // 1. Limpa todos os marcadores que já existiam no mapa
  markersLayer.value.clearLayers();

  // 2. Adiciona os novos marcadores
  newOcorrencias.forEach(ocorrencia => {
    const icone = ocorrencia.status === 'pendente' ? redIcon : greenIcon;
    const marker = L.marker([ocorrencia.lat, ocorrencia.lng], { icon: icone }).addTo(markersLayer.value);
    marker.bindPopup(`<b>Ocorrência #${ocorrencia.id}</b><br>${ocorrencia.descricao}`);
  });
}, { deep: true }); // `deep: true` é importante para observar mudanças dentro dos objetos da lista.

</script>

<style scoped>
#map-container {
  height: 100vh;
  width: 100vw;
}
</style>

