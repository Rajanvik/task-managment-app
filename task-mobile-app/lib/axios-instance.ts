import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

/**
 * Storage keys for authentication state.
 */
export const AUTH_KEYS = {
  ACCESS_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
};

/**
 * API base URL — single endpoint for all platforms.
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically inject the Auth JWT token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Axios Interceptor: Could not fetch auth token', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if the request is to an authentication endpoint
    const isAuthRoute = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register');

    // Handle 401 Unauthorized errors (e.g. token expired)
    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      if (originalRequest) {
        originalRequest._retry = true;
      }
      try {
        const refreshToken = await AsyncStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);

        // Attempt to call the backend refresh token endpoint
        const response = await axios.post(`${axiosInstance.defaults.baseURL}/auth/refresh-token`, {
          refreshToken,
        });

        const { token, newRefreshToken } = response.data;

        if (token) {
          await AsyncStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, token);
          if (newRefreshToken) {
            await AsyncStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, newRefreshToken);
          }

          // Re-attach new token to headers and retry the original request
          if (originalRequest && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear all stored tokens and redirect to login
        await AsyncStorage.multiRemove([
          AUTH_KEYS.ACCESS_TOKEN,
          AUTH_KEYS.REFRESH_TOKEN,
          AUTH_KEYS.USER_DATA
        ]);

        router.replace('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
