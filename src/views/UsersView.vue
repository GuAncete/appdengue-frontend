<template>
  <div class="users-page-container">
    <main class="users-content">
      <header class="users-header">
        <a href="#" @click.prevent="$emit('back-to-map')" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="12" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span>Voltar para o Mapa</span>
        </a>
        <h1>Gestão de Utilizadores</h1>
        <p>Visualize e gira os utilizadores registados no sistema.</p>
      </header>

      <div v-if="loading" class="feedback-container">
        <div class="spinner"></div>
        <p>A carregar utilizadores...</p>
      </div>

      <div v-if="error" class="feedback-container error">
        <p>{{ error }}</p>
        <button @click="fetchUsers" class="retry-button">Tentar Novamente</button>
      </div>

      <div v-if="!loading && !error" class="users-table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Data de Criação</th>
              <th>Cargo</th> <th>Ações</th> </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td colspan="7" class="no-users-message">Nenhum utilizador encontrado.</td>
            </tr>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone || 'N/A' }}</td>
              <td>{{ new Date(user.created_at).toLocaleDateString('pt-BR') }}</td>
              
              <td>
                <select v-model="user.user_tipo" class="role-select">
                  <option :value="1">Admin</option>
                  <option :value="2">Funcionário</option>
                  <option :value="3">Comum</option>
                </select>
              </td>

              <td>
                <button @click="updateUserRole(user)" class="save-button">
                  Salvar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
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
  loading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get('/users');
    // A API do Laravel para o 'index' geralmente retorna os dados dentro de um objeto de paginação.
    users.value = response.data.users.data || response.data.users || response.data;

    // IMPORTANTE: Certifique-se de que sua API está retornando o campo 'user_tipo' para cada usuário.
    // Se não estiver, o dropdown não funcionará corretamente.

  } catch (err) {
    error.value = 'Ocorreu um erro ao carregar os utilizadores. Por favor, tente novamente.';
    console.error("Erro ao buscar utilizadores:", err);
  } finally {
    loading.value = false;
  }
};

// src/views/UsersView.vue -> dentro do <script setup>

// NOVO: Função para atualizar o cargo do usuário (versão corrigida)
const updateUserRole = async (user) => {
  try {
    // Agora o payload é muito mais simples!
    const payload = {
      user_tipo: user.user_tipo,
    };

    // Usamos a nova rota PATCH e enviamos apenas o cargo.
    await apiClient.patch(`/users/${user.id}/role`, payload);

    // Damos um feedback de sucesso
    alert(`Cargo de ${user.name} atualizado com sucesso!`);

  } catch (err) {
    alert('Ocorreu um erro ao atualizar o cargo. Veja o console para detalhes.');
    console.error("Erro ao atualizar o cargo:", err);
    // Recarrega os usuários para reverter a mudança visual no dropdown em caso de erro
    fetchUsers(); 
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
/* Estilos completamente renovados para a página de utilizadores */

.users-page-container {
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

.users-content {
  width: 100%;
  max-width: 1100px; /* Aumentei um pouco a largura para as novas colunas */
  padding: 40px;
  box-sizing: border-box;
}

.users-header {
  margin-bottom: 30px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  text-decoration: none;
  color: #007BFF;
  font-weight: 600;
  transition: color 0.2s;
}
.back-link:hover {
  color: #0056b3;
}

.users-header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #212529;
}

.users-header p {
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

.feedback-container.error {
  color: #721c24;
  background-color: #f8d7da;
}

.retry-button {
  margin-top: 20px;
  padding: 10px 20px;
  border: none;
  background-color: #DC3545;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}
.retry-button:hover {
  background-color: #c82333;
}

.users-table-wrapper {
  overflow-x: auto;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.07);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th, .users-table td {
  padding: 18px 20px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle; /* Alinha verticalmente ao centro */
}

.users-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #495057;
}

/* Alinhamento para colunas específicas */
.users-table th:first-child,
.users-table tbody td:first-child { 
  text-align: center;
  width: 1%;
}

.users-table tbody tr:last-child td {
  border-bottom: none;
}

.users-table tbody tr {
  transition: background-color 0.15s ease-in-out;
}

.users-table tbody tr:hover {
  background-color: #f1f3f5;
}

td{
  color: #212529;
}

.no-users-message {
  text-align: center;
  color: #6c757d;
  padding: 40px;
}

/* Animação de Spinner */
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

/* // NOVO: Estilos para o dropdown e botão na tabela */
.role-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background-color: #fff;
  font-size: 0.9rem;
  min-width: 120px;
}

.save-button {
  padding: 8px 16px;
  border: none;
  background-color: #007BFF;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.save-button:hover {
  background-color: #0056b3;
}
</style>