import { apiClient } from '../../api/client';

export interface CreateUsuarioDTO {
  username: string;
  nombre: string;
  apellido: string;
  sector: 'admin' | 'armado' | 'facturacion';
  password: string;
}

export interface UpdateUsuarioDTO {
  username?: string;
  nombre?: string;
  apellido?: string;
  sector?: 'admin' | 'armado' | 'facturacion';
  password?: string;
  activo?: boolean;
}

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  sector: 'admin' | 'armado' | 'facturacion' | 'CHESS';
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
   * Dar de baja un usuario (baja lógica)
   */
  async deactivateUser(id: number): Promise<Usuario> {
    const response = await apiClient.put<{success: boolean; data: Usuario}>(`/usuarios/${id}`, { activo: false });
    return response.data.data;
  }
}

export const userService = new UserService();
