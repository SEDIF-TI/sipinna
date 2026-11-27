import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { ApiError } from '../../api/client';
import { isoADmy, Periodo, periodosApi } from '../../api/proespinna';
import { useSesion } from '../../auth/AuthContext';
import { Aviso, Boton, Campo, Dialogo, Opciones, Pastilla } from '../../components/form';
import Tabla, { Celda, Columna } from '../../components/Tabla';
import { Encabezado, EstadoVacio } from '../../components/ui';
import { colors } from '../../theme';

const MESES = ['enero a marzo', 'abril a junio', 'julio a septiembre', 'octubre a diciembre'];

// Solo la Secretaría Ejecutiva (superadmin) abre y cierra trimestres de captura.
export default function PeriodosScreen() {
  const { token } = useSesion();
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [cerrar, setCerrar] = useState<Periodo | null>(null);
  const [cambiando, setCambiando] = useState<number | null>(null);

  const cargar = useCallback(
    () =>
      periodosApi
        .listar(token)
        .then((p) => {
          setPeriodos(p);
          setError(null);
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar los periodos.'))
        .finally(() => setCargando(false)),
    [token],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiarEstado = async (p: Periodo, abierto: boolean) => {
    setCambiando(p.id);
    setExito(null);
    try {
      await periodosApi.estado(token, p.id, abierto);
      setCerrar(null);
      setExito(abierto ? `Se abrió ${p.etiqueta}.` : `Se cerró ${p.etiqueta}.`);
      await cargar();
    } catch (e) {
      setCerrar(null);
      setError(e instanceof Error ? e.message : 'No se pudo cambiar el periodo.');
    } finally {
      setCambiando(null);
    }
  };

  const abiertos = periodos.filter((p) => p.abierto);

  const columnas: Columna<Periodo>[] = [
    { titulo: 'Periodo', peso: 2.5, render: (p) => <Celda fuerte>{p.etiqueta}</Celda> },
    {
      titulo: 'Fechas',
      peso: 3,
      render: (p) => (
        <Celda tenue>
          {isoADmy(p.fechaInicio)} al {isoADmy(p.fechaFin)}
        </Celda>
      ),
    },
    {
      titulo: 'Estado',
      peso: 1.6,
      render: (p) => <Pastilla texto={p.abierto ? 'Abierto' : 'Cerrado'} tono={p.abierto ? 'verde' : 'gris'} />,
    },
    {
      titulo: 'Acciones',
      peso: 2,
      alinear: 'derecha',
      render: (p) =>
        p.abierto ? (
          <Boton compacto variante="peligro" texto="Cerrar" onPress={() => setCerrar(p)} />
        ) : (
          <Boton
            compacto
            variante="exito"
            texto="Abrir"
            cargando={cambiando === p.id}
            onPress={() => cambiarEstado(p, true)}
          />
        ),
    },
  ];

  return (
    <>
      <Encabezado
        titulo="Periodos de captura"
        subtitulo="Las secretarías solo pueden capturar y enviar en los trimestres abiertos."
        accion={<Boton texto="Nuevo periodo" icono="add" onPress={() => { setExito(null); setCreando(true); }} />}
      />

      {!cargando ? (
        abiertos.length ? (
          <Aviso tono="exito" texto={`Abierto para captura: ${abiertos.map((p) => p.etiqueta).join(', ')}.`} />
        ) : (
          <Aviso texto="No hay ningún trimestre abierto: nadie puede capturar en este momento." />
        )
      ) : null}
      {exito ? <Aviso tono="exito" texto={exito} /> : null}
      {error ? <Aviso tono="error" texto={error} /> : null}

      {cargando ? (
        <ActivityIndicator style={styles.cargando} color={colors.primary} />
      ) : (
        <Tabla
          columnas={columnas}
          filas={periodos}
          clave={(p) => p.id}
          anchoMinimo={640}
          atenuar={(p) => !p.abierto}
          vacio={
            <EstadoVacio
              icono="calendar-outline"
              titulo="Aún no hay periodos"
              texto="Crea el primer trimestre con «Nuevo periodo» para que las secretarías puedan capturar."
            />
          }
        />
      )}

      {creando ? (
        <FormularioPeriodo
          onCerrar={() => setCreando(false)}
          onCreado={async (p) => {
            setCreando(false);
            setExito(`Se creó ${p.etiqueta}${p.abierto ? ' y quedó abierto' : ' (cerrado)'}.`);
            await cargar();
          }}
        />
      ) : null}

      <Dialogo
        visible={!!cerrar}
        titulo={cerrar ? `¿Cerrar ${cerrar.etiqueta}?` : ''}
        ancho={440}
        onCerrar={() => setCerrar(null)}
        pie={
          <>
            <Boton variante="secundario" texto="Cancelar" onPress={() => setCerrar(null)} />
            <Boton
              variante="peligro"
              texto="Cerrar periodo"
              cargando={!!cerrar && cambiando === cerrar.id}
              onPress={() => cerrar && cambiarEstado(cerrar, false)}
            />
          </>
        }
      >
        <Text style={styles.texto}>
          Las secretarías ya no podrán crear, editar ni enviar registros de este trimestre. Puedes volver a abrirlo
          cuando quieras.
        </Text>
      </Dialogo>
    </>
  );
}

function FormularioPeriodo({ onCerrar, onCreado }: { onCerrar: () => void; onCreado: (p: Periodo) => void }) {
  const { token } = useSesion();
  const hoy = new Date();
  const [anio, setAnio] = useState(String(hoy.getFullYear()));
  const [trimestre, setTrimestre] = useState<number>(Math.floor(hoy.getMonth() / 3) + 1);
  const [abierto, setAbierto] = useState<'si' | 'no'>('si');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    const a = parseInt(anio, 10);
    if (!Number.isInteger(a) || a < 2020 || a > 2100) {
      setErrores({ anio: 'Escribe un año entre 2020 y 2100.' });
      return;
    }
    setErrores({});
    setErrorGeneral(null);
    setGuardando(true);
    try {
      const p = await periodosApi.crear(token, { anio: a, trimestre, abierto: abierto === 'si' });
      onCreado(p);
    } catch (e) {
      if (e instanceof ApiError && e.detalles) setErrores(e.detalles);
      else setErrorGeneral(e instanceof Error ? e.message : 'No se pudo crear el periodo.');
      setGuardando(false);
    }
  };

  return (
    <Dialogo
      visible
      titulo="Nuevo periodo"
      ancho={480}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" texto="Cancelar" onPress={onCerrar} />
          <Boton texto="Crear periodo" cargando={guardando} onPress={guardar} />
        </>
      }
    >
      <Campo
        etiqueta="Año *"
        value={anio}
        onChangeText={(t) => setAnio(t.replace(/\D/g, ''))}
        keyboardType="number-pad"
        maxLength={4}
        error={errores.anio}
        style={styles.anio}
      />
      <Opciones<number>
        etiqueta="Trimestre *"
        valor={trimestre}
        onCambiar={setTrimestre}
        error={errores.trimestre}
        ayuda={`De ${MESES[trimestre - 1]}.`}
        opciones={[1, 2, 3, 4].map((t) => ({ valor: t, texto: `Trimestre ${t}` }))}
      />
      <Opciones<'si' | 'no'>
        etiqueta="¿Abrirlo para captura?"
        valor={abierto}
        onCambiar={setAbierto}
        opciones={[
          { valor: 'si', texto: 'Sí, abrirlo ya' },
          { valor: 'no', texto: 'No, dejarlo cerrado' },
        ]}
      />
      {errorGeneral ? <Aviso tono="error" texto={errorGeneral} /> : null}
    </Dialogo>
  );
}

const styles = StyleSheet.create({
  cargando: { paddingVertical: 48 },
  texto: { fontSize: 15, lineHeight: 23, color: colors.textMuted },
  anio: { maxWidth: 140 },
});
