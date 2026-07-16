import { apiClient } from '../../api/client';

export interface ConfiguracionDTO {
  id?: number;
  horaConsultaPreventaManana?: string;
  lastTriggeredDate?: string;
  queriesRemaining?: number;
}

export const configuracionService = {
  getConfiguracion: async (): Promise<ConfiguracionDTO> => {
    const response = await apiClient.get('/configuracion');
    return response.data.data;
  },

  updateConfiguracion: async (data: ConfiguracionDTO): Promise<ConfiguracionDTO> => {
    const response = await apiClient.put('/configuracion', data);
    return response.data.data;
  },
};
