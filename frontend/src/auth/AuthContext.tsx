import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { api, registrarAlNoAutorizado } from '../api/client';
import { borrarSesion, guardarSesion, leerSesion } from './tokenStorage';
import type { LoginResponse, MenuResponse, Modulo, Usuario } from './types';

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'sinSesion'; aviso: string | null }
  | { tipo: 'conSesion'; token: string; usuario: Usuario; modulos: Modulo[] };

type AuthValor = {
  estado: Estado;
  iniciarSesion: (identificador: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const AuthContext = createContext<AuthValor | null>(null);

async function cargarPerfil(token: string) {
  const [usuario, menu] = await Promise.all([
    api<Usuario>('/api/auth/me', { token }),
    api<MenuResponse>('/api/panel/menu', { token }),
  ]);
  return { usuario, modulos: menu.modulos };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limpiarTemporizador = () => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
  };

  const terminarSesion = useCallback(async (aviso: string | null) => {
    limpiarTemporizador();
    await borrarSesion();
    setEstado({ tipo: 'sinSesion', aviso });
  }, []);

  // Cierra la sesión sola cuando el token vence.
  const programarExpiracion = useCallback(
    (expiraEn: number) => {
      limpiarTemporizador();
      const restante = expiraEn - Date.now();
      // setTimeout no admite más de ~24 días; el token dura minutos u horas.
      temporizador.current = setTimeout(
        () => terminarSesion('Tu sesión expiró. Vuelve a iniciar sesión.'),
        Math.max(0, Math.min(restante, 2_147_000_000)),
      );
    },
    [terminarSesion],
  );

  // Si cualquier petición con token regresa 401, la sesión ya no sirve.
  useEffect(() => {
    registrarAlNoAutorizado(() => {
      terminarSesion('Tu sesión expiró. Vuelve a iniciar sesión.');
    });
    return () => registrarAlNoAutorizado(null);
  }, [terminarSesion]);

  // Al abrir la app, recupera la sesión guardada si sigue vigente.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      const guardada = await leerSesion();
      if (!guardada || guardada.expiraEn <= Date.now()) {
        await borrarSesion();
        if (!cancelado) setEstado({ tipo: 'sinSesion', aviso: null });
        return;
      }
      try {
        const perfil = await cargarPerfil(guardada.token);
        if (cancelado) return;
        setEstado({ tipo: 'conSesion', token: guardada.token, ...perfil });
        programarExpiracion(guardada.expiraEn);
      } catch {
        await borrarSesion();
        if (!cancelado) setEstado({ tipo: 'sinSesion', aviso: null });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [programarExpiracion]);

  useEffect(() => limpiarTemporizador, []);

  const iniciarSesion = useCallback(
    async (identificador: string, password: string) => {
      const respuesta = await api<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: { identificador, password },
      });
      const expiraEn = Date.now() + respuesta.expiraEnSegundos * 1000;
      const perfil = await cargarPerfil(respuesta.token);
      await guardarSesion({ token: respuesta.token, expiraEn });
      setEstado({ tipo: 'conSesion', token: respuesta.token, ...perfil });
      programarExpiracion(expiraEn);
    },
    [programarExpiracion],
  );

  const cerrarSesion = useCallback(async () => {
    if (estado.tipo === 'conSesion') {
      try {
        await api('/api/auth/logout', { method: 'POST', token: estado.token });
      } catch {
        // Aunque falle la red, la sesión se cierra en este dispositivo.
      }
    }
    await terminarSesion(null);
  }, [estado, terminarSesion]);

  const valor = useMemo(
    () => ({ estado, iniciarSesion, cerrarSesion }),
    [estado, iniciarSesion, cerrarSesion],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValor {
  const valor = useContext(AuthContext);
  if (!valor) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return valor;
}

/** Atajo para pantallas que solo se muestran con sesión iniciada. */
export function useSesion() {
  const { estado, cerrarSesion } = useAuth();
  if (estado.tipo !== 'conSesion') {
    throw new Error('useSesion requiere una sesión iniciada.');
  }
  return { ...estado, cerrarSesion };
}
