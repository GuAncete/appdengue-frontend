<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-content">
      <h2>Adicionar Novo Foco</h2>
      <p>Preencha os detalhes da ocorrência.</p>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="descricao">Descrição</label>
          <textarea id="descricao" v-model="descricao" rows="4" placeholder="Ex: Pneu com água parada, vaso de planta, etc." required></textarea>
        </div>
        
        <div class="form-group">
          <label for="foto">Foto do Local (Opcional)</label>
          <input type="file" id="foto" @change="handleFileUpload">
        </div>
        
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="$emit('cancel')">Cancelar</button>
          <button type="submit" class="btn-save">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['save', 'cancel']);

const descricao = ref('');
const foto = ref(null);

function handleFileUpload(event) {
  foto.value = event.target.files[0];
}

function handleSubmit() {
  if (descricao.value.trim()) {
    emit('save', {
      descricao: descricao.value,
      foto: foto.value
    });
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

h2 {
  margin-top: 0;
  margin-bottom: 10px;
}
p {
  margin-top: 0;
  margin-bottom: 25px;
  color: #666;
}

.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}
.form-group textarea, .form-group input {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.modal-actions button {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background-color: #f0f0f0;
  color: #333;
}
.btn-cancel:hover {
  background-color: #e0e0e0;
}

.btn-save {
  background-color: #007bff;
  color: white;
}
.btn-save:hover {
  background-color: #0056b3;
}
</style>

