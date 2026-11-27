import { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSesion } from '../auth/AuthContext';
import { nombreDelRol } from '../auth/types';
import { iconoDeRuta, RutaPrivada, rutasDelUsuario, tituloDeRuta } from '../navigation/rutas';
import { colors } from '../theme';

type Props = {
  ruta: RutaPrivada;
  onNavegar: (ruta: RutaPrivada) => void;
  children: ReactNode;
};

const ANCHO_ESCRITORIO = 900;

export default function AppLayout({ ruta, onNavegar, children }: Props) {
  const { usuario, modulos, cerrarSesion } = useSesion();
  const { width } = useWindowDimensions();
  const escritorio = width >= ANCHO_ESCRITORIO;
  const [saliendo, setSaliendo] = useState(false);

  const rutas = rutasDelUsuario(modulos, usuario.rol);
  const rol = nombreDelRol(usuario.rol);
  const iniciales = usuario.username.slice(0, 2).toUpperCase();

  const salir = async () => {
    setSaliendo(true);
    await cerrarSesion();
  };

  const menu = rutas.map((r) => {
    const activo = r === ruta;
    const icono = iconoDeRuta(r);
    return (
      <Pressable
        key={r}
        onPress={() => onNavegar(r)}
        accessibilityRole="link"
        accessibilityState={{ selected: activo }}
        style={({ pressed }) => [
          styles.item,
          !escritorio && styles.itemMovil,
          activo && styles.itemActivo,
          pressed && !activo && styles.itemPresionado,
        ]}
      >
        <Ionicons name={icono} size={20} color={activo ? colors.primaryPressed : colors.label} />
        <Text style={[styles.itemTexto, activo && styles.itemTextoActivo]}>{tituloDeRuta(r)}</Text>
      </Pressable>
    );
  });

  const botonSalir = (
    <Pressable
      onPress={salir}
      disabled={saliendo}
      accessibilityRole="button"
      accessibilityLabel="Cerrar sesión"
      style={({ pressed }) => [styles.item, !escritorio && styles.itemMovil, pressed && styles.itemPresionado]}
    >
      {saliendo ? (
        <ActivityIndicator size="small" color={colors.label} />
      ) : (
        <Ionicons name="log-out-outline" size={20} color={colors.label} />
      )}
      {escritorio ? <Text style={styles.itemTexto}>Cerrar sesión</Text> : null}
    </Pressable>
  );

  return (
    <View style={[styles.root, escritorio && styles.rootEscritorio]}>
      {escritorio ? (
        <View style={styles.sidebar} accessibilityRole="menu" aria-label="Menú principal">
          <Text style={styles.marca}>SIPINNA</Text>
          <View style={styles.menu}>{menu}</View>
          <View style={styles.flex} />
          {botonSalir}
        </View>
      ) : (
        <View style={styles.barraMovil}>
          <View style={styles.barraMovilFila}>
            <Text style={styles.marca}>SIPINNA</Text>
            {botonSalir}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuMovil}>
            {menu}
          </ScrollView>
        </View>
      )}

      <View style={styles.flex}>
        <View style={styles.header}>
          <Text style={styles.migas}>{tituloDeRuta(ruta)}</Text>
          <View style={styles.usuario}>
            <View style={styles.usuarioTextos}>
              <Text style={styles.usuarioNombre}>{usuario.username}</Text>
              <Text style={styles.usuarioRol}>
                {usuario.secretaria ? `${rol} · ${usuario.secretaria}` : rol}
              </Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>{iniciales}</Text>
            </View>
          </View>
        </View>
        <ScrollView style={styles.flex} contentContainerStyle={styles.contenido}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.background },
  rootEscritorio: { flexDirection: 'row' },
  sidebar: {
    width: 248,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: '#E4E4EA',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 24,
  },
  marca: { paddingHorizontal: 12, fontSize: 22, fontWeight: '700', letterSpacing: 0.5, color: colors.text },
  menu: { gap: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  itemMovil: { paddingHorizontal: 14 },
  itemActivo: { backgroundColor: '#FCE4EC' },
  itemPresionado: { backgroundColor: '#F3F3F6' },
  itemTexto: { fontSize: 15, color: colors.label },
  itemTextoActivo: { color: colors.primaryPressed, fontWeight: '600' },
  barraMovil: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4EA',
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  barraMovilFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  menuMovil: { paddingHorizontal: 8, gap: 4 },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4EA',
  },
  migas: { fontSize: 14, color: colors.textMuted },
  usuario: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  usuarioTextos: { alignItems: 'flex-end' },
  usuarioNombre: { fontSize: 14, fontWeight: '600', color: colors.text },
  usuarioRol: { fontSize: 12, color: colors.textMuted },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FCE4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { fontSize: 14, fontWeight: '700', color: colors.primaryPressed },
  contenido: { padding: 32, gap: 28, width: '100%', maxWidth: 1200 },
});
