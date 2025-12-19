import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/auth.store';
import type { User } from '../../shared/types/user.types';

interface LoginResponse {
  token: string;
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

      const { token, user } = response.data;

      // Store token and user in Zustand store
      useAuthStore.getState().setLogin(token, user);
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
}

// Export a singleton instance
export const authService = new AuthService();