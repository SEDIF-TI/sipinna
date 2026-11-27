import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Encabezado } from '../../components/ui';
import { colors } from '../../theme';
import SecretariasTab from './SecretariasTab';
import UsuariosTab from './UsuariosTab';

type Pestana = 'usuarios' | 'secretarias';

// Módulo "usuarios" del menú (permiso GESTIONAR_USUARIOS, solo superadmin).
export default function UsuariosSecretariasScreen() {
  const [pestana, setPestana] = useState<Pestana>('usuarios');

  return (
    <>
      <Encabezado
        titulo="Usuarios y secretarías"
        subtitulo={
          pestana === 'usuarios'
            ? 'Da de alta a las personas que usan SIPINNA y asígnales su secretaría.'
            : 'Cada secretaría tiene un solo capturista asignado.'
        }
      />
      <View style={styles.pestanas} accessibilityRole="tablist">
        {(['usuarios', 'secretarias'] as Pestana[]).map((p) => {
          const activa = p === pestana;
          return (
            <Pressable
              key={p}
              onPress={() => setPestana(p)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activa }}
              style={[styles.pestana, activa && styles.pestanaActiva]}
            >
              <Text style={[styles.pestanaTexto, activa && styles.pestanaTextoActiva]}>
                {p === 'usuarios' ? 'Usuarios' : 'Secretarías'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {pestana === 'usuarios' ? <UsuariosTab /> : <SecretariasTab />}
    </>
  );
}

const styles = StyleSheet.create({
  pestanas: { flexDirection: 'row', gap: 4, borderBottomWidth: 1, borderBottomColor: '#E4E4EA' },
  pestana: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  pestanaActiva: { borderBottomColor: colors.primary },
  pestanaTexto: { fontSize: 15, color: colors.textMuted },
  pestanaTextoActiva: { color: colors.primaryPressed, fontWeight: '600' },
});
