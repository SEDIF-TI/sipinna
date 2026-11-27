import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { Modulo } from '../auth/types';

export type RutaPrivada = 'inicio' | Modulo;

type Icono = ComponentProps<typeof Ionicons>['name'];

export const MODULOS: Record<Modulo, { titulo: string; icono: Icono }> = {
  captura: { titulo: 'Captura', icono: 'create-outline' },
  consulta: { titulo: 'Consulta', icono: 'search-outline' },
  seguimiento: { titulo: 'Seguimiento', icono: 'checkbox-outline' },
  reportes: { titulo: 'Reportes', icono: 'bar-chart-outline' },
  usuarios: { titulo: 'Usuarios y secretarías', icono: 'people-outline' },
};

export function tituloDeRuta(ruta: RutaPrivada): string {
  return ruta === 'inicio' ? 'Inicio' : MODULOS[ruta].titulo;
}
