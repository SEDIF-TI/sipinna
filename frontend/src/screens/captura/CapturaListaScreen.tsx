import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { formatearFecha } from '../../api/admin';
import { ESTATUS, Estatus, isoADmy, Periodo, proespinnaApi, Registro } from '../../api/proespinna';
import { useSesion } from '../../auth/AuthContext';
import { ROLES } from '../../auth/types';
import { Aviso, Boton, Dialogo, Opciones } from '../../components/form';
import Tabla, { Celda, Columna } from '../../components/Tabla';
import { Encabezado, EstadoVacio } from '../../components/ui';
import { colors } from '../../theme';

type Props = {
  onNuevo: () => void;
  onAbrir: (id: number) => void;
  mensaje?: string | null;
};

type Filtro = 'TODOS' | Estatus;

export default function CapturaListaScreen({ onNuevo, onAbrir, mensaje }: Props) {
  const { token, usuario } = useSesion();
  // Sin secretaría el backend rechaza la captura: no se piden los registros.
  const sinSecretaria = !usuario.secretaria;
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [cargando, setCargando] = useState(!sinSecretaria);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(mensaje ?? null);
  const [filtro, setFiltro] = useState<Filtro>('TODOS');
  const [periodoId, setPeriodoId] = useState<number | 0>(0);
  const [eliminar, setEliminar] = useState<Registro | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const cargar = useCallback(
    () =>
      Promise.all([proespinnaApi.misRegistros(token), proespinnaApi.periodosAbiertos(token)])
        .then(([r, p]) => {
          setRegistros(r);
          setPeriodos(p);
          setError(null);
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar los registros.'))
        .finally(() => setCargando(false)),
    [token],
  );

  useEffect(() => {
    if (!sinSecretaria) cargar();
  }, [cargar, sinSecretaria]);

  // Periodos que aparecen en los registros (abiertos o no) para el filtro.
  const periodosFiltro = useMemo(() => {
    const m = new Map<number, string>();
    registros.forEach((r) => m.set(r.periodo.id, r.periodo.etiqueta));
    return [...m.entries()].map(([valor, texto]) => ({ valor, texto }));
  }, [registros]);

  const visibles = registros.filter(
    (r) => (filtro === 'TODOS' || r.estatus === filtro) && (!periodoId || r.periodo.id === periodoId),
  );

  const confirmarEliminar = async () => {
    if (!eliminar) return;
    setEliminando(true);
    try {
      await proespinnaApi.eliminar(token, eliminar.id);
      setExito('Se eliminó el borrador.');
      setEliminar(null);
      await cargar();
    } catch (e) {
      setEliminar(null);
      setError(e instanceof Error ? e.message : 'No se pudo eliminar.');
    } finally {
      setEliminando(false);
    }
  };

  const columnas: Columna<Registro>[] = [
    {
      titulo: 'Programa o actividad',
      peso: 4,
      render: (r) => (
        <View style={styles.dosLineas}>
          <Celda fuerte>{r.nombreActividad}</Celda>
          <Celda tenue>
            {r.fechaEnvio
              ? `Enviado ${formatearFecha(r.fechaEnvio)}`
              : `Actualizado ${formatearFecha(r.fechaActualizacion ?? r.fechaCreacion)}`}
          </Celda>
        </View>
      ),
    },
    { titulo: 'Estrategia', peso: 1.2, render: (r) => <Celda>{r.estrategia.clave}</Celda> },
    { titulo: 'Periodo', peso: 2, render: (r) => <Celda>{r.periodo.etiqueta}</Celda> },
    { titulo: 'NNA', peso: 1, alinear: 'derecha', render: (r) => <Celda>{r.totalNna}</Celda> },
    {
      titulo: 'Estatus',
      peso: 1.6,
      render: (r) => (
        <View style={[styles.pastilla, { backgroundColor: ESTATUS[r.estatus].fondo }]}>
          <Text style={[styles.pastillaTexto, { color: ESTATUS[r.estatus].color }]}>{ESTATUS[r.estatus].texto}</Text>
        </View>
      ),
    },
    {
      titulo: 'Acciones',
      peso: 2.6,
      alinear: 'derecha',
      render: (r) => (
        <View style={styles.acciones}>
          <Boton
            compacto
            variante="secundario"
            texto={r.estatus === 'OBSERVADO' ? 'Corregir' : r.estatus === 'BORRADOR' ? 'Continuar' : 'Ver'}
            onPress={() => onAbrir(r.id)}
          />
          {r.estatus === 'BORRADOR' ? (
            <Boton compacto variante="peligro" texto="Eliminar" onPress={() => setEliminar(r)} />
          ) : null}
        </View>
      ),
    },
  ];

  if (sinSecretaria) {
    return (
      <>
        <Encabezado
          titulo="Captura PROESPINNA"
          subtitulo="Acciones de cada secretaría a favor de niñas, niños y adolescentes, por trimestre."
        />
        <Aviso
          texto={
            usuario.rol === ROLES.SUPERADMINISTRADOR
              ? 'La captura la hace el capturista de cada secretaría. Tu cuenta de superadministrador no tiene una secretaría asignada, por eso aquí no puedes registrar acciones.'
              : 'Tu cuenta no tiene una secretaría asignada. Pide al administrador que te asigne una para poder capturar.'
          }
        />
      </>
    );
  }

  return (
    <>
      <Encabezado
        titulo="Captura PROESPINNA"
        subtitulo="Acciones de tu secretaría a favor de niñas, niños y adolescentes, por trimestre."
        accion={
          usuario.secretaria && periodos.length > 0 ? (
            <Boton texto="Nuevo registro" icono="add" onPress={onNuevo} />
          ) : null
        }
      />

      {!cargando ? (
        periodos.length > 0 ? (
          <Aviso
            tono="exito"
            texto={`Periodo abierto: ${periodos.map((p) => `${p.etiqueta} (del ${isoADmy(p.fechaInicio)} al ${isoADmy(p.fechaFin)})`).join(' · ')}`}
          />
        ) : (
          <Aviso texto="No hay ningún periodo de captura abierto. Cuando la Secretaría Ejecutiva abra un trimestre podrás registrar acciones." />
        )
      ) : null}
      {exito ? <Aviso tono="exito" texto={exito} /> : null}
      {error ? <Aviso tono="error" texto={error} /> : null}

      <View style={styles.filtros}>
        <Opciones<Filtro>
          etiqueta="Estatus"
          valor={filtro}
          onCambiar={setFiltro}
          opciones={[
            { valor: 'TODOS', texto: 'Todos' },
            ...(Object.keys(ESTATUS) as Estatus[]).map((e) => ({ valor: e, texto: ESTATUS[e].texto })),
          ]}
        />
        {periodosFiltro.length > 1 ? (
          <Opciones<number>
            etiqueta="Periodo"
            valor={periodoId}
            onCambiar={setPeriodoId}
            opciones={[{ valor: 0, texto: 'Todos' }, ...periodosFiltro]}
          />
        ) : null}
      </View>

      {cargando ? (
        <ActivityIndicator style={styles.cargando} color={colors.primary} />
      ) : (
        <Tabla
          columnas={columnas}
          filas={visibles}
          clave={(r) => r.id}
          anchoMinimo={900}
          vacio={
            <EstadoVacio
              icono="create-outline"
              titulo={registros.length ? 'Sin resultados' : 'Aún no tienes registros'}
              texto={
                registros.length
                  ? 'Ningún registro coincide con los filtros.'
                  : 'Usa «Nuevo registro» para capturar la primera acción de tu secretaría.'
              }
            />
          }
        />
      )}
      <Text style={styles.nota}>
        Solo puedes editar los registros en Borrador u Observado, y eliminar los que están en Borrador.
      </Text>

      <Dialogo
        visible={!!eliminar}
        titulo="¿Eliminar este borrador?"
        ancho={440}
        onCerrar={() => setEliminar(null)}
        pie={
          <>
            <Boton variante="secundario" texto="Cancelar" onPress={() => setEliminar(null)} />
            <Boton variante="peligro" texto="Eliminar" cargando={eliminando} onPress={confirmarEliminar} />
          </>
        }
      >
        <Text style={styles.texto}>
          Se borrará «{eliminar?.nombreActividad}» y lo que hayas capturado. Esta acción no se puede deshacer.
        </Text>
      </Dialogo>
    </>
  );
}

const styles = StyleSheet.create({
  dosLineas: { gap: 2 },
  acciones: { flexDirection: 'row', gap: 8 },
  pastilla: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  pastillaTexto: { fontSize: 12, fontWeight: '600' },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  cargando: { paddingVertical: 48 },
  nota: { fontSize: 13, color: colors.textMuted },
  texto: { fontSize: 15, lineHeight: 23, color: colors.textMuted },
});
