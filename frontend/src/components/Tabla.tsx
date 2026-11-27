import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export type Columna<T> = {
  titulo: string;
  /** Proporción del ancho (flex). */
  peso: number;
  alinear?: 'izquierda' | 'derecha';
  render: (fila: T) => ReactNode;
};

/** Tabla simple. En pantallas angostas se desplaza horizontalmente. */
export default function Tabla<T>({
  columnas,
  filas,
  clave,
  anchoMinimo = 760,
  atenuar,
  vacio,
}: {
  columnas: Columna<T>[];
  filas: T[];
  clave: (fila: T) => string | number;
  anchoMinimo?: number;
  atenuar?: (fila: T) => boolean;
  vacio?: ReactNode;
}) {
  return (
    <View style={styles.contenedor}>
      <ScrollView horizontal contentContainerStyle={styles.scroll}>
        <View style={[styles.tabla, { minWidth: anchoMinimo }]}>
          <View style={styles.encabezado} accessibilityRole="header">
            {columnas.map((c) => (
              <Text
                key={c.titulo}
                style={[styles.th, { flex: c.peso }, c.alinear === 'derecha' && styles.derecha]}
              >
                {c.titulo}
              </Text>
            ))}
          </View>
          {filas.length === 0 && vacio ? <View style={styles.vacio}>{vacio}</View> : null}
          {filas.map((f) => (
            <View key={clave(f)} style={[styles.fila, atenuar?.(f) && styles.filaAtenuada]}>
              {columnas.map((c) => (
                <View
                  key={c.titulo}
                  style={[styles.td, { flex: c.peso }, c.alinear === 'derecha' && styles.tdDerecha]}
                >
                  {c.render(f)}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export function Celda({ children, tenue, fuerte }: { children: ReactNode; tenue?: boolean; fuerte?: boolean }) {
  return <Text style={[styles.celda, tenue && styles.tenue, fuerte && styles.fuerte]}>{children}</Text>;
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E4E4EA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  scroll: { flexGrow: 1 },
  tabla: { flex: 1 },
  encabezado: { flexDirection: 'row', paddingHorizontal: 8 },
  th: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  derecha: { textAlign: 'right' },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEF2',
  },
  filaAtenuada: { backgroundColor: '#FAFAFB' },
  td: { paddingVertical: 12, paddingHorizontal: 12, justifyContent: 'center' },
  tdDerecha: { alignItems: 'flex-end' },
  celda: { fontSize: 14, color: colors.text },
  tenue: { color: colors.textMuted },
  fuerte: { fontWeight: '600' },
  vacio: { borderTopWidth: 1, borderTopColor: '#EEEEF2' },
});
