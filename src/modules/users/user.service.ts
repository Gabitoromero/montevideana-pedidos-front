import { apiClient } from '../../api/client';

export interface CreateUsuarioDTO {
  username: string;
  nombre: string;
  apellido: string;
  sector: 'ADMIN' | 'CAMARA' | 'EXPEDICION' | 'TELEVISOR';
  password: string;
}

export interface UpdateUsuarioDTO {
  username?: string;
  nombre?: string;
  apellido?: string;
  sector?: 'ADMIN' | 'CAMARA' | 'EXPEDICION' | 'TELEVISOR';
  password?: string;
  activo?: boolean;
}

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  sector: 'ADMIN' | 'CAMARA' | 'EXPEDICION' | 'CHESS' | 'TELEVISOR';
  activo: boolean;
}

class UserService {
  /**
   * Crear un nuevo usuario
   */
  async createUser(data: CreateUsuarioDTO): Promise<Usuario> {
    const response = await apiClient.post<{success: boolean; data: Usuario}>('/usuarios', data);
    return response.data.data;
  }

  /**
   * Obtener todos los usuarios del sistema
   */
  async getAllUsers(): Promise<Usuario[]> {
    const response = await apiClient.get<{success: boolean; data: Usuario[]}>('/usuarios');
    return response.data.data;
  }

  /**
   * Obtener un usuario por ID
   */
  async getUserById(id: number): Promise<Usuario> {
    const response = await apiClient.get<{success: boolean; data: Usuario}>(`/usuarios/${id}`);
    return response.data.data;
  }

  /**
   * Actualizar un usuario existente
   */
  async updateUser(id: number, data: UpdateUsuarioDTO): Promise<Usuario> {
    const response = await apiClient.put<{success: boolean; data: Usuario}>(`/usuarios/${id}`, data);
    return response.data.data;
  }

  /**
   * Cambiar el estado de un usuario (activar/desactivar)
   */
  async cambiarEstadoUser(id: number): Promise<string> {
    const response = await apiClient.patch<{success: boolean; data: { message: string }}>(`/usuarios/${id}/activar`);
    return response.data.data.message;
  }

  /**
   * Eliminar un usuario definitivamente (eliminación física)
   */
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/usuarios/${id}`);
  }
}

export const userService = new UserService();
