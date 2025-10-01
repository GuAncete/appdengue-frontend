<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <button class="close-button" @click="$emit('cancel')">&times;</button>
      <h2>Adicionar Nova Denúncia</h2>
      <p class="location-info">Localização capturada: Lat {{ location.lat.toFixed(5) }}, Lng {{ location.lng.toFixed(5) }}</p>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="foto">Tire uma Foto do Foco (Obrigatória)</label>
          
          <!-- ATUALIZAÇÃO: O atributo 'accept' foi removido para reforçar o pedido de câmera -->
          <input 
            type="file" 
            id="foto" 
            @change="handleFileChange" 
            required 
            capture="environment" 
            ref="fileInput" 
            style="display: none;"
          >
          
          <button type="button" @click="triggerFileInput" class="file-upload-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <span>{{ fotoFile ? 'Foto Capturada' : 'Abrir Câmera' }}</span>
          </button>
          
          <div v-if="fotoPreviewUrl" class="image-preview">
            <img :src="fotoPreviewUrl" alt="Pré-visualização da foto">
          </div>
        </div>

        <div class="form-group">
          <label for="descricao">Observação</label>
          <textarea id="descricao" v-model="descricao" rows="4" placeholder="Ex: Pneu com água parada no quintal..."></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-button" @click="$emit('cancel')">Cancelar</button>
          <button type="submit" class="save-button" :disabled="!fotoFile">
            Salvar Denúncia
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  location: { type: Object, required: true }
});

const emit = defineEmits(['save', 'cancel']);

const descricao = ref('');
const fotoFile = ref(null);
const fotoPreviewUrl = ref(null);
const fileInput = ref(null);

function triggerFileInput() {
  fileInput.value.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    fotoFile.value = file;
    fotoPreviewUrl.value = URL.createObjectURL(file);
  } else {
    fotoFile.value = null;
    fotoPreviewUrl.value = null;
  }
}

function handleSubmit() {
  if (!fotoFile.value) {
    alert('Por favor, tire uma foto para a denúncia.');
    return;
  }
  emit('save', { 
    descricao: descricao.value, 
    foto: fotoFile.value,
    location: props.location
  });
}
</script>

<style scoped>
/* O seu CSS existente pode ser mantido. */
.modal-overlay { z-index: 3000; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
.modal-content { background-color: white; padding: 30px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 90%; max-width: 450px; position: relative; animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slide-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.location-info {
  background-color: #e7f5ff;
  color: #0056b3;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
}
.close-button { position: absolute; top: 15px; right: 15px; background: #f1f3f5; border: none; font-size: 1.5rem; color: #868e96; cursor: pointer; line-height: 1; width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center; transition: all 0.2s; }
.close-button:hover { background-color: #e9ecef; color: #495057; }
h2 { margin-top: 0; color: #212529; border-bottom: 1px solid #e9ecef; padding-bottom: 15px; margin-bottom: 25px; font-weight: 700; }
.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 8px; font-weight: 500; color: #495057; }
textarea { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ced4da; font-family: 'Inter', sans-serif; font-size: 1rem; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; resize: vertical; }
textarea:focus { outline: none; border-color: #80bdff; box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25); }
.file-upload-button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #007BFF; background-color: #e7f5ff; color: #007BFF; font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 500; cursor: pointer; transition: background-color 0.2s; box-sizing: border-box; }
.file-upload-button:hover { background-color: #d0ebff; }
.file-upload-button span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.image-preview { margin-top: 15px; text-align: center; }
.image-preview img { max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #dee2e6; object-fit: cover; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; }
.cancel-button, .save-button { padding: 12px 24px; border: none; border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
.cancel-button { background-color: #f1f3f5; color: #555; }
.cancel-button:hover { background-color: #e9ecef; }
.save-button { background-color: #007BFF; color: white; }
.save-button:hover { background-color: #0056b3; }
.save-button:disabled { background-color: #a0cfff; cursor: not-allowed; }
</style>