<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>Recuperar Senha</h2>
      <p>Digite seu e-mail e enviaremos um link para você criar uma nova senha.</p>
      
      <form @submit.prevent="handleForgotPassword">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required placeholder="seuemail@exemplo.com">
        </div>
        
        <div v-if="message" :class="messageType === 'success' ? 'success-message' : 'error-message'">
          {{ message }}
        </div>
        
        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? 'Enviando...' : 'Enviar Link de Recuperação' }}
        </button>
      </form>
      
      <div class="switch-form">
        <p><a href="#" @click.prevent="$emit('go-to-login')">Voltar para o Login</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import apiClient from '../services/apiClient';

const emit = defineEmits(['go-to-login']);

const email = ref('');
const isLoading = ref(false);
const message = ref(null);
const messageType = ref(''); // 'success' or 'error'

async function handleForgotPassword() {
  isLoading.value = true;
  message.value = null;

  try {
    const response = await apiClient.post('/forgot-password', {
      email: email.value,
    });
    
    message.value = response.data.message || 'Link de recuperação enviado com sucesso!';
    messageType.value = 'success';
  } catch (error) {
    message.value = error.response?.data?.message || 'Não foi possível enviar o link. Verifique o e-mail digitado.';
    messageType.value = 'error';
    console.error("Erro ao solicitar recuperação de senha:", error);
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
.submit-button { width: 100%; padding: 12px; background-color: #007BFF; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold; }
.submit-button:disabled { background-color: #a0cfff; }
.error-message { color: #DC3545; background-color: #f8d7da; padding: 10px; border-radius: 4px; margin-bottom: 15px; text-align: center; }
.success-message { color: #155724; background-color: #d4edda; padding: 10px; border-radius: 4px; margin-bottom: 15px; text-align: center; }
.switch-form { text-align: center; margin-top: 20px; }
.switch-form a { color: #007BFF; text-decoration: none; font-weight: bold; }
</style>