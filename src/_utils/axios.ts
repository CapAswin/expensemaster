import axios from 'axios';
import { persistor } from '../redux/store';

// Define the logout function
const logout = () => {
  // Clear token and perform any additional cleanup
  localStorage.removeItem('token');
  persistor.purge(); // Clear Redux persisted state
  // Redirect to the login page or any other appropriate action
  window.location.href = '/login'; // Adjust the redirect path as needed
};

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config.url;
      if (requestUrl !== '/api/register/' && requestUrl !== '/api/login/') {
        // Handle 401 Unauthorized errors
        logout();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
