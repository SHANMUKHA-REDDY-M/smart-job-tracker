import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const apiBaseUrl = configuredApiUrl?.includes('smart-job-tracker-kth8.onrender.com')
  ? 'https://smart-job-tracker-api-d4ph.onrender.com/api'
  : configuredApiUrl || 'http://localhost:5001/api';

const customFetch = axios.create({
  baseURL: apiBaseUrl
});

customFetch.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

customFetch.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/register';
    }

    return Promise.reject(error);
  }
);

export default customFetch;
