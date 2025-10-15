import axios from 'axios';

// Cria a instância do axios com a configuração base.
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// NOVO: Interceptor de Requisições
// -----------------------------------------------------------------------------
// Esta função é executada ANTES de CADA requisição ser enviada pela sua aplicação.
apiClient.interceptors.request.use(
  (config) => {
    // 1. Tenta buscar o token de autenticação que está guardado no localStorage.
    const token = localStorage.getItem('authToken');

    // 2. Se um token existir...
    if (token) {
      // ...adiciona-o ao cabeçalho 'Authorization' da requisição.
      // O formato 'Bearer ' é o padrão para este tipo de autenticação.
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 3. Retorna a configuração da requisição, agora com o token (se existir).
    return config;
  },
  (error) => {
    // Em caso de erro na configuração da requisição, rejeita a promise.
    return Promise.reject(error);
  }
);

export default apiClient;