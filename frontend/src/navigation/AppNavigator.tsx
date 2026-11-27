import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { esCapturista } from '../auth/types';
import AppLayout from '../components/AppLayout';
import InicioAdminScreen from '../screens/InicioAdminScreen';
import InicioCapturistaScreen from '../screens/InicioCapturistaScreen';
import LoginScreen from '../screens/LoginScreen';
import ModuloScreen from '../screens/ModuloScreen';
import RecuperarScreen from '../screens/RecuperarScreen';
import RestablecerScreen from '../screens/RestablecerScreen';
import UsuariosSecretariasScreen from '../screens/admin/UsuariosSecretariasScreen';
import CapturaScreen, { CapturaInicial } from '../screens/captura/CapturaScreen';
import { colors } from '../theme';
import { leerTokenRestablecer, limpiarUrl } from './enlaces';
import { RutaPrivada, rutasDelUsuario } from './rutas';
import PeriodosScreen from '../screens/admin/PeriodosScreen';

type Publica = { tipo: 'login' } | { tipo: 'recuperar' } | { tipo: 'restablecer'; token: string };

function publicaInicial(): Publica {
  const token = leerTokenRestablecer();
  return token ? { tipo: 'restablecer', token } : { tipo: 'login' };
}

// Navegación sencilla por estado. Cuando haya más pantallas se puede
// cambiar por Expo Router.
export default function AppNavigator() {
  const { estado } = useAuth();
  const [publica, setPublica] = useState<Publica>(publicaInicial);
  const [ruta, setRuta] = useState<RutaPrivada>('inicio');
  // Con qué vista abre el módulo Captura (lista, formulario nuevo o un registro).
  const [captura, setCaptura] = useState<{ inicial: CapturaInicial; n: number }>({ inicial: { tipo: 'lista' }, n: 0 });
  const tipoAnterior = useRef(estado.tipo);

  const navegar = (r: RutaPrivada) => {
    if (r === 'captura') setCaptura((c) => ({ inicial: { tipo: 'lista' }, n: c.n + 1 }));
    setRuta(r);
  };
  const abrirCaptura = (inicial: CapturaInicial) => {
    setCaptura((c) => ({ inicial, n: c.n + 1 }));
    setRuta('captura');
  };

  // Al iniciar o cerrar sesión se vuelve al inicio / login.
  // (No al terminar de cargar, para no perder el enlace de restablecer.)
  useEffect(() => {
    const anterior = tipoAnterior.current;
    tipoAnterior.current = estado.tipo;
    if (anterior === 'cargando') return;
    setRuta('inicio');
    setPublica({ tipo: 'login' });
  }, [estado.tipo]);

  const irALogin = () => {
    limpiarUrl();
    setPublica({ tipo: 'login' });
  };

  if (estado.tipo === 'cargando') {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // El enlace del correo se atiende aunque haya una sesión abierta.
  if (publica.tipo === 'restablecer') {
    return (
      <RestablecerScreen
        token={publica.token}
        onIrALogin={irALogin}
        onPedirOtroEnlace={() => {
          limpiarUrl();
          setPublica({ tipo: 'recuperar' });
        }}
      />
    );
  }

  if (estado.tipo === 'sinSesion') {
    return publica.tipo === 'recuperar' ? (
      <RecuperarScreen onVolver={irALogin} />
    ) : (
      <LoginScreen onForgotPassword={() => setPublica({ tipo: 'recuperar' })} />
    );
  }

  // Si el módulo ya no está en el menú del usuario, regresa al inicio.
  const rutaValida: RutaPrivada = rutasDelUsuario(estado.modulos, estado.usuario.rol).includes(ruta)
    ? ruta
    : 'inicio';

  return (
    <AppLayout ruta={rutaValida} onNavegar={navegar}>
      {rutaValida === 'inicio' ? (
        esCapturista(estado.usuario.rol) ? (
          <InicioCapturistaScreen onAbrirCaptura={abrirCaptura} />
        ) : (
          <InicioAdminScreen onNavegar={navegar} />
        )
      ) : rutaValida === 'usuarios' ? (
        <UsuariosSecretariasScreen />
      ) : rutaValida === 'captura' ? (
        <CapturaScreen key={captura.n} inicial={captura.inicial} />
      ) : rutaValida === 'periodos' ? (
        <PeriodosScreen />
      ) : (
        <ModuloScreen key={rutaValida} modulo={rutaValida} />
      )}
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  cargando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
