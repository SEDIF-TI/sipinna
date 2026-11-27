import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { adminApi, EventoAuditoria, formatearFecha } from '../../api/admin';
import { useSesion } from '../../auth/AuthContext';
import { Aviso, Boton, Campo, Opciones } from '../../components/form';
import Tabla, { Celda, Columna } from '../../components/Tabla';
import { EstadoVacio } from '../../components/ui';
import { colors } from '../../theme';

type Categoria = 'todas' | 'sesion' | 'usuarios' | 'secretarias' | 'periodos' | 'registros';
type Tono = { fondo: string; color: string };

const TONOS: Record<'neutro' | 'exito' | 'alerta' | 'peligro' | 'info', Tono> = {
  neutro: { fondo: '#EEEEF2', color: '#45455A' },
  exito: { fondo: '#E6F4EA', color: '#1E7B34' },
  alerta: { fondo: '#FEF3C7', color: '#92400E' },
  peligro: { fondo: '#FDE2E1', color: '#B3261E' },
  info: { fondo: '#E0ECFF', color: '#1D4ED8' },
};

// Acciones que registra AuditoriaService en el backend.
const ACCIONES: Record<string, { texto: string; categoria: Categoria; tono: keyof typeof TONOS }> = {
  LOGIN_EXITOSO: { texto: 'Inicio de sesión', categoria: 'sesion', tono: 'exito' },
  LOGIN_FALLIDO: { texto: 'Inicio de sesión fallido', categoria: 'sesion', tono: 'peligro' },
  LOGOUT: { texto: 'Cierre de sesión', categoria: 'sesion', tono: 'neutro' },
  SOLICITUD_RECUPERACION: { texto: 'Pidió recuperar contraseña', categoria: 'sesion', tono: 'alerta' },
  PASSWORD_RESTABLECIDA: { texto: 'Restableció su contraseña', categoria: 'sesion', tono: 'alerta' },
  USUARIO_CREADO: { texto: 'Usuario creado', categoria: 'usuarios', tono: 'info' },
  USUARIO_EDITADO: { texto: 'Usuario editado', categoria: 'usuarios', tono: 'info' },
  USUARIO_ACTIVADO: { texto: 'Usuario activado', categoria: 'usuarios', tono: 'exito' },
  USUARIO_DESACTIVADO: { texto: 'Usuario desactivado', categoria: 'usuarios', tono: 'peligro' },
  SECRETARIA_CREADA: { texto: 'Secretaría creada', categoria: 'secretarias', tono: 'info' },
  SECRETARIA_EDITADA: { texto: 'Secretaría editada', categoria: 'secretarias', tono: 'info' },
  SECRETARIA_ACTIVADA: { texto: 'Secretaría activada', categoria: 'secretarias', tono: 'exito' },
  SECRETARIA_DESACTIVADA: { texto: 'Secretaría desactivada', categoria: 'secretarias', tono: 'peligro' },
  PERIODO_CREADO: { texto: 'Periodo creado', categoria: 'periodos', tono: 'info' },
  PERIODO_ABIERTO: { texto: 'Periodo abierto', categoria: 'periodos', tono: 'exito' },
  PERIODO_CERRADO: { texto: 'Periodo cerrado', categoria: 'periodos', tono: 'peligro' },
  REGISTRO_CREADO: { texto: 'Registro creado', categoria: 'registros', tono: 'info' },
  REGISTRO_EDITADO: { texto: 'Registro editado', categoria: 'registros', tono: 'info' },
  REGISTRO_ENVIADO: { texto: 'Registro enviado', categoria: 'registros', tono: 'exito' },
  REGISTRO_ELIMINADO: { texto: 'Registro eliminado', categoria: 'registros', tono: 'peligro' },
};

/** Si el backend agrega una acción nueva, se muestra con su clave tal cual. */
const infoAccion = (a: string) =>
  ACCIONES[a] ?? { texto: a.replace(/_/g, ' ').toLowerCase(), categoria: 'todas' as Categoria, tono: 'neutro' as const };

/** "0:0:0:0:0:0:0:1" (IPv6) o "127.0.0.1" = el mismo equipo donde corre el backend. */
const mostrarIp = (ip: string | null) =>
  !ip ? '—' : ['0:0:0:0:0:0:0:1', '::1', '127.0.0.1'].includes(ip) ? 'localhost' : ip;

export default function AuditoriaTab() {
  const { token } = useSesion();
  const [eventos, setEventos] = useState<EventoAuditoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buscar, setBuscar] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('todas');

  const cargar = useCallback(
    () =>
      adminApi
        .auditoria(token)
        .then((e) => {
          setEventos(e);
          setError(null);
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar la auditoría.'))
        .finally(() => {
          setCargando(false);
          setActualizando(false);
        }),
    [token],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return eventos.filter((e) => {
      const info = infoAccion(e.accion);
      return (
        (categoria === 'todas' || info.categoria === categoria) &&
        (!q ||
          (e.usuario ?? '').toLowerCase().includes(q) ||
          (e.detalle ?? '').toLowerCase().includes(q) ||
          info.texto.toLowerCase().includes(q))
      );
    });
  }, [eventos, buscar, categoria]);

  const fallidos = eventos.filter((e) => e.accion === 'LOGIN_FALLIDO').length;

  const columnas: Columna<EventoAuditoria>[] = [
    { titulo: 'Fecha', peso: 2, render: (e) => <Celda tenue>{formatearFecha(e.fecha)}</Celda> },
    { titulo: 'Usuario', peso: 2, render: (e) => <Celda fuerte>{e.usuario ?? '—'}</Celda> },
    {
      titulo: 'Acción',
      peso: 2.6,
      render: (e) => {
        const info = infoAccion(e.accion);
        const t = TONOS[info.tono];
        return (
          <View style={[styles.pastilla, { backgroundColor: t.fondo }]}>
            <Text style={[styles.pastillaTexto, { color: t.color }]}>{info.texto}</Text>
          </View>
        );
      },
    },
    { titulo: 'Detalle', peso: 3.4, render: (e) => <Celda tenue={!e.detalle}>{e.detalle ?? '—'}</Celda> },
    { titulo: 'IP', peso: 1.6, render: (e) => <Celda tenue>{mostrarIp(e.ip)}</Celda> },
  ];

  return (
    <View style={styles.contenedor}>
      <View style={styles.barra}>
        <View style={styles.buscar}>
          <Campo etiqueta="Buscar" placeholder="Usuario, acción o detalle" value={buscar} onChangeText={setBuscar} />
        </View>
        <Boton
          variante="secundario"
          texto="Actualizar"
          icono="refresh"
          cargando={actualizando}
          onPress={() => {
            setActualizando(true);
            cargar();
          }}
        />
      </View>
      <Opciones<Categoria>
        etiqueta="Tipo de acción"
        valor={categoria}
        onCambiar={setCategoria}
        opciones={[
          { valor: 'todas', texto: 'Todas' },
          { valor: 'sesion', texto: 'Sesiones' },
          { valor: 'usuarios', texto: 'Usuarios' },
          { valor: 'secretarias', texto: 'Secretarías' },
          { valor: 'periodos', texto: 'Periodos' },
          { valor: 'registros', texto: 'Registros' },
        ]}
      />

      {fallidos > 0 ? (
        <Aviso
          tono="error"
          texto={`Hay ${fallidos} ${fallidos === 1 ? 'inicio de sesión fallido' : 'inicios de sesión fallidos'} entre las últimas acciones.`}
        />
      ) : null}
      {error ? <Aviso tono="error" texto={error} /> : null}

      {cargando ? (
        <ActivityIndicator style={styles.cargando} color={colors.primary} />
      ) : (
        <Tabla
          columnas={columnas}
          filas={visibles}
          clave={(e) => e.id}
          anchoMinimo={920}
          vacio={
            <EstadoVacio
              icono="document-text-outline"
              titulo={eventos.length ? 'Sin resultados' : 'Aún no hay acciones registradas'}
              texto={eventos.length ? 'Ninguna acción coincide con la búsqueda o el filtro.' : 'Aquí aparecerá lo que hagan los usuarios en SIPINNA.'}
            />
          }
        />
      )}
      <Text style={styles.nota}>Se muestran las últimas 100 acciones, de la más reciente a la más antigua.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 20 },
  barra: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16, justifyContent: 'space-between' },
  buscar: { flexGrow: 1, flexBasis: 280, maxWidth: 480 },
  pastilla: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  pastillaTexto: { fontSize: 12, fontWeight: '600' },
  cargando: { paddingVertical: 48 },
  nota: { fontSize: 13, color: colors.textMuted },
});
