import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

type Props = {
  onVolver: () => void;
};

// Pantalla según la propuesta visual. El backend todavía no tiene un endpoint
// para recuperar la contraseña, así que el envío está deshabilitado.
export default function RecuperarScreen({ onVolver }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.screen} style={styles.flex}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed-outline" size={30} color={colors.link} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            ¿Olvidaste tu contraseña?
          </Text>
          <Text style={styles.subtitle}>
            Escribe el correo con el que te registraste y te enviaremos un enlace para crear una
            nueva contraseña.
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label} nativeID="label-correo">
            Correo electrónico *
          </Text>
          <TextInput
            accessibilityLabelledBy="label-correo"
            placeholder="ejemplo@correo.gob.mx"
            placeholderTextColor={colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
          />
        </View>

        <Text style={styles.aviso}>
          Esta función todavía no está disponible. Si no puedes entrar, pide al administrador que
          restablezca tu contraseña.
        </Text>

        <Pressable
          disabled
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          style={[styles.button, styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>Enviar enlace</Text>
        </Pressable>

        <Pressable onPress={onVolver} accessibilityRole="link" style={styles.volver}>
          <Ionicons name="chevron-back" size={18} color={colors.link} />
          <Text style={styles.link}>Volver a iniciar sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
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
  },
  aviso: { fontSize: 13, lineHeight: 20, color: colors.textMuted },
  button: {
    height: 52,
    borderRadius: radius.control,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
  volver: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
  },
  link: { color: colors.link, fontSize: 15 },
});
