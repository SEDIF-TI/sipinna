import { api } from './client';

// Endpoints del superadmin (permiso GESTIONAR_USUARIOS).
// Tipos iguales a los DTO del backend (UsuarioResponse, SecretariaResponse...).

export type UsuarioAdmin = {
  id: number;
  username: string;
  correo: string;
  rol: string;
  secretariaId: number | null;
  secretaria: string | null;
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso: string | null;
};

export type UsuarioCrear = {
  username: string;
  correo: string;
  password: string;
  rol: string;
  secretariaId: number | null;
};

export type UsuarioEditar = {
  correo: string;
  rol: string;
  secretariaId: number | null;
};

export type Secretaria = {
  id: number;
  nombre: string;
  siglas: string;
  activo: boolean;
  usuarioAsignado: string | null;
};

export type SecretariaDatos = { nombre: string; siglas: string };

export type EventoAuditoria = {
  id: number;
  usuario: string | null;
  accion: string;
  detalle: string | null;
  ip: string | null;
  fecha: string;
};

export const adminApi = {
  /** Últimas 100 acciones, de la más reciente a la más antigua. */
  auditoria: (token: string) => api<EventoAuditoria[]>('/api/auditoria', { token }),

  roles: (token: string) => api<string[]>('/api/roles', { token }),

  usuarios: (token: string) => api<UsuarioAdmin[]>('/api/usuarios', { token }),
  crearUsuario: (token: string, datos: UsuarioCrear) =>
    api<UsuarioAdmin>('/api/usuarios', { method: 'POST', body: datos, token }),
  editarUsuario: (token: string, id: number, datos: UsuarioEditar) =>
    api<UsuarioAdmin>(`/api/usuarios/${id}`, { method: 'PUT', body: datos, token }),
  estadoUsuario: (token: string, id: number, activo: boolean) =>
    api<UsuarioAdmin>(`/api/usuarios/${id}/estado`, { method: 'PATCH', body: { activo }, token }),

  secretarias: (token: string) => api<Secretaria[]>('/api/secretarias', { token }),
  crearSecretaria: (token: string, datos: SecretariaDatos) =>
    api<Secretaria>('/api/secretarias', { method: 'POST', body: datos, token }),
  editarSecretaria: (token: string, id: number, datos: SecretariaDatos) =>
    api<Secretaria>(`/api/secretarias/${id}`, { method: 'PUT', body: datos, token }),
  estadoSecretaria: (token: string, id: number, activo: boolean) =>
    api<Secretaria>(`/api/secretarias/${id}/estado`, { method: 'PATCH', body: { activo }, token }),
};

/** "2026-11-27T00:47:06.37" → "27/11/2026 00:47" */
export function formatearFecha(iso: string | null): string {
  if (!iso) return 'Nunca';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()} ${dos(d.getHours())}:${dos(d.getMinutes())}`;
}
