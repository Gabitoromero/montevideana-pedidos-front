import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../auth.store';
import type { User } from '../../shared/types/user.types';

describe('Auth Store', () => {
  // Reset store before each test
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  describe('Initial State', () => {
    it('should have unauthenticated initial state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setLogin', () => {
    it('should update user when calling setLogin', () => {
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        nombre: 'Test',
        apellido: 'User',
        sector: 'IT',
      };

      useAuthStore.getState().setLogin(mockUser);
      
      const state = useAuthStore.getState();
      
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should persist authentication state across store instances', () => {
      const mockUser: User = {
        id: 2,
        username: 'anotheruser',
        nombre: 'Another',
        apellido: 'User',
        sector: 'Sales',
      };

      useAuthStore.getState().setLogin(mockUser);
      
      // Get a fresh reference to the store
      const newState = useAuthStore.getState();
      
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.user?.username).toBe('anotheruser');
    });
  });

  describe('setUser', () => {
    it('should update the user', () => {
      const initialUser: User = {
        id: 1,
        username: 'user1',
        nombre: 'User',
        apellido: 'One',
        sector: 'IT',
      };
      
      useAuthStore.getState().setLogin(initialUser);
      
      const updatedUser: User = {
        id: 1,
        username: 'user1',
        nombre: 'Updated',
        apellido: 'Name',
        sector: 'HR',
      };
      
      useAuthStore.getState().setUser(updatedUser);
      
      const state = useAuthStore.getState();
      
      expect(state.user).toEqual(updatedUser);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear all state when calling logout', () => {
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        nombre: 'Test',
        apellido: 'User',
        sector: 'IT',
      };

      // First login
      useAuthStore.getState().setLogin(mockUser);
      
      // Verify logged in
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      
      // Then logout
      useAuthStore.getState().logout();
      
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle logout when already logged out', () => {
      useAuthStore.getState().logout();
      
      const state = useAuthStore.getState();
      
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });
});
