import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Encabezado } from '../../components/ui';
import { colors } from '../../theme';
import AuditoriaTab from './AuditoriaTab';
import SecretariasTab from './SecretariasTab';
import UsuariosTab from './UsuariosTab';

type Pestana = 'usuarios' | 'secretarias' | 'auditoria';

const PESTANAS: Record<Pestana, { titulo: string; subtitulo: string }> = {
  usuarios: { titulo: 'Usuarios', subtitulo: 'Da de alta a las personas que usan SIPINNA y asígnales su secretaría.' },
  secretarias: { titulo: 'Secretarías', subtitulo: 'Cada secretaría tiene un solo capturista asignado.' },
  auditoria: { titulo: 'Auditoría', subtitulo: 'Quién hizo qué y cuándo dentro de SIPINNA.' },
};

// Módulo "usuarios" del menú (permiso GESTIONAR_USUARIOS, solo superadmin).
export default function UsuariosSecretariasScreen() {
  const [pestana, setPestana] = useState<Pestana>('usuarios');

  return (
    <>
      <Encabezado titulo="Usuarios y secretarías" subtitulo={PESTANAS[pestana].subtitulo} />
      <View style={styles.pestanas} accessibilityRole="tablist">
        {(Object.keys(PESTANAS) as Pestana[]).map((p) => {
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
                {PESTANAS[p].titulo}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {pestana === 'usuarios' ? <UsuariosTab /> : pestana === 'secretarias' ? <SecretariasTab /> : <AuditoriaTab />}
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
