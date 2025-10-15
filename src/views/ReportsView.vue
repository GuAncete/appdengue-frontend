<template>
  <div class="reports-container">
    <header class="reports-header">
      <h1>Relatório de Denúncias</h1>
      <button @click="$emit('back-to-map')" class="back-button">Voltar ao Mapa</button>
    </header>

    <div v-if="loading" class="loading-message">
      <p>Carregando relatórios...</p>
    </div>

    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <div v-if="!loading && !error" class="reports-table-wrapper">
      <table class="reports-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descrição</th>
            <th>Data de Criação</th>
            <th>Data de Finalização</th>
            <th>Tempo de Resolução</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in relatorio" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.descricao }}</td>
            <td>{{ formatarData(item.data_criacao) }}</td>
            <td>{{ formatarData(item.data_finalizacao) }}</td>
            <td>{{ item.tempo_resolucao || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/apiClient';

defineEmits(['back-to-map']);

const relatorio = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await apiClient.get('/relatorio/denuncias');
    relatorio.value = response.data;
  } catch (err) {
    if (err.response && err.response.status === 403) {
      error.value = 'Acesso não autorizado. Você precisa ser um administrador para ver esta página.';
    } else {
      error.value = 'Ocorreu um erro ao carregar os relatórios.';
    }
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const formatarData = (data) => {
  if (!data) return '—';
  return new Date(data).toLocaleString('pt-BR');
};
</script>

<style scoped>
.reports-container {
  padding: 2rem;
  background-color: #f4f7f6;
  height: 100vh;
  overflow-y: auto;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #007BFF;
  padding-bottom: 1rem;
}

.reports-header h1 {
  color: #007BFF;
  font-size: 2rem;
}

.back-button {
  background-color: #007BFF;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.loading-message, .error-message {
  text-align: center;
  font-size: 1.2rem;
  color: #555;
}

.error-message {
  color: #d9534f;
}

.reports-table-wrapper {
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table th, .reports-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.reports-table td {
  color: #333; 
}

.reports-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #343a40;
}

.reports-table tbody tr:hover {
  background-color: #f1f1f1;
}
</style>