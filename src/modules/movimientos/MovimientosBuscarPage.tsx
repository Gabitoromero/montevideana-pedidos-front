import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Sidebar } from '../../shared/components/Sidebar';
import { FullscreenButton } from '../../shared/components/FullscreenButton';
import { Button } from '../../shared/components/Button';
import { movimientoService } from './movimiento.service';
import { userService } from '../users/user.service';
import type { Movimiento, EstadoPedido } from './movimiento.types';
import type { Usuario } from '../users/user.service';
import type { Fletero } from '../fleteros/fleteros.service';
import { fleterosService } from '../fleteros/fleteros.service';
import Select from 'react-select';
import { z } from 'zod';
import { useThemeStore } from '../../store/theme.store';

type SectorFilter = 'Todos' | 'ADMIN' | 'CAMARA' | 'EXPEDICION' | 'CHESS';

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: '#f59e0b', // Naranja
  'EN PREPARACION': '#3b82f6', // Azul
  'EN PREPARACIÓN': '#3b82f6', // Azul
  PREPARADO: '#8b5cf6', // Púrpura
  TESORERIA: '#06b6d4', // Cyan
  TESORERÍA: '#06b6d4', // Cyan
  ENTREGADO: '#10b981', // Verde
  ANULADO: '#ef4444', // Rojo
};

const buscarFormSchema = z.object({
  idPedido: z.string().refine(val => val.trim() === '' || /^\d+$/.test(val.trim()), {
    message: 'El ID de pedido debe contener solo números',
  }),
  fechaInicio: z.string(),
}).refine((data) => data.idPedido.trim() !== '' || data.fechaInicio.trim() !== '', {
  message: 'Debes ingresar una Fecha de Inicio obligatoriamente si no buscas por ID.',
  path: ['fechaInicio'],
});

export const MovimientosBuscarPage: React.FC = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Filtros de Búsqueda
  const [idPedido, setIdPedido] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [sectorFilter, setSectorFilter] = useState<SectorFilter | ''>('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoPedido | ''>('');
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<number | ''>('');
  const [searchText, setSearchText] = useState('');
  
  // Theme y Fleteros
  const { theme } = useThemeStore();
  const [fleteros, setFleteros] = useState<Fletero[]>([]);

  // Paginación y Estado
  const [currentPage, setCurrentPage] = useState(1);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

  // Cargar usuarios y fleteros al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, fleterosData] = await Promise.all([
          userService.getAllUsers(),
          fleterosService.getAllFleteros()
        ]);
        setUsuarios(usersData);
        setFleteros(fleterosData);
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
      }
    };
    loadData();
  }, []);

  // Opciones para React Select
  const usuarioOptions = [
    { value: '', label: 'Cualquier usuario...' },
    ...usuarios
      .filter(u => sectorFilter === 'Todos' || sectorFilter === '' ? true : u.sector === sectorFilter)
      .map(u => ({
        value: u.id,
        label: `${u.nombre} ${u.apellido} (${u.sector})`
      }))
  ];

  const fleteroOptions = [
    { value: '', label: 'Cualquier fletero...' },
    ...fleteros.map(f => ({
      value: f.dsFletero,
      label: f.dsFletero
    }))
  ];

  // Estilos personalizados para react-select para adaptarse al theme dark/light
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: 'var(--bg-lighter)',
      borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
      color: 'var(--text-primary)',
      padding: '2px',
      borderRadius: '0.5rem',
      boxShadow: state.isFocused ? '0 0 0 1px var(--primary)' : 'none',
      '&:hover': {
        borderColor: 'var(--primary)'
      }
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 50
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? 'var(--primary)' 
        : state.isFocused 
          ? 'var(--bg-lighter)' 
          : 'transparent',
      color: state.isSelected ? '#ffffff' : 'var(--text-primary)',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'var(--primary)'
      }
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'var(--text-primary)'
    }),
    input: (base: any) => ({
      ...base,
      color: 'var(--text-primary)'
    })
  };

  const handleSearch = async (e?: React.FormEvent, pageStr?: number) => {
    if (e) e.preventDefault();
    
    // Validación Backend / Frontend con Zod
    const validationResult = buscarFormSchema.safeParse({ idPedido, fechaInicio });
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach(issue => {
        if (issue.path[0] !== undefined) {
          fieldErrors[String(issue.path[0])] = issue.message;
        }
      });
      setZodErrors(fieldErrors);
      setError('Por favor, corrige los errores en el formulario para buscar.');
      return;
    }
    
    setZodErrors({});

    const targetPage = pageStr || (e ? 1 : currentPage);
    if (e) setCurrentPage(1);

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await movimientoService.getMovimientos({
        idPedido: idPedido.trim() || undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        sector: sectorFilter !== 'Todos' && sectorFilter !== '' ? sectorFilter : undefined,
        estado: estadoFilter !== '' ? (estadoFilter as EstadoPedido) : undefined,
        idUsuario: selectedUsuarioId !== '' ? Number(selectedUsuarioId) : undefined,
        search: searchText.trim() || undefined,
        page: targetPage,
      });

      setMovimientos(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err: any) {
      console.error('Error completo:', err);
      console.error('Datos del error del backend (Zod):', err.response?.data);
      
      if (err.response?.status === 404) {
        // No hay resultados - se maneja visualmente con el cartel de no encontrados sin ser un Error rojo.
      } else {
        const backendMessage = err.response?.data?.message || err.response?.data?.error;
        if (Array.isArray(backendMessage)) {
          // Si Zod devuelve un array de errores
          setError(`Error de validación: ${backendMessage.map((m: any) => typeof m === 'string' ? m : m.message).join(', ')}`);
        } else if (typeof backendMessage === 'string') {
          setError(backendMessage);
        } else if (err.response?.data) {
          setError(JSON.stringify(err.response.data));
        } else {
          setError('Error al buscar movimientos. Verifica la consola para más detalles.');
        }
      }
      setMovimientos([]);
      setTotalPages(0);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    handleSearch(undefined, newPage);
  };

  const handleClearFilters = () => {
    setIdPedido('');
    setFechaInicio('');
    setFechaFin('');
    setSectorFilter('');
    setEstadoFilter('');
    setSelectedUsuarioId('');
    setSearchText('');
    setMovimientos([]);
    setHasSearched(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: ${theme === 'dark' ? 'invert(1) brightness(0.8)' : 'none'};
        }
      `}</style>
      <FullscreenButton />
      <Sidebar />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/movimientos')}
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              <span>Volver al Menú</span>
            </button>
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Buscador de Movimientos</h1>
            <p className="text-[var(--text-secondary)]">Consulta avanzada de movimientos con filtros múltiples</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6 mb-8 shadow-sm">
          <div className="mb-6 pb-6 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Filter size={20} />
              Filtros Principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">ID Pedido</label>
                <input
                  type="text"
                  placeholder="Ej: 00226957"
                  value={idPedido}
                  onChange={(e) => {
                    setIdPedido(e.target.value);
                    if (zodErrors.idPedido) {
                      setZodErrors({...zodErrors, idPedido: ''});
                    }
                  }}
                  className={`w-full px-4 py-2 bg-[var(--bg-lighter)] border ${zodErrors.idPedido ? 'border-[var(--error)]' : 'border-[var(--border)]'} rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]`}
                />
                {zodErrors.idPedido && (
                  <p className="text-[var(--error)] text-sm mt-1">{zodErrors.idPedido}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Fecha Inicio {!idPedido && <span className="text-[var(--error)]">*</span>}
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setFechaInicio(e.target.value);
                    if (zodErrors.fechaInicio) {
                      setZodErrors({...zodErrors, fechaInicio: ''});
                    }
                  }}
                  className={`w-full px-4 py-2 bg-[var(--bg-lighter)] border ${zodErrors.fechaInicio ? 'border-[var(--error)]' : 'border-[var(--border)]'} rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]`}
                />
                {zodErrors.fechaInicio && (
                  <p className="text-[var(--error)] text-sm mt-1">{zodErrors.fechaInicio}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Fecha Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 uppercase tracking-wider">Filtros Adicionales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Sector del usuario</label>
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value as SectorFilter)}
                  className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="">Todos los sectores...</option>
                  <option value="ADMIN">Admin</option>
                  <option value="CAMARA">Cámara</option>
                  <option value="EXPEDICION">Expedición</option>
                  <option value="CHESS">CHESS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Estado final</label>
                <select
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value as EstadoPedido)}
                  className="w-full px-4 py-2 bg-[var(--bg-lighter)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="">Cualquier estado...</option>
                  <option value="2">Pendiente</option>
                  <option value="3">En Preparación</option>
                  <option value="4">Preparado</option>
                  <option value="5">Tesorería</option>
                  <option value="6">Entregado</option>
                  <option value="7">Anulado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Usuario</label>
                <Select
                  options={usuarioOptions}
                  styles={selectStyles}
                  placeholder="Buscar usuario..."
                  value={usuarioOptions.find(opt => opt.value === selectedUsuarioId) || usuarioOptions[0]}
                  onChange={(option) => setSelectedUsuarioId(option?.value !== undefined ? (option.value as number | '') : '')}
                  isClearable={false}
                  isSearchable={true}
                  noOptionsMessage={() => "No se encontraron usuarios"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Fletero (Descripción)</label>
                <Select
                  options={fleteroOptions}
                  styles={selectStyles}
                  placeholder="Buscar fletero..."
                  value={fleteroOptions.find(opt => opt.value === searchText) || (searchText ? { value: searchText, label: searchText } : fleteroOptions[0])}
                  onChange={(option) => setSearchText(option?.value ? String(option.value) : '')}
                  isClearable={false}
                  isSearchable={true}
                  noOptionsMessage={() => "No se encontraron fleteros"}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[var(--error)]/10 border border-[var(--error)] rounded-lg text-[var(--error)] text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1 md:flex-none">
              <Search size={20} />
              {isLoading ? 'Buscando...' : 'Buscar Movimientos'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleClearFilters} disabled={isLoading}>
              Limpiar Filtros
            </Button>
          </div>
        </form>

        {/* Resultados */}
        {hasSearched && !isLoading && (
          <>
            {movimientos.length > 0 ? (
              <>
                <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                  <p className="text-[var(--text-secondary)] font-medium">
                    Se encontraron <span className="text-[var(--primary)] font-bold">{total}</span> movimientos.
                    Mostrando página {currentPage} de {totalPages}.
                  </p>
                </div>

                <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg overflow-hidden mb-8 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[var(--bg-lighter)] text-[var(--text-secondary)] border-b border-[var(--border)]">
                          <th className="px-6 py-4 font-semibold text-sm">Fecha y Hora</th>
                          <th className="px-6 py-4 font-semibold text-sm">Pedido</th>
                          <th className="px-6 py-4 font-semibold text-sm">Usuario</th>
                          <th className="px-6 py-4 font-semibold text-sm">Estado Inicial</th>
                          <th className="px-6 py-4 font-semibold text-sm">Estado Final</th>
                          <th className="px-6 py-4 font-semibold text-sm">Fletero</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {movimientos.map((movimiento, index) => (
                          <tr key={index} className="hover:bg-[var(--bg-lighter)] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-[var(--text-primary)]">
                              {new Date(movimiento.fechaHora).toLocaleString('es-AR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[var(--text-primary)] font-medium">
                              {movimiento.pedido.idPedido}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[var(--text-primary)]">
                              {movimiento.usuario.nombre} {movimiento.usuario.apellido}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className="px-3 py-1 rounded-full text-sm font-semibold"
                                style={{
                                  backgroundColor: `${ESTADO_COLORS[movimiento.estadoInicial.nombreEstado.toUpperCase()] || '#9ca3af'}20`,
                                  color: ESTADO_COLORS[movimiento.estadoInicial.nombreEstado.toUpperCase()] || '#9ca3af',
                                  border: `1px solid ${ESTADO_COLORS[movimiento.estadoInicial.nombreEstado.toUpperCase()] || '#9ca3af'}40`
                                }}
                              >
                                {movimiento.estadoInicial.nombreEstado}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className="px-3 py-1 rounded-full text-sm font-semibold"
                                style={{
                                  backgroundColor: `${ESTADO_COLORS[movimiento.estadoFinal.nombreEstado.toUpperCase()] || '#9ca3af'}20`,
                                  color: ESTADO_COLORS[movimiento.estadoFinal.nombreEstado.toUpperCase()] || '#9ca3af',
                                  border: `1px solid ${ESTADO_COLORS[movimiento.estadoFinal.nombreEstado.toUpperCase()] || '#9ca3af'}40`
                                }}
                              >
                                {movimiento.estadoFinal.nombreEstado}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[var(--text-secondary)]">
                              {movimiento.pedido.fletero?.dsFletero || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 py-8">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="secondary"
                    >
                      <ChevronLeft size={20} />
                      Anterior
                    </Button>
                    <span className="text-[var(--text-primary)] font-medium">Página {currentPage} de {totalPages}</span>
                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="secondary"
                    >
                      Siguiente
                      <ChevronRight size={20} />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg">
                <Search size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
                <p className="text-[var(--text-secondary)] text-lg">No se encontraron movimientos para los criterios seleccionados.</p>
              </div>
            )}
          </>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)]">Consultando base de datos...</p>
          </div>
        )}
      </div>
    </div>
  );
};
