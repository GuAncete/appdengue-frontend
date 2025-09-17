<template>
  <!-- Se a página atual for 'map', mostra toda a interface do mapa -->
  <div v-if="currentPage === 'map'">
    <div id="app-container">
      <div v-if="isMenuOpen" class="menu-overlay" @click="toggleMenu"></div>

      <nav class="sidebar-menu" :class="{ 'is-open': isMenuOpen }">
        <div class="menu-header">
          <h3>App Dengue</h3>
        </div>
        <ul>
          <li>
            <a href="#" @click.prevent="showPage('map')">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span>Home</span>
            </a>
          </li>
          <li>
            <a href="#">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"></line><line x1="8" x2="21" y1="12" y2="12"></line><line x1="8" x2="21" y1="18" y2="18"></line><line x1="3" x2="3.01" y1="6" y2="6"></line><line x1="3" x2="3.01" y1="12" y2="12"></line><line x1="3" x2="3.01" y1="18" y2="18"></line></svg>
              <span>Minhas Denúncias</span>
            </a>
          </li>
          <li>
            <a href="#">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>Perfil</span>
            </a>
          </li>
          <!-- LINK CONDICIONAL PARA ADMIN -->
          <li v-if="user && user.id === 1">
            <a href="#" @click.prevent="showPage('users')">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Gerir Utilizadores</span>
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
        
        <!-- O modal de adição agora é controlado por uma variável diferente -->
        <AddOccurrenceModal 
          v-if="isAddModalOpen"
          @save="saveDenuncia"
          @cancel="isAddModalOpen = false"
        />

        <!-- Modal de Detalhes da Denúncia -->
        <DenunciaDetailModal
          v-if="selectedDenuncia"
          :denuncia="selectedDenuncia"
          @close="selectedDenuncia = null"
        />
      </main>
    </div>
  </div>

  <!-- Caso contrário, se a página for 'users', mostra o componente de utilizadores -->
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

const currentPage = ref('map');
const user = ref(null);
const isMenuOpen = ref(false);
const listaDeDenuncias = ref([]);
const selectedDenuncia = ref(null);
const isAddModalOpen = ref(false); // NOVO: Controla apenas a visibilidade do modal

const simulateLogin = () => {
  const fakeUser = { id: 1, name: 'Felipe Admin', email: 'felipe@admin.com' };
  user.value = fakeUser;
};

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
  }
}

onMounted(() => {
  simulateLogin();
  fetchDenuncias();
});

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

// **** FUNÇÃO ATUALIZADA PARA RECEBER A LOCALIZAÇÃO DA FOTO ****
async function saveDenuncia(formData) {
  if (!formData.location || !user.value || !formData.foto) {
    alert("Erro: Dados incompletos recebidos do modal.");
    return;
  }

  const denuciaPayload = {
    IdUsuario: user.value.id,
    TipoFoco: 1,
    Descricao: formData.descricao,
    Latitude: formData.location.lat, // Usa a latitude vinda da foto
    Longitude: formData.location.lng, // Usa a longitude vinda da foto
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
    isAddModalOpen.value = false; // Fecha o modal
    await fetchDenuncias(); // Atualiza o mapa

  } catch (error) {
    console.error("Erro ao salvar denúncia ou foto:", error.response?.data || error);
    alert("Houve um erro ao registar a denúncia.");
  }
}
</script>

<style>
/* O seu CSS existente pode ser mantido. Apenas os ícones SVG foram removidos para brevidade. */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
body, html { margin: 0; padding: 0; overflow: hidden; font-family: 'Inter', sans-serif; background-color: #f0f2f5; }
#app-container { position: relative; width: 100vw; height: 100vh; overflow: hidden; }
.main-content { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
.menu-toggle-button { position: absolute; top: 20px; left: 20px; z-index: 1500; width: 50px; height: 50px; background-color: white; color: #007BFF; border: none; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); transition: all 0.2s ease-in-out; }
.sidebar-menu { position: fixed; top: 0; left: 0; width: 280px; height: 100%; background-color: white; z-index: 2000; transform: translateX(-100%); transition: transform 0.3s ease-in-out; box-shadow: 0 0 20px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
.sidebar-menu.is-open { transform: translateX(0); }
.menu-header { padding: 20px; font-size: 1.5rem; font-weight: 700; color: #007BFF; border-bottom: 1px solid #e9ecef; }
.sidebar-menu ul { list-style: none; padding: 20px 0; margin: 0; }
.sidebar-menu li a { display: flex; align-items: center; gap: 15px; padding: 15px 20px; color: #343a40; text-decoration: none; font-weight: 500; transition: all 0.2s ease-in-out; cursor: pointer; }
.menu-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.4); z-index: 1999; }
.fab-add-button { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 1000; width: 60px; height: 60px; background: linear-gradient(45deg, #007BFF, #00C6FF); color: white; border: none; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4); }
</style>

