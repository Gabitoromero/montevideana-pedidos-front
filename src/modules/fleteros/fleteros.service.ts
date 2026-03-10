import { apiClient } from '../../api/client';

export interface Fletero {
  idFletero: number;
  dsFletero: string;
  seguimiento: boolean;
  liquidacion: boolean;
  telefono1: string;
  telefono2: string;
}

export interface UpdateSeguimientoDTO {
  seguimiento: boolean;
}

class FleterosService {
  /**
   * Obtener todos los fleteros 
   */
  async getAllFleteros(): Promise<Fletero[]> {
    const response = await apiClient.get<{success: boolean; data: Fletero[]}>('/fleteros');
    return response.data.data;
  }

  /* Obtener fleteros activos */
  async getActiveFleteros(): Promise<Fletero[]> {
    const response = await apiClient.get<{success: boolean; data: Fletero[]}>('/fleteros/activos');
    return response.data.data;
  }

  /**
   * Obtener fleteros inactivos (sin seguimiento)
   */
  async getInactiveFleteros(): Promise<Fletero[]> {
    const response = await apiClient.get<{success: boolean; data: Fletero[]}>('/fleteros/inactivos');
    return response.data.data;
  }

  /**
   * Obtener un fletero por ID
   */
  async getFleterosById(id: number): Promise<Fletero> {
    const response = await apiClient.get<{success: boolean; data: Fletero}>(`/fleteros/${id}`);
    return response.data.data;
  }

  /**
   * Actualizar estado de seguimiento de un fletero
   */
  async updateSeguimiento(id: number, seguimiento: boolean): Promise<Fletero> {
    const response = await apiClient.patch<{success: boolean; data: Fletero}>(
      `/fleteros/${id}`,
      { seguimiento }
    );
    return response.data.data;
  }

  /**
   * Actualizar estado de liquidación de un fletero
   */
  async updateLiquidacion(id: number, liquidacion: boolean): Promise<Fletero> {
    const response = await apiClient.patch<{success: boolean; data: Fletero}>(
      `/fleteros/${id}/liquidacion`,
      { liquidacion }
    );
    return response.data.data;
  }

  /**
   * Actualizar teléfonos de un fletero
   */
  async updateTelefonos(id: number, telefono1: string, telefono2: string): Promise<Fletero> {
    const response = await apiClient.patch<{success: boolean; data: Fletero}>(
      `/fleteros/${id}/telefonos`,
      { telefono1, telefono2 }
    );
    return response.data.data;
  }
}

export const fleterosService = new FleterosService();
