import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

class ApiClient {
  private static instance: AxiosInstance;
  private static token: string | null = null;

  static getInstance(): AxiosInstance {
    if (!this.instance) {
      this.instance = this.createInstance();
    }
    return this.instance;
  }

  private static createInstance(): AxiosInstance {
    const baseURL = typeof window !== 'undefined'
      ? (window.location.hostname.includes('vercel.app')
          ? '/api'
          : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
              ? 'http://localhost:8000/api'
              : '/api'))
      : (process.env.NEXT_PUBLIC_API_URL || '/api');

    const client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    return client;
  }

  static setToken(token: string | null) {
    this.token = token;
    if (this.instance) {
      if (token) {
        this.instance.defaults.headers.common.Authorization = `Bearer ${token}`;
      } else {
        delete this.instance.defaults.headers.common.Authorization;
      }
    }
  }

  static getAPI(): AxiosInstance {
    return this.getInstance();
  }

  static initializeAPI(token: string | null): AxiosInstance {
    this.setToken(token);
    return this.getInstance();
  }
}

export const api = ApiClient.getInstance();
export const getAPI = () => ApiClient.getAPI();
export const initializeAPI = (token: string | null) => ApiClient.initializeAPI(token);
export const setAuthToken = (token: string | null) => ApiClient.setToken(token);
export default api;
