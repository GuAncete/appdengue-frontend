<template>
  <div v-if="currentPage === 'map'">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Home</span>
            </a>
          </li>

          <li v-if="user && user.id === 1">
            <a href="#" @click.prevent="showPage('users')">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Gerir Utilizadores</span>
            </a>
          </li>

          <li>
            <a href="#" @click.prevent="handleLogout">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" x2="9" y1="12" y2="12"></line>
              </svg>
              <span>Sair</span>
            </a>
          </li>
        </ul>
      </nav>

      <button @click="toggleMenu" class="menu-toggle-button" title="Abrir Menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" x2="20" y1="6" y2="6"></line>
          <line x1="4" x2="20" y1="12" y2="12"></line>
          <line x1="4" x2="20" y1="18" y2="18"></line>
        </svg>
      </button>

      <main class="main-content">
        <MapComponent :ocorrencias="listaDeDenuncias" :is-menu-open="isMenuOpen" @marker-click="showDenunciaDetails" />
        
        <button @click="openAddModal" class="fab-add-button" v-if="isMobile" title="Adicionar Novo Foco"
          :disabled="isGettingLocation">
          <svg v-if="!isGettingLocation" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <svg v-else class="spinner" viewBox="0 0 50 50">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
          </svg>
        </button>

        <AddOccurrenceModal v-if="newDenunciaLocation" :location="newDenunciaLocation" @save="saveDenuncia"
          @cancel="newDenunciaLocation = null" />

        <DenunciaDetailModal v-if="selectedDenuncia" :denuncia="selectedDenuncia" @close="selectedDenuncia = null" />
      </main>
    </div>
  </div>

  <div v-else-if="currentPage === 'users'">
    <UsersView @back-to-map="showPage('map')" />
  </div>

  <div v-else-if="currentPage === 'login'">
    <LoginView @login-success="handleLoginSuccess" @show-page="showPage" />
  </div>

  <div v-else-if="currentPage === 'register'">
    <RegisterView @show-page="showPage" />
  </div>

  <div v-else-if="currentPage === 'forgot-password'">
    <ForgotPasswordView @show-page="showPage" />
  </div>
  
  <div v-else-if="currentPage === 'reset-password'">
    <ResetPasswordView @show-page="showPage" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MapComponent from './components/MapComponent.vue';
import AddOccurrenceModal from './components/AddOccurrenceModal.vue';
import apiClient from './services/apiClient.js';
import UsersView from './views/UsersView.vue';
import DenunciaDetailModal from './components/DenunciaDetailModal.vue';
import LoginView from './views/LoginView.vue';
import RegisterView from './views/RegisterView.vue';
import ForgotPasswordView from './views/ForgotPasswordView.vue';
import ResetPasswordView from './views/ResetPasswordView.vue';

const currentPage = ref('');
const user = ref(null);
const isMenuOpen = ref(false);
const listaDeDenuncias = ref([]);
const selectedDenuncia = ref(null);
const newDenunciaLocation = ref(null);
const isGettingLocation = ref(false);
const isMobile = ref(false);

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function handleLoginSuccess(data) {
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('authUser', JSON.stringify(data.user));
  user.value = data.user;
  // **CORRIGIDO:** Adicionado o acento grave (`) para o template literal
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

  fetchDenuncias();
  currentPage.value = 'map';
}

function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  user.value = null;
  delete apiClient.defaults.headers.common['Authorization'];
  currentPage.value = 'login';
}

async function fetchDenuncias() {
  try {
    const response = await apiClient.get('/denuncias');

    const denunciasMapeadas = response.data.denuncias.map(item => {
      let fotoUrl = null;
      if (item.fotos && item.fotos.length > 0 && item.fotos[0].url) {
        // Usa uma expressão regular para extrair o URL real de dentro da string de Markdown
        const match = item.fotos[0].url.match(/\((.*?)\)/);
        if (match && match[1]) {
          fotoUrl = match[1];
        } else {
          // Se não for o formato de Markdown, usa o URL como está (mais seguro)
          fotoUrl = item.fotos[0].url;
        }
      }

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
    if (error.response && error.response.status === 401) {
      handleLogout();
    }
  }
}

onMounted(() => {
  isMobile.value = isMobileDevice();

  if (window.location.pathname === '/reset-password') {
    currentPage.value = 'reset-password';
    return;
  }

  const token = localStorage.getItem('authToken');
  const savedUser = localStorage.getItem('authUser');

  if (token && savedUser) {
    user.value = JSON.parse(savedUser);
    // **CORRIGIDO:** Adicionado o acento grave (`) para o template literal
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchDenuncias();
    currentPage.value = 'map';
  } else {
    currentPage.value = 'login';
  }
});

async function openAddModal() {
  if (!navigator.geolocation) {
    alert("Geolocalização não é suportada pelo seu navegador.");
    return;
  }

  isGettingLocation.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      newDenunciaLocation.value = { lat: position.coords.latitude, lng: position.coords.longitude };
      isGettingLocation.value = false;
    },
    (error) => {
      // **CORRIGIDO:** Adicionado o acento grave (`) para o template literal
      alert(`Erro ao obter localização: ${error.message}`);
      isGettingLocation.value = false;
    }
  );
}

async function saveDenuncia(formData) {
  if (!formData.location || !user.value || !formData.foto) return;
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
    if (!novaDenunciaId) throw new Error("O back-end não retornou o ID.");

    const fotoPayload = new FormData();
    fotoPayload.append('foto', formData.foto);

    // **CORRIGIDO:** Adicionado o acento grave (`) para o template literal da URL
    await apiClient.post(`/fotos/${novaDenunciaId}`, fotoPayload, { headers: { 'Content-Type': 'multipart/form-data' } });

    alert("Denúncia registada com sucesso!");
    newDenunciaLocation.value = null;
    await fetchDenuncias();
  } catch (error) {
    console.error("Erro ao salvar denúncia:", error);
    alert("Houve um erro ao registar a denúncia.");
  }
}

function showPage(page) { currentPage.value = page; isMenuOpen.value = false; }
function toggleMenu() { isMenuOpen.value = !isMenuOpen.value; }
function showDenunciaDetails(denunciaId) {
  const foundDenuncia = listaDeDenuncias.value.find(d => d.id === denunciaId);
  if (foundDenuncia) { selectedDenuncia.value = foundDenuncia; }
}
</script>

<style>
/* O seu CSS foi omitido por brevidade. */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

body,
html {
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  background-color: #f0f2f5;
}

#app-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.menu-toggle-button {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1500;
  width: 50px;
  height: 50px;
  background-color: white;
  color: #007BFF;
  border: none;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sidebar-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background-color: white;
  z-index: 2000;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.sidebar-menu.is-open {
  transform: translateX(0);
}

.menu-header {
  padding: 20px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #007BFF;
  border-bottom: 1px solid #e9ecef;
}

.user-info {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 5px;
  font-weight: 400;
}

.sidebar-menu ul {
  list-style: none;
  padding: 20px 0;
  margin: 0;
}

.sidebar-menu li a {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  color: #343a40;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1999;
}

.fab-add-button {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #007BFF, #00C6FF);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

.fab-add-button:disabled {
  background: #ced4da;
  cursor: not-allowed;
}

.spinner {
  animation: rotate 2s linear infinite;
  width: 25px;
  height: 25px;
}

.spinner .path {
  stroke: white;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }

  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>