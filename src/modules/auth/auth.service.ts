import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/auth.store';
import type { User } from '../../shared/types/user.types';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RefreshResponse {
  accessToken: string;
  user: User;
}

class AuthService {
  /**
   * Login with username and password
   * @param username - User's username
   * @param password - User's password
   * @returns Promise that resolves when login is successful
   */
  async login(username: string, password: string): Promise<void> {
    try {
      // Call the backend login endpoint
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        username,
        password,
      });

      const { accessToken, refreshToken, user } = response.data;

      // Store both tokens and user in Zustand store
      useAuthStore.getState().setLogin(accessToken, refreshToken, user);
    } catch (error) {
      // Re-throw the error to be handled by the caller
      throw error;
    }
  }

  /**
   * Logout the current user
   */
  logout(): void {
    useAuthStore.getState().logout();
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
   * Validates the token and updates user info from server
   * @returns Promise that resolves with user data or null if invalid
   */
  async refreshUser(): Promise<User | null> {
    try {
      const accessToken = useAuthStore.getState().accessToken;
      if (!accessToken) {
        return null;
      }

      // Call backend to validate token and get fresh user data
      const response = await apiClient.get<User>('/auth/me');
      const user = response.data;

      // Update user in store (tokens remain the same)
      useAuthStore.getState().setUser(user);
      return user;
    } catch (error) {
      // Token is invalid or expired, logout
      this.logout();
      return null;
    }
  }

  /**
   * Refresh the access token using the refresh token
   * @returns Promise that resolves with new access token or null if invalid
   */
  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        return null;
      }

      // Call backend to get new access token
      const response = await apiClient.post<RefreshResponse>('/auth/refresh', {
        refreshToken,
      });

      const { accessToken, user } = response.data;

      // Update access token and user in store (refresh token remains the same)
      const currentRefreshToken = useAuthStore.getState().refreshToken!;
      useAuthStore.getState().setLogin(accessToken, currentRefreshToken, user);

      return accessToken;
    } catch (error) {
      // Refresh token is invalid or expired, logout
      this.logout();
      return null;
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();