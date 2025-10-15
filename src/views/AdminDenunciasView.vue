<template>
  <div class="admin-page-container">
    <main class="admin-content">
      <header class="admin-header">
        <!-- CORREÇÃO: Voltámos a usar $emit e corrigimos o SVG -->
        <a href="#" @click.prevent="$emit('back-to-map')" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="12" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span>Voltar para o Mapa</span>
        </a>
        <h1>Moderação de Denúncias</h1>
        <p>Aprove ou rejeite as denúncias pendentes enviadas pelos utilizadores.</p>
      </header>

      <!-- O resto do seu template permanece o mesmo -->
      <div v-if="loading" class="feedback-container">
        <div class="spinner"></div>
        <p>A carregar denúncias pendentes...</p>
      </div>
      <div v-if="error" class="feedback-container error">
        <p>{{ error }}</p>
        <button @click="fetchPendingDenuncias" class="retry-button">Tentar Novamente</button>
      </div>
      <div v-if="!loading && !error">
        <div v-if="pendingDenuncias.length === 0" class="feedback-container">
          <p>🎉 Ótimo trabalho! Não há denúncias pendentes para moderação.</p>
        </div>
        <div v-else class="denuncias-grid">
          <div v-for="denuncia in pendingDenuncias" :key="denuncia.IdDenuncia" class="denuncia-card">
            <div class="card-image-container">
              <img v-if="denuncia.fotos && denuncia.fotos.length > 0" :src="denuncia.fotos[0].url" alt="Foto da denúncia" class="denuncia-image">
              <div v-else class="no-image-placeholder">Sem Imagem</div>
            </div>
            <div class="card-content">
              <p class="denuncia-description">{{ denuncia.Descricao }}</p>
              <span class="denuncia-date">
                Enviado em: {{ new Date(denuncia.DataCriacao).toLocaleDateString('pt-BR') }}
              </span>
              <div class="card-actions">
                <button @click="handleStatusUpdate(denuncia.IdDenuncia, 4)" class="action-button reject">Rejeitar</button>
                <button @click="handleStatusUpdate(denuncia.IdDenuncia, 2)" class="action-button approve">Aprovar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '../services/apiClient';

// Definimos os "sinais" (eventos) que este componente pode emitir.
const emit = defineEmits(['back-to-map', 'denuncia-moderated']);

const allDenuncias = ref([]);
const loading = ref(true);
const error = ref(null);

const pendingDenuncias = computed(() => {
  return allDenuncias.value.filter(d => d.Status == 1);
});

const fetchPendingDenuncias = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get('/denuncias');
    allDenuncias.value = response.data.denuncias || [];
  } catch (err) {
    error.value = 'Ocorreu um erro ao carregar as denúncias.';
    console.error("Erro ao buscar denúncias:", err);
  } finally {
    loading.value = false;
  }
};

const handleStatusUpdate = async (denunciaId, newStatus) => {
  try {
    const statusText = newStatus === 2 ? 'aprovada' : 'rejeitada';
    await apiClient.patch(`/denuncias/${denunciaId}/status`, { Status: newStatus });
    
    allDenuncias.value = allDenuncias.value.filter(d => d.IdDenuncia !== denunciaId);

    // Emite o "sinal" para avisar o App.vue que uma denúncia foi moderada.
    emit('denuncia-moderated');

    alert(`Denúncia ${statusText} com sucesso!`);
  } catch (err) {
    alert('Ocorreu um erro ao atualizar a denúncia.');
    console.error("Erro ao atualizar status:", err);
  }
};

onMounted(fetchPendingDenuncias);
</script>

<style scoped>
/* O seu CSS permanece o mesmo */
.admin-page-container {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 40px;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}
.admin-content {
  max-width: 1200px;
  margin: 0 auto;
}
.admin-header {
  margin-bottom: 40px;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  text-decoration: none;
  color: #007BFF;
  font-weight: 600;
}
.admin-header h1 {
  margin: 0;
  font-size: 2.5rem;
  color: #212529;
}
.admin-header p {
  margin-top: 8px;
  color: #6c757d;
  font-size: 1.1rem;
}
.feedback-container {
  text-align: center;
  font-size: 1.2rem;
  padding: 60px 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.07);
  color: #6c757d;
}
.denuncias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}
.denuncia-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.07);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}
.denuncia-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}
.card-image-container {
  width: 100%;
  height: 200px;
  background-color: #e9ecef;
}
.denuncia-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.no-image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #6c757d;
}
.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.denuncia-description {
  margin: 0 0 10px 0;
  color: #212529;
  flex-grow: 1;
}
.denuncia-date {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 20px;
}
.card-actions {
  display: flex;
  gap: 10px;
}
.action-button {
  flex-grow: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.action-button.reject {
  background-color: #f8d7da;
  color: #721c24;
}
.action-button.reject:hover {
  background-color: #f1b0b7;
}
.action-button.approve {
  background-color: #d4edda;
  color: #155724;
}
.action-button.approve:hover {
  background-color: #b1dfbb;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007BFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
