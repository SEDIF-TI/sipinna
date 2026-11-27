import { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

const sinContorno = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;

/** Campo de texto con etiqueta, ayuda y error. */
export function Campo({
  etiqueta,
  ayuda,
  error,
  deshabilitado,
  ...input
}: {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  deshabilitado?: boolean;
} & TextInputProps) {
  const [enfocado, setEnfocado] = useState(false);
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        {...input}
        accessibilityLabel={etiqueta.replace(' *', '')}
        editable={!deshabilitado}
        placeholderTextColor={colors.placeholder}
        onFocus={(e) => {
          setEnfocado(true);
          input.onFocus?.(e);
        }}
        onBlur={(e) => {
          setEnfocado(false);
          input.onBlur?.(e);
        }}
        style={[
          styles.input,
          enfocado && styles.inputEnfocado,
          !!error && styles.inputError,
          deshabilitado && styles.inputDeshabilitado,
          input.style,
        ]}
      />
      {error ? <Text style={styles.textoError}>{error}</Text> : ayuda ? <Text style={styles.ayuda}>{ayuda}</Text> : null}
    </View>
  );
}

/** Selección de una opción con botones (reemplaza al <select> en móvil y web). */
export function Opciones<T extends string | number>({
  etiqueta,
  opciones,
  valor,
  onCambiar,
  error,
  ayuda,
  deshabilitado,
  vacio,
}: {
  etiqueta: string;
  opciones: { valor: T; texto: string }[];
  valor: T | null;
  onCambiar: (v: T) => void;
  error?: string;
  ayuda?: string;
  deshabilitado?: boolean;
  vacio?: string;
}) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      {opciones.length === 0 && vacio ? <Text style={styles.ayuda}>{vacio}</Text> : null}
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={etiqueta.replace(' *', '')}>
        {opciones.map((o) => {
          const activo = o.valor === valor;
          return (
            <Pressable
              key={String(o.valor)}
              onPress={() => onCambiar(o.valor)}
              disabled={deshabilitado}
              accessibilityRole="radio"
              accessibilityLabel={o.texto}
              accessibilityState={{ checked: activo, disabled: deshabilitado }}
              style={[styles.chip, activo && styles.chipActivo, deshabilitado && styles.chipDeshabilitado]}
            >
              {activo ? <Ionicons name="checkmark" size={16} color={colors.primaryPressed} /> : null}
              <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{o.texto}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.textoError}>{error}</Text> : ayuda ? <Text style={styles.ayuda}>{ayuda}</Text> : null}
    </View>
  );
}

type Variante = 'principal' | 'secundario' | 'peligro' | 'exito';

export function Boton({
  texto,
  onPress,
  variante = 'principal',
  cargando,
  deshabilitado,
  icono,
  compacto,
}: {
  texto: string;
  onPress: () => void;
  variante?: Variante;
  cargando?: boolean;
  deshabilitado?: boolean;
  icono?: React.ComponentProps<typeof Ionicons>['name'];
  compacto?: boolean;
}) {
  const v = VARIANTES[variante];
  return (
    <Pressable
      onPress={onPress}
      disabled={cargando || deshabilitado}
      accessibilityRole="button"
      accessibilityState={{ disabled: cargando || deshabilitado, busy: cargando }}
      style={({ pressed }) => [
        styles.boton,
        compacto && styles.botonCompacto,
        { backgroundColor: pressed ? v.fondoPresionado : v.fondo, borderColor: v.borde },
        (cargando || deshabilitado) && styles.botonDeshabilitado,
      ]}
    >
      {cargando ? (
        <ActivityIndicator size="small" color={v.texto} />
      ) : (
        <>
          {icono ? <Ionicons name={icono} size={18} color={v.texto} /> : null}
          <Text style={[styles.botonTexto, compacto && styles.botonTextoCompacto, { color: v.texto }]}>{texto}</Text>
        </>
      )}
    </Pressable>
  );
}

const VARIANTES: Record<Variante, { fondo: string; fondoPresionado: string; borde: string; texto: string }> = {
  principal: { fondo: colors.primary, fondoPresionado: colors.primaryPressed, borde: colors.primary, texto: colors.onPrimary },
  secundario: { fondo: colors.surface, fondoPresionado: '#F3F3F6', borde: colors.border, texto: colors.label },
  peligro: { fondo: colors.surface, fondoPresionado: '#FDE2E1', borde: '#F1B5B1', texto: '#B3261E' },
  exito: { fondo: colors.surface, fondoPresionado: '#E6F4EA', borde: '#A7D7B4', texto: '#1E7B34' },
};

/** Pastilla de estado (Activo, Inactivo, Sin asignar...). */
export function Pastilla({ texto, tono }: { texto: string; tono: 'verde' | 'gris' | 'ambar' }) {
  const t = { verde: ['#E6F4EA', '#1E7B34'], gris: ['#EEEEF2', '#45455A'], ambar: ['#FEF3C7', '#92400E'] }[tono];
  return (
    <View style={[styles.pastilla, { backgroundColor: t[0] }]}>
      <Text style={[styles.pastillaTexto, { color: t[1] }]}>{texto}</Text>
    </View>
  );
}

/** Ventana modal con encabezado, contenido y botones. */
export function Dialogo({
  visible,
  titulo,
  onCerrar,
  children,
  pie,
  ancho = 520,
}: {
  visible: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  pie: ReactNode;
  ancho?: number;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={styles.fondoModal}>
        <View style={[styles.dialogo, { maxWidth: ancho }]} accessibilityViewIsModal>
          <View style={styles.dialogoEncabezado}>
            <Text style={styles.dialogoTitulo} accessibilityRole="header">
              {titulo}
            </Text>
            <Pressable onPress={onCerrar} accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.cerrar}>
              <Ionicons name="close" size={22} color={colors.icon} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.dialogoCuerpo} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          <View style={styles.dialogoPie}>{pie}</View>
        </View>
      </View>
    </Modal>
  );
}

export function Aviso({ texto, tono = 'info' }: { texto: string; tono?: 'info' | 'error' | 'exito' }) {
  const t = {
    info: { fondo: '#F3F3F6', color: colors.label, icono: 'information-circle-outline' as const },
    error: { fondo: '#FDE2E1', color: '#7F1D1D', icono: 'alert-circle-outline' as const },
    exito: { fondo: '#E6F4EA', color: '#14532D', icono: 'checkmark-circle-outline' as const },
  }[tono];
  return (
    <View style={[styles.aviso, { backgroundColor: t.fondo }]} accessibilityLiveRegion="polite">
      <Ionicons name={t.icono} size={18} color={t.color} />
      <Text style={[styles.avisoTexto, { color: t.color }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  campo: { gap: 6 },
  etiqueta: { fontSize: 13, fontWeight: '600', color: colors.label },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    ...sinContorno,
  },
  inputEnfocado: { borderColor: colors.primary, borderWidth: 2 },
  inputError: { borderColor: '#B3261E' },
  inputDeshabilitado: { backgroundColor: '#F3F3F6', color: colors.textMuted, borderColor: '#E4E4EA' },
  ayuda: { fontSize: 12, color: colors.textMuted },
  textoError: { fontSize: 12, color: '#B3261E' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActivo: { backgroundColor: '#FCE4EC', borderColor: colors.primary },
  chipDeshabilitado: { opacity: 0.55 },
  chipTexto: { fontSize: 14, color: colors.label },
  chipTextoActivo: { color: colors.primaryPressed, fontWeight: '600' },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: radius.control,
    borderWidth: 1,
  },
  botonCompacto: { minHeight: 36, paddingHorizontal: 12 },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { fontSize: 15, fontWeight: '600' },
  botonTextoCompacto: { fontSize: 14 },
  pastilla: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  pastillaTexto: { fontSize: 12, fontWeight: '600' },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(22,22,29,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dialogo: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    shadowColor: '#141428',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  dialogoEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 24,
    paddingRight: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4EA',
  },
  dialogoTitulo: { fontSize: 19, fontWeight: '700', color: colors.text },
  cerrar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  dialogoCuerpo: { padding: 24, gap: 18 },
  dialogoPie: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#E4E4EA',
  },
  aviso: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.control, alignItems: 'flex-start' },
  avisoTexto: { flex: 1, fontSize: 13, lineHeight: 19 },
});
