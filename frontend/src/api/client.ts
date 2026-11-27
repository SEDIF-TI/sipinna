import { API_URL } from '../config';

/** Forma de los errores que regresa el backend (ErrorResponse.java). */
type ErrorBody = {
  status?: number;
  mensaje?: string;
  detalles?: Record<string, string> | null;
};

export class ApiError extends Error {
  status: number;
  detalles: Record<string, string> | null;

  constructor(status: number, mensaje: string, detalles: Record<string, string> | null = null) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.detalles = detalles;
  }
}

type Opciones = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

// Se llama cuando el backend responde 401 a una petición con token
// (sesión expirada o revocada). Lo registra el AuthProvider.
let alNoAutorizado: (() => void) | null = null;
export function registrarAlNoAutorizado(fn: (() => void) | null) {
  alNoAutorizado = fn;
}

export async function api<T>(ruta: string, { method = 'GET', body, token }: Opciones = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
  }

  const texto = await respuesta.text();
  let datos: unknown = null;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = null;
    }
  }

  if (!respuesta.ok) {
    const error = (datos ?? {}) as ErrorBody;
    if (respuesta.status === 401 && token) alNoAutorizado?.();
    throw new ApiError(
      respuesta.status,
      error.mensaje ?? 'Ocurrió un error inesperado.',
      error.detalles ?? null,
    );
  }

  return datos as T;
}
