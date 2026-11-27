import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, ApiError } from '../api/client';
import { colors } from '../theme';
import { estilosTarjeta as styles } from './RecuperarScreen';

type Props = {
  token: string;
  onIrALogin: () => void;
  onPedirOtroEnlace: () => void;
};

// Mismas reglas que RestablecerPasswordRequest.java
const MIN = 8;
const MAX = 72;

// POST /api/auth/reset-password con el token que llegó en el enlace.
export default function RestablecerScreen({ token, onIrALogin, onPedirOtroEnlace }: Props) {
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [enfocado, setEnfocado] = useState<'nueva' | 'confirmar' | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenInvalido, setTokenInvalido] = useState(false);
  const [listo, setListo] = useState(false);

  const guardar = async () => {
    if (enviando) return;
    if (nueva.length < MIN || nueva.length > MAX) {
      setError(`La contraseña debe tener entre ${MIN} y ${MAX} caracteres.`);
      return;
    }
    if (nueva !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await api('/api/auth/reset-password', {
        method: 'POST',
        body: { token, nuevaPassword: nueva },
      });
      setListo(true);
    } catch (e) {
      if (e instanceof ApiError && e.detalles) {
        setError(Object.values(e.detalles).join(' '));
      } else {
        // 400 sin detalles = token inválido, usado o vencido
        if (e instanceof ApiError && e.status === 400) setTokenInvalido(true);
        setError(e instanceof Error ? e.message : 'No se pudo cambiar la contraseña.');
      }
    } finally {
      setEnviando(false);
    }
  };

  if (listo) {
    return (
      <ScrollView contentContainerStyle={styles.screen} style={styles.flex}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={[styles.iconCircle, styles.iconCircleOk]}>
              <Ionicons name="checkmark" size={32} color="#1E7B34" />
            </View>
            <Text style={styles.title} accessibilityRole="header">
              Contraseña actualizada
            </Text>
            <Text style={styles.subtitle} accessibilityLiveRegion="polite">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </Text>
          </View>
          <Pressable
            onPress={onIrALogin}
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  const campo = (
    id: 'nueva' | 'confirmar',
    etiqueta: string,
    valor: string,
    setValor: (v: string) => void,
    alEnviar: () => void,
  ) => (
    <View style={styles.field}>
      <Text style={styles.label} nativeID={`label-${id}`}>
        {etiqueta}
      </Text>
      <TextInput
        accessibilityLabel={etiqueta.replace(' *', '')}
        value={valor}
        onChangeText={setValor}
        secureTextEntry={!mostrar}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType={id === 'nueva' ? 'next' : 'go'}
        onSubmitEditing={alEnviar}
        onFocus={() => setEnfocado(id)}
        onBlur={() => setEnfocado(null)}
        style={[styles.input, enfocado === id && styles.inputFocused]}
      />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.screen} style={styles.flex} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={30} color={colors.link} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            Crea una nueva contraseña
          </Text>
          <Text style={styles.subtitle}>
            Debe tener entre {MIN} y {MAX} caracteres.
          </Text>
        </View>

        {campo('nueva', 'Nueva contraseña *', nueva, setNueva, () => {})}
        {campo('confirmar', 'Confirma la contraseña *', confirmar, setConfirmar, guardar)}

        <Pressable
          onPress={() => setMostrar((v) => !v)}
          accessibilityRole="button"
          style={styles.volver}
        >
          <Ionicons name={mostrar ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.link} />
          <Text style={styles.link}>{mostrar ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}</Text>
        </Pressable>

        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        {tokenInvalido ? (
          <Pressable
            onPress={onPedirOtroEnlace}
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Solicitar un enlace nuevo</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={guardar}
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
              <Text style={styles.buttonText}>Guardar contraseña</Text>
            )}
          </Pressable>
        )}

        <Pressable onPress={onIrALogin} accessibilityRole="link" style={styles.volver}>
          <Ionicons name="chevron-back" size={18} color={colors.link} />
          <Text style={styles.link}>Volver a iniciar sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
