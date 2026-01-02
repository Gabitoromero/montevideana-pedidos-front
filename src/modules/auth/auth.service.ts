import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/auth.store';
import type { User } from '../../shared/types/user.types';

// Backend wraps responses in { success, data }
interface BackendResponse<T> {
  success: boolean;
  data: T;
}

interface LoginData {
  user: User;
}

interface LogoutResponse {
  message: string;
}

class AuthService {
  /**
   * Login with username and password
   * Tokens are set as HTTP-only cookies by the backend
   * @param username - User's username
   * @param password - User's password
   * @returns Promise that resolves when login is successful
   */
  async login(username: string, password: string): Promise<void> {
    try {
      // Call the backend login endpoint
      // Backend sets accessToken and refreshToken as HTTP-only cookies
      const response = await apiClient.post<BackendResponse<LoginData>>('/auth/login', {
        username,
        password,
      });
      
      // Extract user from response (no tokens in JSON anymore)
      const { user } = response.data.data;

      // Validate user exists
      if (!user) {
        throw new Error('Usuario no recibido del backend');
      }

      // Store only user in Zustand store (tokens are in cookies)
      useAuthStore.getState().setLogin(user);
    } catch (error) {
      // Re-throw the error to be handled by the caller
      throw error;
    }
  }

  /**
   * Logout the current user
   * Calls backend to clear HTTP-only cookies
   */
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint to clear cookies
      await apiClient.post<BackendResponse<LogoutResponse>>('/auth/logout');
    } catch (error) {
      // Even if backend call fails, clear local state
      console.error('Error during logout:', error);
    } finally {
      // Always clear local auth state
      useAuthStore.getState().logout();
    }
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): User | null {
    return useAuthStore.getState().user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return useAuthStore.getState().isAuthenticated;
  }

  /**
   * Refresh user data from backend
   * Validates the cookie and updates user info from server
   * @returns Promise that resolves with user data or null if invalid
   */
  async refreshUser(): Promise<User | null> {
    try {
      // Call backend to validate cookie and get fresh user data
      // No need to check for token - cookies are sent automatically
      const response = await apiClient.get<BackendResponse<User>>('/auth/me');
      const user = response.data.data;

      // Update user in store
      useAuthStore.getState().setUser(user);
      return user;
    } catch (error) {
      // Cookie is invalid or expired, logout
      await this.logout();
      return null;
    }
  }

  /**
   * Refresh the access token using the refresh token cookie
   * @returns Promise that resolves with user data or null if invalid
   */
  async refreshAccessToken(): Promise<User | null> {
    try {
      // Call backend to get new access token
      // Refresh token is sent automatically as HTTP-only cookie
      const response = await apiClient.post<BackendResponse<LoginData>>('/auth/refresh');

      const { user } = response.data.data;

      // Update user in store (new access token is set as cookie by backend)
      useAuthStore.getState().setUser(user);

      return user;
    } catch (error) {
      // Refresh token is invalid or expired, logout
      await this.logout();
      return null;
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();
