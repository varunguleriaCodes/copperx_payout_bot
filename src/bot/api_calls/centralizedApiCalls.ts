// api/apiService.ts
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

import {CONFIG} from '../../config'

export interface IApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

const API_CONFIG = {
  baseUrl: CONFIG.api_base_url,
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
};

export class ApiService {
  private client: AxiosInstance;
  
  constructor(config = API_CONFIG) {
    // Make sure baseURL is a string, not an object
    const baseURL = typeof config.baseUrl === 'object' && 'output' in config.baseUrl 
      ? config.baseUrl.output 
      : config.baseUrl;
    
    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL, // Now this is guaranteed to be a string
      headers: config.defaultHeaders,
      timeout: config.timeout,
    });
    
    // Add response interceptor for consistent error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle errors consistently
        if (error.response) {
          // Server responded with an error status
          return Promise.reject({
            status: error.response.status,
            message: error.response.data?.message || 'Server error',
            data: error.response.data
          });
        } else if (error.request) {
          // Request was made but no response received
          return Promise.reject({
            status: 0,
            message: 'No response from server',
          });
        } else {
          // Something else happened
          return Promise.reject({
            status: 0,
            message: error.message || 'Unknown error',
          });
        }
      }
    );
  }

  // Rest of your API service implementation...
  // Set auth token for authenticated requests
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Clear auth token
  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Transform Axios response to our IApiResponse format
  private formatResponse<T>(response: AxiosResponse<T>): IApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      message: response.statusText,
    };
  }

  // HTTP method implementations
  async get<T>(endpoint: string): Promise<IApiResponse<T>> {
    const response = await this.client.get<T>(endpoint);
    return this.formatResponse<T>(response);
  }

  async post<T>(endpoint: string, data: Record<string, unknown>): Promise<IApiResponse<T>> {
    console.log('POST Request:', { endpoint, data });
    const response = await this.client.post<T>(endpoint, JSON.stringify(data));
    return this.formatResponse<T>(response);
  }

  async put<T>(endpoint: string, data: Record<string, unknown>): Promise<IApiResponse<T>> {
    const response = await this.client.put<T>(endpoint, data);
    return this.formatResponse<T>(response);
  }

  async patch<T>(endpoint: string, data: Record<string, unknown>): Promise<IApiResponse<T>> {
    const response = await this.client.patch<T>(endpoint, data);
    return this.formatResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<IApiResponse<T>> {
    const response = await this.client.delete<T>(endpoint);
    return this.formatResponse<T>(response);
  }
}

// Create and export a default instance
export const apiService = new ApiService();

export const { get, post, put, patch, delete: del } = apiService;