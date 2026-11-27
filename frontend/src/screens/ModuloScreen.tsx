import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { api, ApiError } from '../api/client';
import { useSesion } from '../auth/AuthContext';
import type { Modulo } from '../auth/types';
import { MODULOS } from '../navigation/rutas';
import { Encabezado, EstadoVacio, Seccion } from '../components/ui';
import { colors } from '../theme';

type Respuesta = { modulo: string; usuario: string; mensaje: string };

// Pantalla provisional de cada módulo: comprueba con el backend que el usuario
// tiene permiso (GET /api/panel/{modulo}) y muestra que está en construcción.
export default function ModuloScreen({ modulo }: { modulo: Modulo }) {
  const { token } = useSesion();
  const [estado, setEstado] = useState<
    { tipo: 'cargando' } | { tipo: 'ok'; titulo: string } | { tipo: 'error'; mensaje: string }
  >({ tipo: 'cargando' });

  useEffect(() => {
    let cancelado = false;
    setEstado({ tipo: 'cargando' });
    api<Respuesta>(`/api/panel/${modulo}`, { token })
      .then((r) => !cancelado && setEstado({ tipo: 'ok', titulo: r.modulo }))
      .catch(
        (e) =>
          !cancelado &&
          setEstado({
            tipo: 'error',
            mensaje: e instanceof ApiError ? e.message : 'No se pudo abrir el módulo.',
          }),
      );
    return () => {
      cancelado = true;
    };
  }, [modulo, token]);

  const titulo = estado.tipo === 'ok' ? estado.titulo : MODULOS[modulo].titulo;

  return (
    <>
      <Encabezado titulo={titulo} />
      <Seccion titulo={MODULOS[modulo].titulo}>
        {estado.tipo === 'cargando' ? (
          <View style={styles.cargando}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : estado.tipo === 'error' ? (
          <EstadoVacio icono="alert-circle-outline" titulo="No se pudo abrir" texto={estado.mensaje} />
        ) : (
          <EstadoVacio
            icono="construct-outline"
            titulo="Módulo en construcción"
            texto="Tienes acceso a este módulo. Su contenido se agregará en las siguientes versiones."
          />
        )}
      </Seccion>
    </>
  );
}

const styles = StyleSheet.create({
  cargando: { paddingVertical: 48, alignItems: 'center' },
});
