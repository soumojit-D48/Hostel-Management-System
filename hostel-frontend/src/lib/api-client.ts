import { buildApiUrl } from '@/config/api.config';
import { ApiResponse, ApiError } from '@/types/api-response';

const TOKEN_KEY = 'auth_token';

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  }

  private static clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  }

  private static getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - clear token and redirect to login
        this.clearToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      let errorMessage = `HTTP Error ${response.status}`;
      let errorDetails = null;

      if (isJson) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error?.message || errorMessage;
        errorDetails = errorData.error?.details || errorData.details;
      }

      const error: ApiError = {
        message: errorMessage,
        status: response.status,
        details: errorDetails,
      };

      throw error;
    }

    if (isJson) {
      return response.json();
    }

    return response.text() as any;
  }

  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(buildApiUrl(endpoint));
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  static async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  static async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  static async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  static async uploadFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData, browser will set it with boundary

    const response = await fetch(buildApiUrl(endpoint), {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }

  // Helper to save auth token
  static saveToken(token: string): void {
    this.setToken(token);
  }

  // Helper to logout
  static logout(): void {
    this.clearToken();
  }
}

// Convenience exports
export const apiGet = ApiClient.get.bind(ApiClient);
export const apiPost = ApiClient.post.bind(ApiClient);
export const apiPatch = ApiClient.patch.bind(ApiClient);
export const apiDelete = ApiClient.delete.bind(ApiClient);
export const apiUpload = ApiClient.uploadFormData.bind(ApiClient);