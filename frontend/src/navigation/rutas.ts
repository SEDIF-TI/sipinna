import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import { Modulo, ROLES } from '../auth/types';

/**
 * 'periodos' no viene en /api/panel/menu: el backend lo protege por rol
 * (hasRole SUPERADMINISTRADOR), así que el menú lo agrega según el rol.
 */
export type RutaPrivada = 'inicio' | Modulo | 'periodos';

type Icono = ComponentProps<typeof Ionicons>['name'];

export const MODULOS: Record<Modulo, { titulo: string; icono: Icono }> = {
  captura: { titulo: 'Captura', icono: 'create-outline' },
  consulta: { titulo: 'Consulta', icono: 'search-outline' },
  seguimiento: { titulo: 'Seguimiento', icono: 'checkbox-outline' },
  reportes: { titulo: 'Reportes', icono: 'bar-chart-outline' },
  usuarios: { titulo: 'Usuarios y secretarías', icono: 'people-outline' },
};

const EXTRA: Record<'inicio' | 'periodos', { titulo: string; icono: Icono }> = {
  inicio: { titulo: 'Inicio', icono: 'home-outline' },
  periodos: { titulo: 'Periodos de captura', icono: 'calendar-outline' },
};

const info = (r: RutaPrivada) => (r === 'inicio' || r === 'periodos' ? EXTRA[r] : MODULOS[r]);

export const tituloDeRuta = (r: RutaPrivada) => info(r).titulo;
export const iconoDeRuta = (r: RutaPrivada) => info(r).icono;

/** Rutas del menú: inicio, los módulos del backend y las que dependen del rol. */
export function rutasDelUsuario(modulos: Modulo[], rol: string): RutaPrivada[] {
  const rutas: RutaPrivada[] = ['inicio', ...modulos];
  if (rol === ROLES.SUPERADMINISTRADOR) {
    const i = rutas.indexOf('usuarios');
    rutas.splice(i === -1 ? rutas.length : i, 0, 'periodos');
  }
  return rutas;
}
