import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../auth.service';
import type { User } from '../../../shared/types/user.types';

// Mock the API client
vi.mock('../../../api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock the auth store
const mockSetLogin = vi.fn();
const mockSetUser = vi.fn();
const mockLogout = vi.fn();
const mockGetState = vi.fn();

vi.mock('../../../store/auth.store', () => ({
  useAuthStore: {
    getState: () => mockGetState(),
  },
}));

// Import mocked modules after mocking
import { apiClient } from '../../../api/client';

describe('Auth Service', () => {
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    nombre: 'Test',
    apellido: 'User',
    sector: 'admin',
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Setup default mock implementation for getState
    mockGetState.mockReturnValue({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setLogin: mockSetLogin,
      setUser: mockSetUser,
      logout: mockLogout,
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            user: mockUser,
          },
        },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      await authService.login('testuser', 'password123');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'password123',
      });
      expect(mockSetLogin).toHaveBeenCalledWith(
        'mock-access-token',
        'mock-refresh-token',
        mockUser
      );
    });

    it('should store tokens and user in auth store', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'token-123',
            refreshToken: 'refresh-456',
            user: mockUser,
          },
        },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      await authService.login('testuser', 'password');

      expect(mockSetLogin).toHaveBeenCalledTimes(1);
      expect(mockSetLogin).toHaveBeenCalledWith('token-123', 'refresh-456', mockUser);
    });

    it('should handle backend response wrapping correctly', async () => {
      const wrappedResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'wrapped-token',
            refreshToken: 'wrapped-refresh',
            user: mockUser,
          },
        },
      };

      (apiClient.post as any).mockResolvedValue(wrappedResponse);

      await authService.login('user', 'pass');

      expect(mockSetLogin).toHaveBeenCalledWith(
        'wrapped-token',
        'wrapped-refresh',
        mockUser
      );
    });

    it('should throw error when user is missing from response', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'token',
            refreshToken: 'refresh',
            user: null, // Missing user
          },
        },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      await expect(authService.login('user', 'pass')).rejects.toThrow(
        'Usuario no recibido del backend'
      );
      expect(mockSetLogin).not.toHaveBeenCalled();
    });

    it('should re-throw API errors', async () => {
      const apiError = new Error('Invalid credentials');
      (apiClient.post as any).mockRejectedValue(apiError);

      await expect(authService.login('user', 'wrong')).rejects.toThrow(
        'Invalid credentials'
      );
      expect(mockSetLogin).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear auth store', () => {
      authService.logout();

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should work when already logged out', () => {
      mockGetState.mockReturnValue({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        setLogin: mockSetLogin,
        setUser: mockSetUser,
        logout: mockLogout,
      });

      authService.logout();

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', () => {
      mockGetState.mockReturnValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        user: mockUser,
        isAuthenticated: true,
        setLogin: mockSetLogin,
        setUser: mockSetUser,
        logout: mockLogout,
      });

      const user = authService.getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    it('should return null when not authenticated', () => {
      mockGetState.mockReturnValue({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        setLogin: mockSetLogin,
        setUser: mockSetUser,
        logout: mockLogout,
      });

      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when authenticated', () => {
      mockGetState.mockReturnValue({
        accessToken: 'token',
        refreshToken: 'refresh',
        user: mockUser,
        isAuthenticated: true,
        setLogin: mockSetLogin,
        setUser: mockSetUser,
        logout: mockLogout,
      });

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when not authenticated', () => {
      mockGetState.mockReturnValue({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        setLogin: mockSetLogin,
        setUser: mockSetUser,
        logout: mockLogout,
      });

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('refreshUser', () => {
    it('should fetch and update user data successfully', async () => {
      mockGetState.mockReturnValue({
        accessToken: 'valid-token',
        refreshToken: 'refresh',
        user: mockUser,
        isAuthenticated: true,
        setLogin: mockSetLogin,
        setUser: mockSetUser,
        logout: mockLogout,
      });

      const updatedUser: User = {
        ...mockUser,
        nombre: 'Updated',
        apellido: 'Name',
      };

      const mockResponse = {
        data: {
          success: true,
          data: updatedUser,
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await authService.refreshUser();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(mockSetUser).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should return null if no access token exists', async () => {
      mockGetState.mockReturnValue({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        setLogin: mockSetLogin,
        setUser: mockSetUser,
        logout: mockLogout,
      });

      const result = await authService.refreshUser();

      expect(apiClient.get).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should logout and return null on API error', async () => {
      mockGetState.mockReturnValue({
        accessToken: 'invalid-token',
        refreshToken: 'refresh',
        user: mockUser,
        isAuthenticated: true,
        setLogin: mockSetLogin,
        setUser: mockSetUser,
        logout: mockLogout,
      });

      (apiClient.get as any).mockRejectedValue(new Error('Unauthorized'));

      const result = await authService.refreshUser();

      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      mockGetState.mockReturnValue({
        accessToken: 'old-token',
        refreshToken: 'valid-refresh-token',
        user: mockUser,
        isAuthenticated: true,
        setLogin: mockSetLogin,
        setUser: mockSetUser,
        logout: mockLogout,
      });

      const mockResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'new-access-token',
            user: mockUser,
          },
        },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await authService.refreshAccessToken();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'valid-refresh-token',
      });
      expect(mockSetLogin).toHaveBeenCalledWith(
        'new-access-token',
        'valid-refresh-token',
        mockUser
      );
      expect(result).toBe('new-access-token');
    });

    it('should return null if no refresh token exists', async () => {
      mockGetState.mockReturnValue({
        accessToken: 'token',
        refreshToken: null,
        user: mockUser,
        isAuthenticated: true,
        setLogin: mockSetLogin,
        setUser: mockSetUser,
        logout: mockLogout,
      });

      const result = await authService.refreshAccessToken();

      expect(apiClient.post).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should logout and return null on API error', async () => {
      mockGetState.mockReturnValue({
        accessToken: 'token',
        refreshToken: 'invalid-refresh',
        user: mockUser,
        isAuthenticated: true,
        setLogin: mockSetLogin,
        setUser: mockSetUser,
        logout: mockLogout,
      });

      (apiClient.post as any).mockRejectedValue(new Error('Invalid refresh token'));

      const result = await authService.refreshAccessToken();

      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });
});
