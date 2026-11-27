import { useSesion } from '../auth/AuthContext';
import type { RutaPrivada } from '../navigation/rutas';
import { BotonPrincipal, Encabezado, EstadoVacio, Indicador, Indicadores, Seccion } from '../components/ui';

type Props = { onNavegar: (ruta: RutaPrivada) => void };

// Los números y la tabla se llenarán cuando el backend tenga formularios.
export default function InicioAdminScreen({ onNavegar }: Props) {
  const { usuario, modulos } = useSesion();

  return (
    <>
      <Encabezado
        titulo={`Hola, ${usuario.username}`}
        subtitulo="Esto es lo que enviaron las secretarías."
        accion={
          modulos.includes('reportes') ? (
            <BotonPrincipal texto="Generar reporte" icono="bar-chart-outline" onPress={() => onNavegar('reportes')} />
          ) : null
        }
      />

      <Indicadores>
        <Indicador titulo="Formularios recibidos" />
        <Indicador titulo="Pendientes de revisar" color="#92400E" />
        <Indicador titulo="Con observaciones" color="#B3261E" />
        <Indicador titulo="Secretarías sin enviar" />
      </Indicadores>

      <Seccion titulo="Formularios por revisar">
        <EstadoVacio
          icono="document-text-outline"
          titulo="Todavía no hay formularios"
          texto="Cuando las secretarías envíen sus capturas, aparecerán aquí para que las revises."
        />
      </Seccion>
    </>
  );
}
