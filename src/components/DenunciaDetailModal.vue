<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-button" @click="$emit('close')">&times;</button>
      
      <h2>Detalhes da Denúncia #{{ denuncia.id }}</h2>
      
      <div v-if="denuncia.foto_url" class="denuncia-photo">
        <img :src="denuncia.foto_url" alt="Foto da denúncia">
      </div>
      <div v-else class="no-photo-placeholder">
        <p>Sem foto disponível</p>
      </div>
      
      <div class="denuncia-details">
        <div class="detail-item">
          <strong>Status:</strong>
          <span :class="`status-${denuncia.status}`">{{ formatStatus(denuncia.status) }}</span>
        </div>
        <div class="detail-item">
          <strong>Descrição:</strong>
          <p>{{ denuncia.descricao }}</p>
        </div>
        <div class="detail-item">
          <strong>Localização:</strong>
          <!-- ADICIONADA A CLASSE 'location-coords' -->
          <span class="location-coords">Lat: {{ denuncia.lat.toFixed(5) }}, Lng: {{ denuncia.lng.toFixed(5) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  denuncia: {
    type: Object,
    required: true
  }
});

defineEmits(['close']);

const formatStatus = (status) => {
  const statusMap = {
    pendente: 'Pendente',
    em_analise: 'Em Análise',
    resolvido: 'Resolvido'
  };
  return statusMap[status] || 'Desconhecido';
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 25px rgba(0,0,0,0.2);
  width: 90%;
  max-width: 500px;
  position: relative;
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #aaa;
  cursor: pointer;
  line-height: 1;
}

h2 {
  margin-top: 0;
  color: #007BFF;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.denuncia-photo img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 20px;
  color: #212529;
}

.no-photo-placeholder {
  width: 100%;
  height: 200px;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #aaa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.no-photo-placeholder p{
  color:#212529
}

.detail-item {
  margin-bottom: 15px;
}

.detail-item strong {
  display: block;
  margin-bottom: 5px;
  color: #495057; 
}

.detail-item p {
  margin: 0;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  color: #212529; 
}


.location-coords {
  color: #6c757d; 
}

.status-pendente { color: #DC3545; font-weight: bold; }
.status-em_analise { color: #FFC107; font-weight: bold; }
.status-resolvido { color: #28A745; font-weight: bold; }
</style>

