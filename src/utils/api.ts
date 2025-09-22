import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: 30000,
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = useAuthStore.getState().refreshToken;
          if (refreshToken) {
            try {
              const response = await axios.post(`${this.instance.defaults.baseURL}/auth/refresh`, {
                refreshToken,
              });

              const { token } = response.data;
              useAuthStore.getState().setToken(token);

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            } catch (refreshError) {
              useAuthStore.getState().logout();
              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          } else {
            useAuthStore.getState().logout();
            window.location.href = '/login';
          }
        }

        // Show error toast for non-401 errors
        if (error.response?.status !== 401) {
          const message = error.response?.data?.error || 'An error occurred';
          toast.error(message);
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data = {}, config = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data = {}, config = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(url, config);
    return response.data;
  }

  async upload<T>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  }
}

export const api = new ApiClient();