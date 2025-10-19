import axios from 'axios'

const api = axios.create({
  baseURL:
    (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') +
    (process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1'),
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor dla obsługi błędów - nie wylogowuj automatycznie
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Loguj błędy dla debugowania, ale nie wylogowuj użytkownika
    if (error.response?.status === 401) {
      console.warn('Błąd autoryzacji:', error.response.data?.message || 'Nieautoryzowany dostęp');
    }
    return Promise.reject(error);
  }
)

export default api
