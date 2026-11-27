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
import { colors } from '../theme';
import { leerTokenRestablecer, limpiarUrl } from './enlaces';
import type { RutaPrivada } from './rutas';

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
  const tipoAnterior = useRef(estado.tipo);

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
  const rutaValida: RutaPrivada =
    ruta === 'inicio' || estado.modulos.includes(ruta) ? ruta : 'inicio';

  return (
    <AppLayout ruta={rutaValida} onNavegar={setRuta}>
      {rutaValida === 'inicio' ? (
        esCapturista(estado.usuario.rol) ? (
          <InicioCapturistaScreen onNavegar={setRuta} />
        ) : (
          <InicioAdminScreen onNavegar={setRuta} />
        )
      ) : rutaValida === 'usuarios' ? (
        <UsuariosSecretariasScreen />
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
