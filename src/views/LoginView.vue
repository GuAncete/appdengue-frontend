<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>Entrar no App Dengue</h2>
      <p>Use suas credenciais para acessar o mapa.</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required placeholder="seuemail@exemplo.com">
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <input type="password" id="password" v-model="password" required placeholder="********">
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div class="switch-form">
        <p><a href="#" @click.prevent="$emit('show-page', 'forgot-password')">Esqueci a senha</a></p>
        
        <p>Não tem uma conta? <a href="#" @click.prevent="$emit('show-page', 'register')">Cadastre-se</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import apiClient from '../services/apiClient';

// CORREÇÃO ESSENCIAL: Adicionamos 'show-page' para padronizar a navegação
const emit = defineEmits(['login-success', 'show-page']);

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref(null);

async function handleLogin() {
  isLoading.value = true;
  errorMessage.value = null;

  try {
    const response = await apiClient.post('/login', {
      email: email.value,
      password: password.value,
    });

    // Se o login for bem-sucedido, avisa o App.vue
    if (response.data.status) {
      emit('login-success', {
        user: response.data.user,
        token: response.data.token,
      });
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      errorMessage.value = 'Email ou senha inválidos. Tente novamente.';
    } else {
      errorMessage.value = 'Ocorreu um erro de conexão. Tente mais tarde.';
    }
    console.error("Erro no login:", error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.switch-form p { margin-top: 10px; }
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f0f2f5; }
.auth-form { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
h2 { text-align: center; margin-bottom: 10px; color: #333; }
p { text-align: center; color: #666; margin-bottom: 30px; }
.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 5px; font-weight: 500; color:#333}
input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.submit-button { width: 100%; padding: 12px; background-color: #007BFF; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold; }
.submit-button:disabled { background-color: #a0cfff; }
.error-message { color: #DC3545; background-color: #f8d7da; padding: 10px; border-radius: 4px; margin-bottom: 15px; text-align: center; }
.switch-form { text-align: center; margin-top: 20px; }
.switch-form a { color: #007BFF; text-decoration: none; font-weight: bold; }
</style>