<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>Crie sua Conta</h2>
      <p>Preencha os dados para se registrar.</p>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Nome Completo</label>
          <input type="text" id="name" v-model="name" required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="phone">Telefone</label>
          <input type="tel" id="phone" v-model="phone" required>
        </div>
        <div class="form-group">
          <label for="password">Senha (mínimo 8 caracteres)</label>
          <input type="password" id="password" v-model="password" required>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        
        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? 'Cadastrando...' : 'Cadastrar' }}
        </button>
      </form>
      
      <div class="switch-form">
        <p>Já tem uma conta? <a href="#" @click.prevent="$emit('go-to-login')">Faça login</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import apiClient from '../services/apiClient';

const emit = defineEmits(['go-to-login']);

const name = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

async function handleRegister() {
  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  if (password.value.length < 8) {
    errorMessage.value = 'A senha deve ter no mínimo 8 caracteres.';
    isLoading.value = false;
    return;
  }

  try {
    await apiClient.post('/users', {
      name: name.value,
      email: email.value,
      phone: phone.value,
      password: password.value
    });
    
    successMessage.value = 'Cadastro realizado com sucesso! Você será redirecionado para o login.';
    
    setTimeout(() => {
      emit('go-to-login');
    }, 2000); // Espera 2 segundos antes de redirecionar

  } catch (error) {
    if (error.response && error.response.data.errors) {
        const errors = error.response.data.errors;
        if (errors.email && errors.email[0].includes('já está em uso')) {
            errorMessage.value = 'Este email já está cadastrado.';
        } else {
            errorMessage.value = 'Erro de validação. Verifique seus dados.';
        }
    } else {
      errorMessage.value = 'Ocorreu um erro ao realizar o cadastro.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f0f2f5; }
.auth-form { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
h2 { text-align: center; margin-bottom: 10px; color: #333;}
p { text-align: center; color: #666; margin-bottom: 30px; }
.form-group { margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; font-weight: 500; color:#333}
input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.submit-button { width: 100%; padding: 12px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold; }
.submit-button:disabled { background-color: #a3d9a5; }
.error-message { color: #DC3545; background-color: #f8d7da; padding: 10px; border-radius: 4px; margin-bottom: 15px; text-align: center; }
.success-message { color: #155724; background-color: #d4edda; padding: 10px; border-radius: 4px; margin-bottom: 15px; text-align: center; }
.switch-form { text-align: center; margin-top: 20px; }
.switch-form a { color: #007BFF; text-decoration: none; font-weight: bold; }
</style>