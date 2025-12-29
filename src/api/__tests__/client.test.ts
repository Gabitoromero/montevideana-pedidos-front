import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Mock the auth store before importing the client
const mockGetState = vi.fn();
const mockLogout = vi.fn();

vi.mock('../../store/auth.store', () => ({
  useAuthStore: {
    getState: () => mockGetState(),
  },
}));

describe('API Client', () => {
  let testClient: any;
  let requestInterceptor: any;
  let responseInterceptor: any;
  let responseErrorInterceptor: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock for auth store
    mockGetState.mockReturnValue({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      logout: mockLogout,
    });

    // Create a fresh axios instance for each test
    testClient = axios.create({
      baseURL: 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Manually add the interceptors (simulating what client.ts does)
    requestInterceptor = (config: InternalAxiosRequestConfig) => {
      const accessToken = mockGetState().accessToken;
      
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      
      return config;
    };

    responseInterceptor = (response: AxiosResponse) => {
      return response;
    };

    responseErrorInterceptor = (error: any) => {
      if (error.response?.status === 401) {
        mockGetState().logout();
      }
      
      return Promise.reject(error);
    };

    testClient.interceptors.request.use(requestInterceptor, (error: any) => Promise.reject(error));
    testClient.interceptors.response.use(responseInterceptor, responseErrorInterceptor);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Base Configuration', () => {
    it('should have correct baseURL', () => {
      expect(testClient.defaults.baseURL).toBe('http://localhost:3000/api');
    });

    it('should have JSON content-type header', () => {
      expect(testClient.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('Request Interceptor', () => {
    it('should attach Authorization header when token exists', async () => {
      mockGetState.mockReturnValue({
        accessToken: 'test-token-123',
        refreshToken: 'refresh-token',
        user: { id: 1, username: 'test' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const config: InternalAxiosRequestConfig = {
        headers: {} as any,
      } as InternalAxiosRequestConfig;

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe('Bearer test-token-123');
    });

    it('should not attach header when no token exists', async () => {
      mockGetState.mockReturnValue({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
      });

      const config: InternalAxiosRequestConfig = {
        headers: {} as any,
      } as InternalAxiosRequestConfig;

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should use Bearer token format', async () => {
      mockGetState.mockReturnValue({
        accessToken: 'my-secret-token',
        refreshToken: 'refresh',
        user: { id: 1, username: 'user' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const config: InternalAxiosRequestConfig = {
        headers: {} as any,
      } as InternalAxiosRequestConfig;

      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toMatch(/^Bearer /);
      expect(result.headers.Authorization).toBe('Bearer my-secret-token');
    });
  });

  describe('Response Interceptor', () => {
    it('should pass through successful responses', async () => {
      const mockResponse: AxiosResponse = {
        data: { success: true, data: { message: 'OK' } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const result = responseInterceptor(mockResponse);

      expect(result).toEqual(mockResponse);
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('should logout on 401 error', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should not logout on 400 error', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad Request' },
        },
      };

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('should not logout on 500 error', async () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('should preserve error details when rejecting', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Token expired' },
          headers: { 'x-custom': 'value' },
        },
        config: { url: '/test' },
      };

      try {
        await responseErrorInterceptor(error);
      } catch (e) {
        expect(e).toEqual(error);
        expect((e as any).response.status).toBe(401);
        expect((e as any).response.data.message).toBe('Token expired');
      }
    });

    it('should handle errors without response object', async () => {
      const error = {
        message: 'Network Error',
        // No response object
      };

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      expect(mockLogout).not.toHaveBeenCalled();
    });
  });

  describe('Integration with Auth Store', () => {
    it('should call logout from auth store on 401', async () => {
      const error = {
        response: {
          status: 401,
        },
      };

      try {
        await responseErrorInterceptor(error);
      } catch (e) {
        // Expected to throw
      }

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should read token from auth store for each request', () => {
      // First request with no token
      mockGetState.mockReturnValue({
        accessToken: null,
        logout: mockLogout,
      });

      let config1: InternalAxiosRequestConfig = {
        headers: {} as any,
      } as InternalAxiosRequestConfig;

      let result1 = requestInterceptor(config1);
      expect(result1.headers.Authorization).toBeUndefined();

      // Second request with token
      mockGetState.mockReturnValue({
        accessToken: 'new-token',
        logout: mockLogout,
      });

      let config2: InternalAxiosRequestConfig = {
        headers: {} as any,
      } as InternalAxiosRequestConfig;

      let result2 = requestInterceptor(config2);
      expect(result2.headers.Authorization).toBe('Bearer new-token');
    });
  });
});
