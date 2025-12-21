import { apiClient } from '../../api/client';

export interface CreateUsuarioDTO {
  username: string;
  nombre: string;
  apellido: string;
  sector: 'admin' | 'armado' | 'facturacion';
  password: string;
}

export interface UsuarioResponse {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  sector: string;
}

class UserService {
  async createUser(data: CreateUsuarioDTO): Promise<UsuarioResponse> {
    const response = await apiClient.post<UsuarioResponse>('/usuarios', data);
    return response.data;
  }
}

export const userService = new UserService();
