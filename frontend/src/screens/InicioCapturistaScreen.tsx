import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatearFecha } from '../api/admin';
import { ESTATUS, Estatus, proespinnaApi, Registro } from '../api/proespinna';
import { useSesion } from '../auth/AuthContext';
import { Aviso } from '../components/form';
import { BotonPrincipal, Encabezado, EstadoVacio, Indicador, Indicadores, Seccion } from '../components/ui';
import type { CapturaInicial } from './captura/CapturaScreen';
import { colors } from '../theme';

type Props = { onAbrirCaptura: (inicial: CapturaInicial) => void };

export default function InicioCapturistaScreen({ onAbrirCaptura }: Props) {
  const { usuario, modulos, token } = useSesion();
  const puedeCapturar = modulos.includes('captura');
  const [registros, setRegistros] = useState<Registro[] | null>(null);
  const [hayPeriodo, setHayPeriodo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!puedeCapturar || !usuario.secretaria) return;
    let cancelado = false;
    Promise.all([proespinnaApi.misRegistros(token), proespinnaApi.periodosAbiertos(token)])
      .then(([r, p]) => {
        if (cancelado) return;
        setRegistros(r);
        setHayPeriodo(p.length > 0);
      })
      .catch((e) => !cancelado && setError(e instanceof Error ? e.message : 'No se pudieron cargar tus registros.'));
    return () => {
      cancelado = true;
    };
  }, [puedeCapturar, token, usuario.secretaria]);

  const contar = (...e: Estatus[]) => registros?.filter((r) => e.includes(r.estatus)).length;
  const observados = contar('OBSERVADO') ?? 0;

  return (
    <>
      <Encabezado
        titulo={`Hola, ${usuario.username}`}
        subtitulo={usuario.secretaria ?? 'Sin secretaría asignada'}
        accion={
          puedeCapturar && usuario.secretaria && hayPeriodo ? (
            <BotonPrincipal texto="Nueva captura" icono="add" onPress={() => onAbrirCaptura({ tipo: 'nuevo' })} />
          ) : null
        }
      />

      {!usuario.secretaria ? (
        <Aviso tono="error" texto="Tu cuenta no tiene una secretaría asignada. Pide al administrador que te asigne una para poder capturar." />
      ) : null}
      {observados > 0 ? (
        <Pressable
          onPress={() => onAbrirCaptura({ tipo: 'lista' })}
          accessibilityRole="button"
          style={styles.alerta}
        >
          <Text style={styles.alertaTitulo}>
            Tienes {observados} {observados === 1 ? 'registro' : 'registros'} con observaciones
          </Text>
          <Text style={styles.alertaTexto}>El administrador pidió correcciones. Revísalos y vuelve a enviarlos.</Text>
        </Pressable>
      ) : null}
      {error ? <Aviso tono="error" texto={error} /> : null}

      <Indicadores>
        <Indicador titulo="Borradores" valor={contar('BORRADOR')} />
        <Indicador titulo="Enviados" valor={contar('ENVIADO', 'EN_REVISION')} color="#1D4ED8" />
        <Indicador titulo="Con observaciones" valor={contar('OBSERVADO')} color="#B3261E" />
        <Indicador titulo="Aprobados" valor={contar('APROBADO')} color="#1E7B34" />
      </Indicadores>

      <Seccion titulo="Mis capturas recientes">
        {usuario.secretaria && !registros && !error ? (
          <ActivityIndicator style={styles.cargando} color={colors.primary} />
        ) : registros && registros.length > 0 ? (
          <View>
            {registros.slice(0, 5).map((r, i) => (
              <Pressable
                key={r.id}
                onPress={() => onAbrirCaptura({ tipo: 'abrir', id: r.id })}
                accessibilityRole="button"
                style={({ pressed }) => [styles.fila, i > 0 && styles.filaBorde, pressed && styles.filaPresionada]}
              >
                <View style={styles.filaTextos}>
                  <Text style={styles.filaTitulo} numberOfLines={1}>
                    {r.nombreActividad}
                  </Text>
                  <Text style={styles.filaSub}>
                    {r.periodo.etiqueta} · Estrategia {r.estrategia.clave} ·{' '}
                    {formatearFecha(r.fechaActualizacion ?? r.fechaCreacion)}
                  </Text>
                </View>
                <View style={[styles.pastilla, { backgroundColor: ESTATUS[r.estatus].fondo }]}>
                  <Text style={[styles.pastillaTexto, { color: ESTATUS[r.estatus].color }]}>{ESTATUS[r.estatus].texto}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <EstadoVacio
            icono="create-outline"
            titulo="Aún no tienes capturas"
            texto={
              hayPeriodo
                ? 'Usa «Nueva captura» para registrar la información de tu secretaría.'
                : 'Podrás capturar cuando la Secretaría Ejecutiva abra un periodo.'
            }
          />
        )}
      </Seccion>
    </>
  );
}

const styles = StyleSheet.create({
  cargando: { paddingVertical: 48 },
  alerta: {
    gap: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FDE2E1',
    borderWidth: 1,
    borderColor: '#F6C1BE',
  },
  alertaTitulo: { fontSize: 15, fontWeight: '600', color: '#7F1D1D' },
  alertaTexto: { fontSize: 14, color: '#7F1D1D' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 20 },
  filaBorde: { borderTopWidth: 1, borderTopColor: '#EEEEF2' },
  filaPresionada: { backgroundColor: '#F7F7F9' },
  filaTextos: { flex: 1, gap: 2 },
  filaTitulo: { fontSize: 15, fontWeight: '600', color: colors.text },
  filaSub: { fontSize: 13, color: colors.textMuted },
  pastilla: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  pastillaTexto: { fontSize: 12, fontWeight: '600' },
});
