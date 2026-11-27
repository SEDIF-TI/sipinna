import { useSesion } from '../auth/AuthContext';
import type { RutaPrivada } from '../navigation/rutas';
import { BotonPrincipal, Encabezado, EstadoVacio, Indicador, Indicadores, Seccion } from '../components/ui';

type Props = { onNavegar: (ruta: RutaPrivada) => void };

// Los números y la tabla se llenarán cuando el backend tenga formularios.
export default function InicioCapturistaScreen({ onNavegar }: Props) {
  const { usuario, modulos } = useSesion();

  return (
    <>
      <Encabezado
        titulo={`Hola, ${usuario.username}`}
        subtitulo={usuario.secretaria ?? 'Sin secretaría asignada'}
        accion={
          modulos.includes('captura') ? (
            <BotonPrincipal texto="Nueva captura" icono="add" onPress={() => onNavegar('captura')} />
          ) : null
        }
      />

      <Indicadores>
        <Indicador titulo="Borradores" />
        <Indicador titulo="Enviados" color="#1D4ED8" />
        <Indicador titulo="Con observaciones" color="#B3261E" />
        <Indicador titulo="Aprobados" color="#1E7B34" />
      </Indicadores>

      <Seccion titulo="Mis capturas recientes">
        <EstadoVacio
          icono="create-outline"
          titulo="Aún no tienes capturas"
          texto="Usa «Nueva captura» para registrar la información de tu secretaría."
        />
      </Seccion>
    </>
  );
}
