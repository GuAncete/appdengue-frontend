<template>
  <div class="users-container">
    <header class="users-header">
      <!-- Este link avisa o App.vue para voltar a mostrar o mapa -->
      <a href="#" @click.prevent="$emit('back-to-map')" class="back-link">&larr; Voltar para o Mapa</a>
      <h1>Lista de Utilizadores</h1>
      <p>Gerenciamento de todos os utilizadores registados no sistema.</p>
    </header>
    <div v-if="loading" class="loading-message">A carregar utilizadores...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="!loading && !error" class="users-table-wrapper">
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Data de Criação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ new Date(user.created_at).toLocaleDateString('pt-BR') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../services/apiClient';

// Define que este componente pode emitir o evento 'back-to-map'
defineEmits(['back-to-map']);

const users = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    users.value = response.data;
  } catch (err) {
    error.value = 'Ocorreu um erro ao carregar os utilizadores. Verifique se a API está a funcionar.';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
/* Estilos para a página de utilizadores */
.users-container {
  padding: 30px;
  background-color: #f8f9fa;
  min-height: 100vh;
  color: #333;
}
.users-header {
  margin-bottom: 25px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 20px;
}
.back-link {
  display: block;
  margin-bottom: 15px;
  text-decoration: none;
  color: #007BFF;
  font-weight: 500;
}
.users-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}
.users-header p {
  margin-top: 5px;
  color: #6c757d;
}
.loading-message, .error-message {
  text-align: center;
  font-size: 1.2rem;
  padding: 40px;
}
.error-message {
  color: #DC3545;
}
.users-table-wrapper {
  overflow-x: auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.users-table {
  width: 100%;
  border-collapse: collapse;
}
.users-table th, .users-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}
.users-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  color: #495057;
}
.users-table tbody tr:last-child td {
  border-bottom: none;
}
.users-table tbody tr:hover {
  background-color: #f1f3f5;
}
</style>

