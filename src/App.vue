<script setup>
// 1. Importa o componente do mapa que acabamos de criar.
import MapComponent from './components/MapComponent.vue'
</script>

<template>
  <!-- 2. Exibe o componente do mapa na tela. -->
  <MapComponent />
</template>

<style>
/* 3. Estilo global para remover margens e garantir
      que o mapa ocupe a tela inteira, sem barras de rolagem. */
body, html {
  margin: 0;
  padding: 0;
  overflow: hidden; /* Esconde barras de rolagem */
}
</style>
