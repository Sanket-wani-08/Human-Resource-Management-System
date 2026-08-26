import axios from 'axios';


const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://human-resource-management-system-1-uwxr.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }

    return Promise.reject(error);
  }
);

export default apiClient;