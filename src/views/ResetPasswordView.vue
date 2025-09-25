<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>Crie uma Nova Senha</h2>
      <p>Digite sua nova senha abaixo.</p>
      
      <form @submit.prevent="handleResetPassword">
        <div class="form-group">
          <label for="password">Nova Senha</label>
          <input type="password" id="password" v-model="password" required placeholder="********">
        </div>

        <div class="form-group">
          <label for="password_confirmation">Confirme a Nova Senha</label>
          <input type="password" id="password_confirmation" v-model="password_confirmation" required placeholder="********">
        </div>
        
        <div v-if="message" :class="messageType === 'success' ? 'success-message' : 'error-message'">
          {{ message }}
        </div>
        
        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? 'Salvando...' : 'Salvar Nova Senha' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../services/apiClient';

const emit = defineEmits(['reset-success']);

const email = ref('');
const token = ref('');
const password = ref('');
const password_confirmation = ref('');
const isLoading = ref(false);
const message = ref(null);
const messageType = ref('');

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  token.value = params.get('token');
  email.value = params.get('email');

  if (!token.value || !email.value) {
    message.value = 'Token de redefinição inválido ou ausente. Por favor, solicite um novo link.';
    messageType.value = 'error';
  }
});

async function handleResetPassword() {
  isLoading.value = true;
  message.value = null;

  if (password.value !== password_confirmation.value) {
    message.value = 'As senhas não coincidem.';
    messageType.value = 'error';
    isLoading.value = false;
    return;
  }

  try {
    const response = await apiClient.post('/reset-password', {
      token: token.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
    });
    
    message.value = response.data.message || 'Senha redefinida com sucesso! Redirecionando para o login...';
    messageType.value = 'success';

    setTimeout(() => {
      emit('reset-success');
    }, 2000);

  } catch (error) {
    message.value = error.response?.data?.message || 'Não foi possível redefinir a senha. O token pode ter expirado.';
    messageType.value = 'error';
    console.error("Erro ao redefinir senha:", error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Estilos consistentes com as outras telas */
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f0f2f5; }
.auth-form { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
h2 { text-align: center; margin-bottom: 10px; color: #333; }
p { text-align: center; color: #666; margin-bottom: 30px; }
.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 5px; font-weight: 500; color:#333; }
input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.submit-button { width: 100%; padding: 12px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold; }
.submit-button:disabled { background-color: #a3d9a5; }
.error-message { color: #DC3545; background-color: #f8d7da; padding: 10px; border-radius: 4px; margin-bottom: 15px; text-align: center; }
.success-message { color: #155724; background-color: #d4edda; padding: 10px; border-radius: 4px; margin-bottom: 15px; text-align: center; }
</style>