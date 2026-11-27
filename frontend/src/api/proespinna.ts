import { api } from './client';

// Formato PROESPINNA (permiso CAPTURAR) y catálogos (cualquier sesión).
// Tipos iguales a los DTO del backend.

export type ItemCatalogo = { id: number; clave: string; nombre: string };

export type Periodo = {
  id: number;
  anio: number;
  trimestre: number;
  etiqueta: string;
  fechaInicio: string;
  fechaFin: string;
  abierto: boolean;
};

export type Beneficiarios = {
  ninas0a5: number;
  ninas6a8: number;
  ninas9a11: number;
  adolescentesMujeres12a14: number;
  adolescentesMujeres15a17: number;
  ninos0a5: number;
  ninos6a8: number;
  ninos9a11: number;
  adolescentesHombres12a14: number;
  adolescentesHombres15a17: number;
};

export type Estatus = 'BORRADOR' | 'ENVIADO' | 'EN_REVISION' | 'OBSERVADO' | 'APROBADO';
export type Cobertura = 'ESTATAL' | 'MUNICIPAL';

export type Registro = {
  id: number;
  estatus: Estatus;
  secretaria: ItemCatalogo;
  periodo: Periodo;
  estrategia: ItemCatalogo;
  dependenciaAsociada: string | null;
  accionPuntual: string;
  nombreActividad: string;
  descripcion: string;
  cobertura: Cobertura;
  municipios: ItemCatalogo[];
  fechaInicio: string; // AAAA-MM-DD
  fechaConclusion: string;
  beneficiarios: Beneficiarios;
  totalNna: number;
  comentarios: string | null;
  creadoPor: string;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  fechaEnvio: string | null;
};

export type RegistroDatos = {
  periodoId: number;
  estrategiaId: number;
  dependenciaAsociada: string | null;
  accionPuntual: string;
  nombreActividad: string;
  descripcion: string;
  cobertura: Cobertura;
  municipioIds: number[];
  fechaInicio: string;
  fechaConclusion: string;
  beneficiarios: Beneficiarios;
  comentarios: string | null;
};

const BASE = '/api/proespinna/registros';

export const proespinnaApi = {
  estrategias: (token: string) => api<ItemCatalogo[]>('/api/catalogos/estrategias?programa=PROESPINNA', { token }),
  municipios: (token: string) => api<ItemCatalogo[]>('/api/catalogos/municipios', { token }),
  periodosAbiertos: (token: string) => api<Periodo[]>('/api/catalogos/periodos-abiertos', { token }),

  misRegistros: (token: string) => api<Registro[]>(BASE, { token }),
  obtener: (token: string, id: number) => api<Registro>(`${BASE}/${id}`, { token }),
  crear: (token: string, datos: RegistroDatos) => api<Registro>(BASE, { method: 'POST', body: datos, token }),
  editar: (token: string, id: number, datos: RegistroDatos) =>
    api<Registro>(`${BASE}/${id}`, { method: 'PUT', body: datos, token }),
  eliminar: (token: string, id: number) => api<void>(`${BASE}/${id}`, { method: 'DELETE', token }),
  enviar: (token: string, id: number) => api<Registro>(`${BASE}/${id}/enviar`, { method: 'POST', token }),
};

/** Periodos de captura (solo SUPERADMINISTRADOR). */
export const periodosApi = {
  listar: (token: string) => api<Periodo[]>('/api/periodos', { token }),
  crear: (token: string, datos: { anio: number; trimestre: number; abierto: boolean }) =>
    api<Periodo>('/api/periodos', { method: 'POST', body: datos, token }),
  estado: (token: string, id: number, abierto: boolean) =>
    api<Periodo>(`/api/periodos/${id}/estado`, { method: 'PATCH', body: { activo: abierto }, token }),
};

export const ESTATUS: Record<Estatus, { texto: string; fondo: string; color: string }> = {
  BORRADOR: { texto: 'Borrador', fondo: '#EEEEF2', color: '#45455A' },
  ENVIADO: { texto: 'Enviado', fondo: '#E0ECFF', color: '#1D4ED8' },
  EN_REVISION: { texto: 'En revisión', fondo: '#FEF3C7', color: '#92400E' },
  OBSERVADO: { texto: 'Observado', fondo: '#FDE2E1', color: '#B3261E' },
  APROBADO: { texto: 'Aprobado', fondo: '#E6F4EA', color: '#1E7B34' },
};

/** Solo se editan los borradores y lo que la revisión regresó (EstatusRegistro.esEditable). */
export const esEditable = (e: Estatus) => e === 'BORRADOR' || e === 'OBSERVADO';

export const BENEFICIARIOS_VACIOS: Beneficiarios = {
  ninas0a5: 0,
  ninas6a8: 0,
  ninas9a11: 0,
  adolescentesMujeres12a14: 0,
  adolescentesMujeres15a17: 0,
  ninos0a5: 0,
  ninos6a8: 0,
  ninos9a11: 0,
  adolescentesHombres12a14: 0,
  adolescentesHombres15a17: 0,
};

export const EDADES = ['0 a 5', '6 a 8', '9 a 11', '12 a 14', '15 a 17'] as const;

/** Filas de la tabla de población: mismas claves que BeneficiariosDto, en orden de edad. */
export const FILAS_BENEFICIARIOS: { titulo: string; sexo: string; claves: (keyof Beneficiarios)[] }[] = [
  {
    titulo: 'Mujeres',
    sexo: 'Niñas y adolescentes mujeres',
    claves: ['ninas0a5', 'ninas6a8', 'ninas9a11', 'adolescentesMujeres12a14', 'adolescentesMujeres15a17'],
  },
  {
    titulo: 'Hombres',
    sexo: 'Niños y adolescentes hombres',
    claves: ['ninos0a5', 'ninos6a8', 'ninos9a11', 'adolescentesHombres12a14', 'adolescentesHombres15a17'],
  },
];

export const totalBeneficiarios = (b: Beneficiarios) =>
  Object.values(b).reduce((t, n) => t + (Number.isFinite(n) ? n : 0), 0);

/** "2026-10-01" → "01/10/2026" */
export function isoADmy(iso: string | null | undefined): string {
  if (!iso) return '';
  const [a, m, d] = iso.slice(0, 10).split('-');
  return a && m && d ? `${d}/${m}/${a}` : iso;
}

/** "01/10/2026" → "2026-10-01", o null si no es una fecha válida. */
export function dmyAIso(texto: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(texto.trim());
  if (!m) return null;
  const [, d, mes, a] = m.map(Number);
  const f = new Date(a, mes - 1, d);
  if (f.getFullYear() !== a || f.getMonth() !== mes - 1 || f.getDate() !== d) return null;
  return `${a}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
