import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default fallback host depending on platform
const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: DEFAULT_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Interceptor to inject JWT token into authorization header
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const customUrl = await AsyncStorage.getItem('custom_api_url');
  if (customUrl) {
    config.baseURL = customUrl;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const setCustomApiUrl = async (url: string) => {
  if (!url) return;
  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `http://${formattedUrl}`;
  }
  if (!formattedUrl.endsWith('/api')) {
    formattedUrl = formattedUrl.replace(/\/+$/, '') + '/api';
  }
  await AsyncStorage.setItem('custom_api_url', formattedUrl);
  apiClient.defaults.baseURL = formattedUrl;
};

export const getCustomApiUrl = async (): Promise<string> => {
  const saved = await AsyncStorage.getItem('custom_api_url');
  return saved || DEFAULT_URL;
};

export default apiClient;
