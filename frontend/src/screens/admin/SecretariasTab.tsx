import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { adminApi, Secretaria } from '../../api/admin';
import { ApiError } from '../../api/client';
import { useSesion } from '../../auth/AuthContext';
import { Aviso, Boton, Campo, Dialogo, Opciones, Pastilla } from '../../components/form';
import Tabla, { Celda, Columna } from '../../components/Tabla';
import { EstadoVacio } from '../../components/ui';
import { colors } from '../../theme';

type Modal =
  | { tipo: 'nueva' }
  | { tipo: 'editar'; secretaria: Secretaria }
  | { tipo: 'desactivar'; secretaria: Secretaria }
  | null;

type FiltroAsignacion = 'todas' | 'con' | 'sin';
type FiltroEstado = 'todas' | 'activas' | 'inactivas';

export default function SecretariasTab() {
  const { token } = useSesion();
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [buscar, setBuscar] = useState('');
  const [filtroAsignacion, setFiltroAsignacion] = useState<FiltroAsignacion>('todas');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todas');
  const [modal, setModal] = useState<Modal>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null);

  const cargar = useCallback(
    () =>
      adminApi
        .secretarias(token)
        .then((s) => {
          setSecretarias(s);
          setError(null);
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar la lista.'))
        .finally(() => setCargando(false)),
    [token],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return secretarias.filter(
      (s) =>
        (!q || s.nombre.toLowerCase().includes(q) || s.siglas.toLowerCase().includes(q)) &&
        (filtroAsignacion === 'todas' || (filtroAsignacion === 'con') === !!s.usuarioAsignado) &&
        (filtroEstado === 'todas' || (filtroEstado === 'activas') === s.activo),
    );
  }, [secretarias, buscar, filtroAsignacion, filtroEstado]);

  const terminado = async (mensaje: string) => {
    setModal(null);
    setExito(mensaje);
    await cargar();
  };

  const cambiarEstado = async (s: Secretaria, activo: boolean) => {
    setCambiandoEstado(s.id);
    setExito(null);
    try {
      await adminApi.estadoSecretaria(token, s.id, activo);
      await terminado(activo ? `Se activó ${s.nombre}.` : `Se desactivó ${s.nombre}.`);
    } catch (e) {
      setModal(null);
      setError(e instanceof Error ? e.message : 'No se pudo cambiar el estado.');
    } finally {
      setCambiandoEstado(null);
    }
  };

  const columnas: Columna<Secretaria>[] = [
    { titulo: 'Secretaría', peso: 4, render: (s) => <Celda fuerte>{s.nombre}</Celda> },
    { titulo: 'Siglas', peso: 1.5, render: (s) => <Celda>{s.siglas}</Celda> },
    {
      titulo: 'Capturista asignado',
      peso: 2.5,
      render: (s) =>
        s.usuarioAsignado ? (
          <Celda>{s.usuarioAsignado}</Celda>
        ) : s.activo ? (
          <Pastilla texto="Sin asignar" tono="ambar" />
        ) : (
          <Celda tenue>—</Celda>
        ),
    },
    {
      titulo: 'Estado',
      peso: 1.5,
      render: (s) => <Pastilla texto={s.activo ? 'Activa' : 'Inactiva'} tono={s.activo ? 'verde' : 'gris'} />,
    },
    {
      titulo: 'Acciones',
      peso: 2.6,
      alinear: 'derecha',
      render: (s) => (
        <View style={styles.acciones}>
          {s.activo ? (
            <>
              <Boton compacto variante="secundario" texto="Editar" onPress={() => setModal({ tipo: 'editar', secretaria: s })} />
              <Boton compacto variante="peligro" texto="Desactivar" onPress={() => setModal({ tipo: 'desactivar', secretaria: s })} />
            </>
          ) : (
            <Boton
              compacto
              variante="exito"
              texto="Activar"
              cargando={cambiandoEstado === s.id}
              onPress={() => cambiarEstado(s, true)}
            />
          )}
        </View>
      ),
    },
  ];

  const desactivando = modal?.tipo === 'desactivar' ? modal.secretaria : null;

  return (
    <View style={styles.contenedor}>
      <View style={styles.barra}>
        <View style={styles.buscar}>
          <Campo etiqueta="Buscar" placeholder="Nombre o siglas" value={buscar} onChangeText={setBuscar} />
        </View>
        <Boton texto="Nueva secretaría" icono="add" onPress={() => { setExito(null); setModal({ tipo: 'nueva' }); }} />
      </View>
      <View style={styles.filtros}>
        <Opciones<FiltroAsignacion>
          etiqueta="Capturista"
          valor={filtroAsignacion}
          onCambiar={setFiltroAsignacion}
          opciones={[
            { valor: 'todas', texto: 'Todas' },
            { valor: 'con', texto: 'Con capturista' },
            { valor: 'sin', texto: 'Sin asignar' },
          ]}
        />
        <Opciones<FiltroEstado>
          etiqueta="Estado"
          valor={filtroEstado}
          onCambiar={setFiltroEstado}
          opciones={[
            { valor: 'todas', texto: 'Todas' },
            { valor: 'activas', texto: 'Activas' },
            { valor: 'inactivas', texto: 'Inactivas' },
          ]}
        />
      </View>

      {exito ? <Aviso tono="exito" texto={exito} /> : null}
      {error ? <Aviso tono="error" texto={error} /> : null}

      {cargando ? (
        <ActivityIndicator style={styles.cargando} color={colors.primary} />
      ) : (
        <Tabla
          columnas={columnas}
          filas={visibles}
          clave={(s) => s.id}
          anchoMinimo={780}
          atenuar={(s) => !s.activo}
          vacio={
            <EstadoVacio icono="business-outline" titulo="Sin resultados" texto="Ninguna secretaría coincide con la búsqueda o los filtros." />
          }
        />
      )}
      <Text style={styles.nota}>Una secretaría inactiva no se puede asignar a un capturista nuevo.</Text>

      {modal?.tipo === 'nueva' || modal?.tipo === 'editar' ? (
        <FormularioSecretaria
          secretaria={modal.tipo === 'editar' ? modal.secretaria : null}
          onCerrar={() => setModal(null)}
          onGuardado={terminado}
        />
      ) : null}

      <Dialogo
        visible={!!desactivando}
        titulo={desactivando ? `¿Desactivar ${desactivando.nombre}?` : ''}
        ancho={440}
        onCerrar={() => setModal(null)}
        pie={
          <>
            <Boton variante="secundario" texto="Cancelar" onPress={() => setModal(null)} />
            <Boton
              variante="peligro"
              texto="Desactivar"
              cargando={!!desactivando && cambiandoEstado === desactivando.id}
              onPress={() => desactivando && cambiarEstado(desactivando, false)}
            />
          </>
        }
      >
        <Text style={styles.texto}>
          Ya no se podrá asignar a capturistas nuevos.
          {desactivando?.usuarioAsignado
            ? ` Su capturista actual (${desactivando.usuarioAsignado}) sigue asignado.`
            : ''}{' '}
          Puedes volver a activarla cuando quieras.
        </Text>
      </Dialogo>
    </View>
  );
}

function FormularioSecretaria({
  secretaria,
  onCerrar,
  onGuardado,
}: {
  secretaria: Secretaria | null;
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}) {
  const { token } = useSesion();
  const nueva = secretaria === null;
  const [nombre, setNombre] = useState(secretaria?.nombre ?? '');
  const [siglas, setSiglas] = useState(secretaria?.siglas ?? '');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    const e: Record<string, string> = {};
    const datos = { nombre: nombre.trim(), siglas: siglas.trim().toUpperCase() };
    if (!datos.nombre || datos.nombre.length > 150) e.nombre = 'Escribe el nombre (máximo 150 caracteres).';
    if (!datos.siglas || datos.siglas.length > 20) e.siglas = 'Escribe las siglas (máximo 20 caracteres).';
    setErrores(e);
    if (Object.keys(e).length) return;

    setGuardando(true);
    setErrorGeneral(null);
    try {
      if (nueva) {
        const s = await adminApi.crearSecretaria(token, datos);
        onGuardado(`Se creó ${s.nombre}.`);
      } else {
        const s = await adminApi.editarSecretaria(token, secretaria.id, datos);
        onGuardado(`Se guardaron los cambios de ${s.nombre}.`);
      }
    } catch (err) {
      if (err instanceof ApiError && err.detalles) setErrores(err.detalles);
      else setErrorGeneral(err instanceof Error ? err.message : 'No se pudo guardar.');
      setGuardando(false);
    }
  };

  return (
    <Dialogo
      visible
      titulo={nueva ? 'Nueva secretaría' : 'Editar secretaría'}
      ancho={480}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" texto="Cancelar" onPress={onCerrar} />
          <Boton texto={nueva ? 'Crear secretaría' : 'Guardar cambios'} cargando={guardando} onPress={guardar} />
        </>
      }
    >
      <Campo
        etiqueta="Nombre *"
        placeholder="ej. Secretaría de Educación"
        value={nombre}
        onChangeText={setNombre}
        maxLength={150}
        error={errores.nombre}
        ayuda="Máximo 150 caracteres. No puede repetirse."
      />
      <Campo
        etiqueta="Siglas *"
        placeholder="ej. SEP"
        value={siglas}
        onChangeText={(t) => setSiglas(t.toUpperCase())}
        autoCapitalize="characters"
        maxLength={20}
        error={errores.siglas}
        ayuda="Máximo 20 caracteres. No pueden repetirse."
        style={styles.siglas}
      />
      {errorGeneral ? <Aviso tono="error" texto={errorGeneral} /> : null}
    </Dialogo>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 20 },
  barra: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16, justifyContent: 'space-between' },
  buscar: { flexGrow: 1, flexBasis: 280, maxWidth: 480 },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  acciones: { flexDirection: 'row', gap: 8 },
  cargando: { paddingVertical: 48 },
  nota: { fontSize: 13, color: colors.textMuted },
  texto: { fontSize: 15, lineHeight: 23, color: colors.textMuted },
  siglas: { maxWidth: 200 },
});
