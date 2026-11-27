import { Platform } from 'react-native';

// El correo de recuperación trae un enlace como:
//   http://localhost:8081/restablecer-password?token=XXXX
// En web se lee de la URL al abrir la app. (En Android/iOS haría falta
// configurar deep links; por ahora solo aplica a la versión web.)

const RUTA_RESTABLECER = '/restablecer-password';

export function leerTokenRestablecer(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const { pathname, search } = window.location;
  if (!pathname.replace(/\/+$/, '').endsWith(RUTA_RESTABLECER)) return null;
  const token = new URLSearchParams(search).get('token');
  return token && token.trim() ? token.trim() : null;
}

/** Quita el token de la barra de direcciones para que no quede en el historial. */
export function limpiarUrl() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  window.history.replaceState(null, '', '/');
}
