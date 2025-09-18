<template>
  <div v-if="currentPage === 'login'">
    <LoginView 
      @login-success="handleLoginSuccess" 
      @go-to-register="showPage('register')" 
    />
  </div>

  <div v-else-if="currentPage === 'register'">
    <RegisterView @go-to-login="showPage('login')" />
  </div>

  <div v-else-if="currentPage === 'map'">
    <div id="app-container">
      <div v-if="isMenuOpen" class="menu-overlay" @click="toggleMenu"></div>

      <nav class="sidebar-menu" :class="{ 'is-open': isMenuOpen }">
        <div class="menu-header">
          <h3>App Dengue</h3>
          <p v-if="user" class="user-info">Olá, {{ user.name }}</p>
        </div>
        <ul>
          <li>
            <a href="#" @click.prevent="showPage('map')">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span>Home</span>
            </a>
          </li>
          <li v-if="user && user.id === 1">
            <a href="#" @click.prevent="showPage('users')">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Gerir Utilizadores</span>
            </a>
          </li>
           <li>
            <a href="#" @click.prevent="handleLogout">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
              <span>Sair</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <button @click="toggleMenu" class="menu-toggle-button" title="Abrir Menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
      </button>

      <main class="main-content">
        <MapComponent 
          :ocorrencias="listaDeDenuncias"
          :is-menu-open="isMenuOpen"
          @marker-click="showDenunciaDetails" 
        />
        <button @click="openAddModal" class="fab-add-button" title="Adicionar Novo Foco">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <AddOccurrenceModal 
          v-if="isAddModalOpen"
          @save="saveDenuncia"
          @cancel="isAddModalOpen = false"
        />
        <DenunciaDetailModal
          v-if="selectedDenuncia"
          :denuncia="selectedDenuncia"
          @close="selectedDenuncia = null"
        />
      </main>
    </div>
  </div>

  <div v-else-if="currentPage === 'users'">
    <UsersView @back-to-map="showPage('map')" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MapComponent from './components/MapComponent.vue';
import AddOccurrenceModal from './components/AddOccurrenceModal.vue';
import apiClient from './services/apiClient.js';
import UsersView from './views/UsersView.vue';
import DenunciaDetailModal from './components/DenunciaDetailModal.vue';
// IMPORTAÇÃO DAS SUAS NOVAS PÁGINAS
import LoginView from './views/LoginView.vue';
import RegisterView from './views/RegisterView.vue';

const currentPage = ref('login'); // O APP AGORA COMEÇA NA PÁGINA DE LOGIN
const user = ref(null); // O USUÁRIO COMEÇA COMO NULO, NÃO MAIS SIMULADO
const isMenuOpen = ref(false);
const listaDeDenuncias = ref([]);
const selectedDenuncia = ref(null);
const isAddModalOpen = ref(false);

// NOVA FUNÇÃO PARA LIDAR COM O LOGIN BEM-SUCEDIDO
function handleLoginSuccess(data) {
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('authUser', JSON.stringify(data.user));
  user.value = data.user;
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  
  fetchDenuncias(); 
  currentPage.value = 'map';
}

// NOVA FUNÇÃO DE LOGOUT
function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  user.value = null;
  delete apiClient.defaults.headers.common['Authorization'];
  currentPage.value = 'login';
}

// FUNÇÃO ORIGINAL, AGORA CHAMADA APÓS O LOGIN
async function fetchDenuncias() {
  try {
    const response = await apiClient.get('/denuncias');
    const denunciasMapeadas = response.data.denuncias.map(item => {
      const fotoUrl = (item.fotos && item.fotos.length > 0 && item.fotos[0].url) ? item.fotos[0].url : null;
      return {
        id: item.IdDenuncia,
        lat: parseFloat(item.Latitude),
        lng: parseFloat(item.Longitude),
        status: item.Status === 1 ? 'pendente' : (item.Status === 3 ? 'resolvido' : 'em_analise'),
        descricao: item.Descricao,
        foto_url: fotoUrl
      };
    });
    listaDeDenuncias.value = denunciasMapeadas;
  } catch (error) {
    console.error("Erro ao buscar denúncias:", error);
    if(error.response && error.response.status === 401) {
        handleLogout(); 
    }
  }
}

// LÓGICA ATUALIZADA PARA MANTER O USUÁRIO LOGADO
onMounted(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');

    if (token && savedUser) {
        user.value = JSON.parse(savedUser);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchDenuncias();
        currentPage.value = 'map';
    } else {
        currentPage.value = 'login';
    }
});

// Funções preservadas
function openAddModal() {
  isAddModalOpen.value = true;
}

function showPage(page) {
  currentPage.value = page;
  isMenuOpen.value = false;
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function showDenunciaDetails(denunciaId) {
  const foundDenuncia = listaDeDenuncias.value.find(d => d.id === denunciaId);
  if (foundDenuncia) {
    selectedDenuncia.value = foundDenuncia;
  }
}

async function saveDenuncia(formData) {
  if (!formData.location || !user.value || !formData.foto) {
    alert("Erro: Dados incompletos recebidos do modal.");
    return;
  }

  const denuciaPayload = {
    IdUsuario: user.value.id,
    TipoFoco: 1,
    Descricao: formData.descricao,
    Latitude: formData.location.lat,
    Longitude: formData.location.lng,
    Status: 1,
  };

  try {
    const responseDenuncia = await apiClient.post('/denuncias', denuciaPayload);
    const novaDenunciaId = responseDenuncia.data.denuncia.IdDenuncia;

    if (!novaDenunciaId) throw new Error("O back-end não retornou o ID da nova denúncia.");

    const fotoPayload = new FormData();
    fotoPayload.append('foto', formData.foto);

    await apiClient.post(`/fotos/${novaDenunciaId}`, fotoPayload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    alert("Denúncia e foto registadas com sucesso!");
    isAddModalOpen.value = false;
    await fetchDenuncias();

  } catch (error) {
    console.error("Erro ao salvar denúncia ou foto:", error.response?.data || error);
    alert("Houve um erro ao registar a denúncia.");
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
body, html { margin: 0; padding: 0; overflow: hidden; font-family: 'Inter', sans-serif; background-color: #f0f2f5; }
#app-container { position: relative; width: 100vw; height: 100vh; overflow: hidden; }
.main-content { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
.menu-toggle-button { position: absolute; top: 20px; right: 20px; z-index: 1500; width: 50px; height: 50px; background-color: white; color: #007BFF; border: none; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); transition: all 0.2s ease-in-out; }
.sidebar-menu { position: fixed; top: 0; left: 0; width: 280px; height: 100%; background-color: white; z-index: 2000; transform: translateX(-100%); transition: transform 0.3s ease-in-out; box-shadow: 0 0 20px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
.sidebar-menu.is-open { transform: translateX(0); }
.menu-header { padding: 20px; font-size: 1.5rem; font-weight: 700; color: #007BFF; border-bottom: 1px solid #e9ecef; }
.user-info { font-size: 0.9rem; color: #6c757d; margin-top: 5px; font-weight: 400; }
.sidebar-menu ul { list-style: none; padding: 20px 0; margin: 0; }
.sidebar-menu li a { display: flex; align-items: center; gap: 15px; padding: 15px 20px; color: #343a40; text-decoration: none; font-weight: 500; transition: all 0.2s ease-in-out; cursor: pointer; }
.menu-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.4); z-index: 1999; }
.fab-add-button { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 1000; width: 60px; height: 60px; background: linear-gradient(45deg, #007BFF, #00C6FF); color: white; border: none; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4); }
</style>