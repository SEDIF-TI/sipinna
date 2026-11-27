import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// En web no existe SecureStore: se usa localStorage.
// En Android/iOS el token se guarda cifrado con SecureStore.

const CLAVE = 'sipinna.sesion';

export type SesionGuardada = {
  token: string;
  expiraEn: number; // fecha de expiración en milisegundos (Date.now())
};

export async function leerSesion(): Promise<SesionGuardada | null> {
  try {
    const texto =
      Platform.OS === 'web'
        ? globalThis.localStorage?.getItem(CLAVE) ?? null
        : await SecureStore.getItemAsync(CLAVE);
    if (!texto) return null;
    const sesion = JSON.parse(texto) as SesionGuardada;
    if (!sesion.token || !sesion.expiraEn) return null;
    return sesion;
  } catch {
    return null;
  }
}

export async function guardarSesion(sesion: SesionGuardada): Promise<void> {
  const texto = JSON.stringify(sesion);
  try {
    if (Platform.OS === 'web') globalThis.localStorage?.setItem(CLAVE, texto);
    else await SecureStore.setItemAsync(CLAVE, texto);
  } catch {
    // Si no se puede guardar, la sesión sigue en memoria hasta recargar.
  }
}

export async function borrarSesion(): Promise<void> {
  try {
    if (Platform.OS === 'web') globalThis.localStorage?.removeItem(CLAVE);
    else await SecureStore.deleteItemAsync(CLAVE);
  } catch {
    // Nada que hacer.
  }
}
