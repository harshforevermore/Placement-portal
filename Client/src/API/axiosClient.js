import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // CRITICAL: Send cookies with requests
});

// Simple error handling - NO automatic redirects
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Authentication failed:', error.response.data.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;