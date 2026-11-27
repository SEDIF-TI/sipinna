import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { esCapturista } from '../auth/types';
import AppLayout from '../components/AppLayout';
import InicioAdminScreen from '../screens/InicioAdminScreen';
import InicioCapturistaScreen from '../screens/InicioCapturistaScreen';
import LoginScreen from '../screens/LoginScreen';
import ModuloScreen from '../screens/ModuloScreen';
import RecuperarScreen from '../screens/RecuperarScreen';
import { colors } from '../theme';
import type { RutaPrivada } from './rutas';

// Navegación sencilla por estado. Cuando haya más pantallas se puede
// cambiar por React Navigation o Expo Router.
export default function AppNavigator() {
  const { estado } = useAuth();
  const [publica, setPublica] = useState<'login' | 'recuperar'>('login');
  const [ruta, setRuta] = useState<RutaPrivada>('inicio');

  // Cada vez que cambia la sesión se vuelve al inicio / login.
  useEffect(() => {
    setRuta('inicio');
    setPublica('login');
  }, [estado.tipo]);

  if (estado.tipo === 'cargando') {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (estado.tipo === 'sinSesion') {
    return publica === 'recuperar' ? (
      <RecuperarScreen onVolver={() => setPublica('login')} />
    ) : (
      <LoginScreen onForgotPassword={() => setPublica('recuperar')} />
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
