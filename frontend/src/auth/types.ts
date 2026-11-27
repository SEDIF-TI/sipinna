/** POST /api/auth/login */
export type LoginResponse = {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  id: number;
  username: string;
  rol: string;
  permisos: string[];
};

/** GET /api/auth/me */
export type Usuario = {
  id: number;
  username: string;
  correo: string;
  rol: string;
  secretaria: string | null;
  permisos: string[];
};

/** GET /api/panel/menu */
export type MenuResponse = {
  usuario: string;
  modulos: Modulo[];
};

export type Modulo = 'captura' | 'consulta' | 'seguimiento' | 'reportes' | 'usuarios';

export const ROLES = {
  SUPERADMINISTRADOR: 'SUPERADMINISTRADOR',
  ADMINISTRADOR: 'ADMINISTRADOR',
  USUARIO: 'USUARIO',
} as const;

export function nombreDelRol(rol: string): string {
  switch (rol) {
    case ROLES.SUPERADMINISTRADOR:
      return 'Superadministrador';
    case ROLES.ADMINISTRADOR:
      return 'Administrador';
    case ROLES.USUARIO:
      return 'Capturista';
    default:
      return rol;
  }
}

/** El capturista ve su propio inicio; los demás roles ven el del administrador. */
export function esCapturista(rol: string): boolean {
  return rol === ROLES.USUARIO;
}
