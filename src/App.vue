<template>
  <div id="app-container">
    <!-- Overlay que escurece o fundo quando o menu está aberto -->
    <div v-if="isMenuOpen" class="menu-overlay" @click="toggleMenu"></div>

    <!-- Menu Lateral -->
    <nav class="sidebar-menu" :class="{ 'is-open': isMenuOpen }">
      <div class="menu-header">
        <h3>App Dengue</h3>
      </div>
      <ul>
        <li>
          <a href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>Home</span>
          </a>
        </li>
        <li>
          <a href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"></line><line x1="8" x2="21" y1="12" y2="12"></line><line x1="8" x2="21" y1="18" y2="18"></line><line x1="3" x2="3.01" y1="6" y2="6"></line><line x1="3" x2="3.01" y1="12" y2="12"></line><line x1="3" x2="3.01" y1="18" y2="18"></line></svg>
            <span>Minhas Ocorrências</span>
          </a>
        </li>
        <li>
          <a href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Perfil</span>
          </a>
        </li>
      </ul>
    </nav>
    
    <!-- Botão para abrir o menu -->
    <button @click="toggleMenu" class="menu-toggle-button" title="Abrir Menu">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
    </button>

    <main class="main-content">
      <MapComponent 
        :ocorrencias="listaDeOcorrencias"
        :isAddingMode="isAddingMode"
        :is-menu-open="isMenuOpen"
        @map-click="handleMapClick"
      />

      <button @click="startAddMode" class="fab-add-button" v-if="!isAddingMode" title="Adicionar Novo Foco">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      
      <div class="info-panel" v-if="isAddingMode && !newOccurrenceLocation">
        <p>Clique no local exato do foco no mapa.</p>
        <button @click="cancelAddMode" class="cancel-button-small">Cancelar</button>
      </div>

      <AddOccurrenceModal 
        v-if="newOccurrenceLocation"
        @save="saveOccurrence"
        @cancel="cancelAddMode"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MapComponent from './components/MapComponent.vue';
import AddOccurrenceModal from './components/AddOccurrenceModal.vue';
import apiClient from './services/apiClient.js';

// --- ESTADO DA APLICAÇÃO ---
const isMenuOpen = ref(false);
const listaDeOcorrencias = ref([]); // A lista agora começa vazia
const isAddingMode = ref(false);
const newOccurrenceLocation = ref(null);


async function fetchOcorrencias() {
  try {
    console.log("Iniciando busca de ocorrências no back-end...");

    const response = await apiClient.get('/denuncias');

    const ocorrenciasMapeadas = response.data.denuncias.map(item => { 
      return {
        id: item.IdDenuncia,
        lat: parseFloat(item.Latitude),
        lng: parseFloat(item.Longitude),
        status: item.Status === 1 ? 'pendente' : (item.Status === 3 ? 'resolvido' : 'em_analise'),
        descricao: item.Descricao
      };
    });

    listaDeOcorrencias.value = ocorrenciasMapeadas;
    console.log("Ocorrências carregadas e mapeadas com sucesso!", listaDeOcorrencias.value);

  } catch (error) {
    console.error("Erro ao buscar ocorrências:", error); // O erro detalhado também aparecerá aqui
    alert("Não foi possível carregar os dados do mapa. Verifique o console para mais detalhes.");
  }
}


// --- LÓGICA DE DADOS ---
onMounted(() => {
  fetchOcorrencias(); // Busca os dados iniciais ao carregar o app
});

// --- MÉTODOS DE INTERAÇÃO ---
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function startAddMode() {
  isAddingMode.value = true;
}

function handleMapClick(coords) {
  if (isAddingMode.value) {
    newOccurrenceLocation.value = coords;
    
    listaDeOcorrencias.value.push({
      id: 'temp',
      ...coords,
      status: 'temp',
      descricao: 'Novo foco sendo adicionado...'
    });
  }
}

// VERSÃO NOVA / REAL
async function saveOccurrence(formData) {
  // Verificação de segurança: garante que um local foi clicado no mapa
  if (!newOccurrenceLocation.value) {
    alert("Erro: A localização no mapa não foi definida.");
    return;
  }

  // 1. Prepara o "pacote" de dados para envio (payload)
  // Usamos os nomes exatos que a API do Laravel espera
  const payload = {
    IdUsuario: 1, // Provisório: o ideal é vir do usuário logado
    TipoFoco: 1,  // Provisório: 1 para "Água parada"
    Descricao: formData.descricao,
    Latitude: newOccurrenceLocation.value.lat,
    Longitude: newOccurrenceLocation.value.lng,
    Status: 1, // 1 para "Pendente"
  };

  try {
    console.log("Enviando nova denúncia para o back-end:", payload);

    // 2. Faz a chamada POST para a rota '/denuncias' com os dados
    await apiClient.post('/denuncias', payload);

    alert("Denúncia registrada com sucesso!");
    // 3. Limpa o formulário e o marcador temporário
    cancelAddMode();

    // 4. ATUALIZA O MAPA! Busca a lista de denúncias novamente
    // para incluir a que acabamos de criar.
    await fetchOcorrencias();

  } catch (error) {
    // Exibe detalhes do erro de validação, se houver
    console.error("Erro ao salvar denúncia:", error.response?.data || error);
    alert("Houve um erro ao registrar a denúncia.");
  }
}

function cancelAddMode() {
  isAddingMode.value = false;
  newOccurrenceLocation.value = null;
  listaDeOcorrencias.value = listaDeOcorrencias.value.filter(o => o.id !== 'temp');
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

/* Estilos globais */
body, html {
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
  overflow: hidden; /* Garante que nada vaze para fora do ecrã */
}

/* Conteúdo principal (mapa e botões) */
.main-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* --- ESTILOS DO MENU LATERAL --- */

.menu-toggle-button {
  position: absolute;
  top: 20px;
  left: 20px;
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
  transition: all 0.2s ease-in-out;
}
.menu-toggle-button:hover {
  transform: scale(1.1);
  background-color: #f8f9fa;
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
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
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
}

.sidebar-menu li a:hover {
  background-color: #f8f9fa;
  color: #007BFF;
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


/* --- ESTILOS DOS BOTÕES FLUTUANTES --- */

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

@keyframes fabFadeIn {
  from { opacity: 0; transform: translateX(-50%) scale(0.8); }
  to { opacity: 1; transform: translateX(-50%) scale(1); }
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
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: fabFadeIn 0.3s ease-out;
}

.fab-add-button:hover {
  transform: translateX(-50%) scale(1.1);
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.5);
}

.fab-add-button svg {
  width: 28px;
  height: 28px;
}

.info-panel {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 12px 20px;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease-out forwards;
  transform-origin: center center;
}

.info-panel p {
  margin: 0;
  font-weight: 500;
  color: #333;
}

.cancel-button-small {
  padding: 8px 16px;
  background: #f1f3f5;
  color: #555;
  border: none;
  border-radius: 30px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button-small:hover {
  background: #e9ecef;
}
</style>

