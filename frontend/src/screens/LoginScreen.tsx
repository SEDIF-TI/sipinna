import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

type Props = {
  /** Se llama al enviar el formulario. Aquí se conectará POST /api/auth/login. */
  onSubmit?: (usuario: string, contrasena: string) => Promise<void> | void;
  onForgotPassword?: () => void;
};

export default function LoginScreen({ onSubmit, onForgotPassword }: Props) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState<'usuario' | 'contrasena' | null>(null);

  const handleSubmit = async () => {
    if (!usuario.trim() || !contrasena) {
      setError('Ingresa tu usuario y contraseña.');
      return;
    }
    setError(null);
    setCargando(true);
    try {
      await onSubmit?.(usuario.trim(), contrasena);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.screen}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              SIPINNA
            </Text>
            <Text style={styles.subtitle}>
              Ingresa tus credenciales para continuar
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label} nativeID="label-usuario">
                N° de control, correo o usuario *
              </Text>
              <TextInput
                accessibilityLabelledBy="label-usuario"
                value={usuario}
                onChangeText={setUsuario}
                placeholder="Escribe tu usuario"
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                textContentType="username"
                returnKeyType="next"
                onFocus={() => setFocus('usuario')}
                onBlur={() => setFocus(null)}
                style={[
                  styles.input,
                  styles.inputBox,
                  focus === 'usuario' && styles.inputFocused,
                ]}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label} nativeID="label-contrasena">
                Contraseña *
              </Text>
              <View
                style={[
                  styles.inputBox,
                  styles.passwordRow,
                  focus === 'contrasena' && styles.inputFocused,
                ]}
              >
                <TextInput
                  accessibilityLabelledBy="label-contrasena"
                  value={contrasena}
                  onChangeText={setContrasena}
                  placeholder="Escribe tu contraseña"
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!mostrar}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
                  onFocus={() => setFocus('contrasena')}
                  onBlur={() => setFocus(null)}
                  style={[styles.input, styles.passwordInput]}
                />
                <Pressable
                  onPress={() => setMostrar((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                  hitSlop={4}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={mostrar ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={colors.icon}
                  />
                </Pressable>
              </View>
            </View>

            {error ? (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={cargando}
              accessibilityRole="button"
              accessibilityState={{ disabled: cargando, busy: cargando }}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                cargando && styles.buttonDisabled,
              ]}
            >
              {cargando ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.buttonText}>Iniciar sesión</Text>
              )}
            </Pressable>
          </View>

          <Pressable
            onPress={onForgotPassword}
            accessibilityRole="link"
            style={styles.linkWrap}
          >
            <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 40,
    gap: 24,
    shadowColor: '#141428',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: { alignItems: 'center', gap: 12 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  form: { gap: 20, paddingTop: 12 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.label },
  inputBox: {
    height: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
  },
  inputFocused: { borderColor: colors.primary, borderWidth: 2 },
  input: { fontSize: 16, color: colors.text, paddingHorizontal: 14 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  passwordInput: { flex: 1, height: '100%', minWidth: 0 },
  eyeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
  },
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
  linkWrap: { alignSelf: 'center', minHeight: 44, justifyContent: 'center' },
  link: { color: colors.link, fontSize: 15 },
});
