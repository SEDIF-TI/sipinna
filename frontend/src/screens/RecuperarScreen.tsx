import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, ApiError } from '../api/client';
import { colors, radius } from '../theme';

type Props = {
  onVolver: () => void;
};

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/forgot-password. El backend responde lo mismo exista o no
// el correo, para no revelar qué correos están registrados.
export default function RecuperarScreen({ onVolver }: Props) {
  const [correo, setCorreo] = useState('');
  const [enfocado, setEnfocado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const enviar = async () => {
    if (enviando) return;
    const valor = correo.trim();
    if (!CORREO_VALIDO.test(valor)) {
      setError('Escribe un correo electrónico válido.');
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const r = await api<{ mensaje: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: { correo: valor },
      });
      setMensaje(r.mensaje);
    } catch (e) {
      if (e instanceof ApiError && e.detalles) setError(Object.values(e.detalles).join(' '));
      else setError(e instanceof Error ? e.message : 'No se pudo enviar el enlace.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen} style={styles.flex} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        {mensaje ? (
          <>
            <View style={styles.header}>
              <View style={[styles.iconCircle, styles.iconCircleOk]}>
                <Ionicons name="mail-outline" size={30} color="#1E7B34" />
              </View>
              <Text style={styles.title} accessibilityRole="header">
                Revisa tu correo
              </Text>
              <Text style={styles.subtitle} accessibilityLiveRegion="polite">
                {mensaje}
              </Text>
            </View>

            <Pressable
              onPress={onVolver}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            >
              <Text style={styles.buttonText}>Volver a iniciar sesión</Text>
            </Pressable>

            <View style={styles.reenviar}>
              <Text style={styles.reenviarTexto}>¿No te llegó?</Text>
              <Pressable
                onPress={() => setMensaje(null)}
                accessibilityRole="button"
                style={styles.reenviarBoton}
              >
                <Text style={styles.reenviarLink}>Reenviar enlace</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed-outline" size={30} color={colors.link} />
              </View>
              <Text style={styles.title} accessibilityRole="header">
                ¿Olvidaste tu contraseña?
              </Text>
              <Text style={styles.subtitle}>
                Escribe el correo con el que te registraste y te enviaremos un enlace para crear
                una nueva contraseña.
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label} nativeID="label-correo">
                Correo electrónico *
              </Text>
              <TextInput
                accessibilityLabel="Correo electrónico"
                value={correo}
                onChangeText={setCorreo}
                placeholder="ejemplo@correo.gob.mx"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="send"
                onSubmitEditing={enviar}
                onFocus={() => setEnfocado(true)}
                onBlur={() => setEnfocado(false)}
                style={[styles.input, enfocado && styles.inputFocused]}
              />
            </View>

            {error ? (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : null}

            <Pressable
              onPress={enviar}
              disabled={enviando}
              accessibilityRole="button"
              accessibilityState={{ disabled: enviando, busy: enviando }}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                enviando && styles.buttonDisabled,
              ]}
            >
              {enviando ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.buttonText}>Enviar enlace</Text>
              )}
            </Pressable>

            <Pressable onPress={onVolver} accessibilityRole="link" style={styles.volver}>
              <Ionicons name="chevron-back" size={18} color={colors.link} />
              <Text style={styles.link}>Volver a iniciar sesión</Text>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
}

export const estilosTarjeta = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  screen: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 40,
    gap: 20,
    shadowColor: '#141428',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: { alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FCE4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleOk: { backgroundColor: '#E6F4EA' },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, lineHeight: 23, color: colors.textMuted, textAlign: 'center' },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.label },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  inputFocused: { borderColor: colors.primary, borderWidth: 2 },
  error: { color: colors.error, fontSize: 14 },
  button: {
    height: 52,
    borderRadius: radius.control,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { backgroundColor: colors.primaryPressed },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
  volver: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
  },
  link: { color: colors.link, fontSize: 15 },
  reenviar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  reenviarTexto: { fontSize: 14, color: colors.textMuted },
  reenviarBoton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  reenviarLink: { fontSize: 14, fontWeight: '600', color: colors.link },
});

const styles = estilosTarjeta;
