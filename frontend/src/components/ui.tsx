import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

export function Encabezado({
  titulo,
  subtitulo,
  accion,
}: {
  titulo: string;
  subtitulo?: string;
  accion?: ReactNode;
}) {
  return (
    <View style={styles.encabezado}>
      <View style={styles.encabezadoTextos}>
        <Text style={styles.titulo} accessibilityRole="header">
          {titulo}
        </Text>
        {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
      </View>
      {accion}
    </View>
  );
}

export function BotonPrincipal({
  texto,
  icono,
  onPress,
}: {
  texto: string;
  icono?: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.boton, pressed && styles.botonPresionado]}
    >
      {icono ? <Ionicons name={icono} size={18} color={colors.onPrimary} /> : null}
      <Text style={styles.botonTexto}>{texto}</Text>
    </Pressable>
  );
}

/** Tarjeta de resumen. Sin datos del backend muestra un guion. */
export function Indicador({ titulo, valor, color }: { titulo: string; valor?: number; color?: string }) {
  return (
    <View style={styles.indicador}>
      <Text style={styles.indicadorTitulo}>{titulo}</Text>
      <Text style={[styles.indicadorValor, color ? { color } : null]}>{valor ?? '—'}</Text>
    </View>
  );
}

export function Indicadores({ children }: { children: ReactNode }) {
  return <View style={styles.indicadores}>{children}</View>;
}

export function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={styles.seccion}>
      <View style={styles.seccionEncabezado}>
        <Text style={styles.seccionTitulo} accessibilityRole="header">
          {titulo}
        </Text>
      </View>
      {children}
    </View>
  );
}

export function EstadoVacio({
  icono,
  titulo,
  texto,
}: {
  icono: ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  texto: string;
}) {
  return (
    <View style={styles.vacio}>
      <Ionicons name={icono} size={32} color={colors.icon} />
      <Text style={styles.vacioTitulo}>{titulo}</Text>
      <Text style={styles.vacioTexto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 16,
  },
  encabezadoTextos: { gap: 6, flexShrink: 1 },
  titulo: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitulo: { fontSize: 15, color: colors.textMuted },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: radius.control,
    backgroundColor: colors.primary,
  },
  botonPresionado: { backgroundColor: colors.primaryPressed },
  botonTexto: { color: colors.onPrimary, fontSize: 15, fontWeight: '600' },
  indicadores: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  indicador: {
    flexGrow: 1,
    flexBasis: 200,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E4E4EA',
    borderRadius: 12,
    padding: 20,
    gap: 8,
  },
  indicadorTitulo: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  indicadorValor: { fontSize: 32, fontWeight: '700', color: colors.text },
  seccion: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E4E4EA',
    borderRadius: 12,
  },
  seccionEncabezado: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4EA',
  },
  seccionTitulo: { fontSize: 17, fontWeight: '700', color: colors.text },
  vacio: { alignItems: 'center', gap: 8, paddingVertical: 48, paddingHorizontal: 20 },
  vacioTitulo: { fontSize: 16, fontWeight: '600', color: colors.text },
  vacioTexto: { fontSize: 14, color: colors.textMuted, textAlign: 'center', maxWidth: 420 },
});
