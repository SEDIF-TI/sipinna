import { ReactNode, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../api/client';
import {
  Beneficiarios,
  BENEFICIARIOS_VACIOS,
  Cobertura,
  dmyAIso,
  EDADES,
  esEditable,
  ESTATUS,
  FILAS_BENEFICIARIOS,
  isoADmy,
  ItemCatalogo,
  Periodo,
  proespinnaApi,
  Registro,
  RegistroDatos,
  totalBeneficiarios,
} from '../../api/proespinna';
import { useSesion } from '../../auth/AuthContext';
import { Aviso, Boton, Campo, Dialogo, Opciones } from '../../components/form';
import { colors, radius } from '../../theme';

type Props = {
  id: number | null; // null = nuevo
  onVolver: (mensaje?: string) => void;
};

type Catalogos = { estrategias: ItemCatalogo[]; municipios: ItemCatalogo[]; periodos: Periodo[] };

const sinContorno = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;

export default function CapturaFormScreen({ id, onVolver }: Props) {
  const { token, usuario } = useSesion();
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      proespinnaApi.estrategias(token),
      proespinnaApi.municipios(token),
      proespinnaApi.periodosAbiertos(token),
      id ? proespinnaApi.obtener(token, id) : Promise.resolve(null),
    ])
      .then(([estrategias, municipios, periodos, r]) => {
        if (cancelado) return;
        setCatalogos({ estrategias, municipios, periodos });
        setRegistro(r);
      })
      .catch((e) => !cancelado && setErrorCarga(e instanceof Error ? e.message : 'No se pudo cargar el formulario.'));
    return () => {
      cancelado = true;
    };
  }, [id, token]);

  if (errorCarga) {
    return (
      <View style={styles.gap}>
        <Aviso tono="error" texto={errorCarga} />
        <Boton variante="secundario" texto="Volver a mis registros" onPress={() => onVolver()} />
      </View>
    );
  }
  if (!catalogos || (id && !registro)) {
    return <ActivityIndicator style={styles.cargando} color={colors.primary} />;
  }
  return (
    <Formulario
      key={registro?.id ?? 'nuevo'}
      registro={registro}
      catalogos={catalogos}
      secretaria={usuario.secretaria ?? ''}
      onVolver={onVolver}
    />
  );
}

function Formulario({
  registro: inicial,
  catalogos,
  secretaria,
  onVolver,
}: {
  registro: Registro | null;
  catalogos: Catalogos;
  secretaria: string;
  onVolver: (mensaje?: string) => void;
}) {
  const { token } = useSesion();
  const [registro, setRegistro] = useState<Registro | null>(inicial);
  const editable = !registro || esEditable(registro.estatus);

  const [periodoId, setPeriodoId] = useState<number | null>(inicial?.periodo.id ?? catalogos.periodos[0]?.id ?? null);
  const [estrategiaId, setEstrategiaId] = useState<number | null>(inicial?.estrategia.id ?? null);
  const [dependencia, setDependencia] = useState(inicial?.dependenciaAsociada ?? '');
  const [nombreActividad, setNombreActividad] = useState(inicial?.nombreActividad ?? '');
  const [accionPuntual, setAccionPuntual] = useState(inicial?.accionPuntual ?? '');
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '');
  const [cobertura, setCobertura] = useState<Cobertura>(inicial?.cobertura ?? 'ESTATAL');
  const [municipioIds, setMunicipioIds] = useState<number[]>(inicial?.municipios.map((m) => m.id) ?? []);
  const [fechaInicio, setFechaInicio] = useState(isoADmy(inicial?.fechaInicio));
  const [fechaConclusion, setFechaConclusion] = useState(isoADmy(inicial?.fechaConclusion));
  const [beneficiarios, setBeneficiarios] = useState<Beneficiarios>(inicial?.beneficiarios ?? BENEFICIARIOS_VACIOS);
  const [comentarios, setComentarios] = useState(inicial?.comentarios ?? '');

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardado, setGuardado] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<'borrador' | 'envio' | null>(null);
  const [confirmarEnvio, setConfirmarEnvio] = useState(false);
  const [eligiendoEstrategia, setEligiendoEstrategia] = useState(false);

  // El periodo del registro puede ya estar cerrado; se muestra igual.
  const periodos = useMemo(() => {
    const lista = [...catalogos.periodos];
    if (inicial && !lista.some((p) => p.id === inicial.periodo.id)) lista.push(inicial.periodo);
    return lista;
  }, [catalogos.periodos, inicial]);

  // Sin trimestre abierto el backend rechaza guardar o enviar.
  const sinPeriodo = editable && !periodos.some((p) => p.abierto);
  const estrategia = catalogos.estrategias.find((e) => e.id === estrategiaId) ?? null;
  const total = totalBeneficiarios(beneficiarios);

  const validar = (paraEnviar: boolean): RegistroDatos | null => {
    const e: Record<string, string> = {};
    const ini = dmyAIso(fechaInicio);
    const fin = dmyAIso(fechaConclusion);
    if (!periodoId) e.periodoId = 'Elige el periodo.';
    if (!estrategiaId) e.estrategiaId = 'Elige la estrategia.';
    if (!nombreActividad.trim()) e.nombreActividad = 'Escribe el nombre del programa o actividad.';
    if (!accionPuntual.trim()) e.accionPuntual = 'Escribe la acción puntual.';
    if (!descripcion.trim()) e.descripcion = 'Escribe la descripción.';
    if (cobertura === 'MUNICIPAL' && municipioIds.length === 0) e.municipioIds = 'Selecciona al menos un municipio.';
    if (!ini) e.fechaInicio = 'Escribe la fecha como DD/MM/AAAA.';
    if (!fin) e.fechaConclusion = 'Escribe la fecha como DD/MM/AAAA.';
    if (ini && fin && fin < ini) e.fechaConclusion = 'No puede ser antes de la fecha de inicio.';
    if (paraEnviar && total === 0) e.beneficiarios = 'Registra al menos una niña, niño o adolescente beneficiado antes de enviar.';
    setErrores(e);
    if (Object.keys(e).length) {
      setErrorGeneral('Revisa los campos marcados.');
      return null;
    }
    setErrorGeneral(null);
    return {
      periodoId: periodoId!,
      estrategiaId: estrategiaId!,
      dependenciaAsociada: dependencia.trim() || null,
      accionPuntual: accionPuntual.trim(),
      nombreActividad: nombreActividad.trim(),
      descripcion: descripcion.trim(),
      cobertura,
      municipioIds: cobertura === 'MUNICIPAL' ? municipioIds : [],
      fechaInicio: ini!,
      fechaConclusion: fin!,
      beneficiarios,
      comentarios: comentarios.trim() || null,
    };
  };

  const persistir = async (datos: RegistroDatos) => {
    const r = registro ? await proespinnaApi.editar(token, registro.id, datos) : await proespinnaApi.crear(token, datos);
    setRegistro(r);
    return r;
  };

  const mostrarError = (e: unknown) => {
    if (e instanceof ApiError && e.detalles) {
      setErrores(e.detalles);
      setErrorGeneral('Revisa los campos marcados.');
    } else {
      setErrorGeneral(e instanceof Error ? e.message : 'No se pudo guardar.');
    }
  };

  const guardarBorrador = async () => {
    const datos = validar(false);
    if (!datos) return;
    setGuardando('borrador');
    try {
      await persistir(datos);
      const ahora = new Date();
      setGuardado(`${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`);
    } catch (e) {
      mostrarError(e);
    } finally {
      setGuardando(null);
    }
  };

  const pedirEnvio = () => {
    if (validar(true)) setConfirmarEnvio(true);
  };

  const enviar = async () => {
    const datos = validar(true);
    if (!datos) {
      setConfirmarEnvio(false);
      return;
    }
    setGuardando('envio');
    try {
      const r = await persistir(datos);
      await proespinnaApi.enviar(token, r.id);
      onVolver(`Se envió «${r.nombreActividad}» a revisión.`);
    } catch (e) {
      setConfirmarEnvio(false);
      mostrarError(e);
      setGuardando(null);
    }
  };

  const estatus = registro ? ESTATUS[registro.estatus] : { texto: 'Nuevo', fondo: '#EEEEF2', color: '#45455A' };

  return (
    <View style={styles.gap}>
      <View style={styles.encabezado}>
        <View style={styles.encabezadoTextos}>
          <Pressable onPress={() => onVolver()} accessibilityRole="link" style={styles.migas}>
            <Ionicons name="chevron-back" size={16} color={colors.link} />
            <Text style={styles.link}>Mis registros</Text>
          </Pressable>
          <Text style={styles.titulo} accessibilityRole="header">
            {registro ? 'Registro PROESPINNA' : 'Nuevo registro PROESPINNA'}
          </Text>
          <Text style={styles.subtitulo}>
            {secretaria}
            {editable ? ' · Los campos con * son obligatorios.' : ''}
          </Text>
        </View>
        <View style={[styles.pastilla, { backgroundColor: estatus.fondo }]}>
          <Text style={[styles.pastillaTexto, { color: estatus.color }]}>{estatus.texto}</Text>
        </View>
      </View>

      {!editable ? (
        <Aviso texto="Este registro ya se envió y no se puede modificar. Solo se edita si el administrador lo regresa con observaciones." />
      ) : null}
      {sinPeriodo ? (
        <Aviso
          tono="error"
          texto="No hay ningún periodo de captura abierto, así que no se puede guardar ni enviar. Cuando la Secretaría Ejecutiva abra un trimestre podrás registrar acciones."
        />
      ) : null}
      {registro?.estatus === 'OBSERVADO' ? (
        <Aviso tono="error" texto="El administrador pidió correcciones. Revisa el registro y vuelve a enviarlo." />
      ) : null}

      <Tarjeta titulo="1. Periodo y estrategia">
        <Opciones<number>
          etiqueta="Periodo *"
          valor={periodoId}
          onCambiar={setPeriodoId}
          deshabilitado={!editable}
          error={errores.periodoId}
          ayuda="Solo aparecen los trimestres abiertos."
          vacio="No hay trimestres abiertos."
          opciones={periodos.map((p) => ({ valor: p.id, texto: p.etiqueta }))}
        />
        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Estrategia *</Text>
          <Pressable
            onPress={() => setEligiendoEstrategia(true)}
            disabled={!editable}
            accessibilityRole="button"
            accessibilityLabel={estrategia ? `Estrategia ${estrategia.clave}. Cambiar` : 'Elegir estrategia'}
            style={[styles.selector, !!errores.estrategiaId && styles.selectorError, !editable && styles.deshabilitado]}
          >
            <Text style={[styles.selectorTexto, !estrategia && styles.placeholder]} numberOfLines={1}>
              {estrategia ? `${estrategia.clave} — ${estrategia.nombre}` : 'Elige una estrategia'}
            </Text>
            {editable ? <Ionicons name="chevron-down" size={18} color={colors.icon} /> : null}
          </Pressable>
          {errores.estrategiaId ? <Text style={styles.error}>{errores.estrategiaId}</Text> : null}
          {estrategia ? (
            <Text style={styles.estrategiaCompleta}>
              <Text style={styles.negrita}>{estrategia.clave} </Text>
              {estrategia.nombre}
            </Text>
          ) : null}
        </View>
        <Campo
          etiqueta="Dependencia asociada"
          placeholder="Si la acción se hizo con otra dependencia"
          value={dependencia}
          onChangeText={setDependencia}
          maxLength={255}
          deshabilitado={!editable}
          error={errores.dependenciaAsociada}
        />
      </Tarjeta>

      <Tarjeta titulo="2. Acción realizada">
        <Campo
          etiqueta="Nombre del programa o actividad *"
          placeholder="ej. Jornada de vacunación escolar"
          value={nombreActividad}
          onChangeText={setNombreActividad}
          maxLength={255}
          deshabilitado={!editable}
          error={errores.nombreActividad}
        />
        <Campo
          etiqueta="Acción puntual *"
          placeholder="¿Qué acción concreta de la estrategia se atendió?"
          value={accionPuntual}
          onChangeText={setAccionPuntual}
          multiline
          maxLength={2000}
          deshabilitado={!editable}
          error={errores.accionPuntual}
          ayuda={`${accionPuntual.length} / 2000`}
          style={styles.areaCorta}
        />
        <Campo
          etiqueta="Descripción *"
          placeholder="Describe qué se hizo, cómo y con quién."
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          maxLength={4000}
          deshabilitado={!editable}
          error={errores.descripcion}
          ayuda={`${descripcion.length} / 4000`}
          style={styles.areaLarga}
        />
      </Tarjeta>

      <Tarjeta titulo="3. Cobertura y fechas">
        <Opciones<Cobertura>
          etiqueta="Cobertura *"
          valor={cobertura}
          onCambiar={setCobertura}
          deshabilitado={!editable}
          ayuda={cobertura === 'ESTATAL' ? 'La acción aplica a todo el estado de Puebla.' : undefined}
          opciones={[
            { valor: 'ESTATAL', texto: 'Estatal' },
            { valor: 'MUNICIPAL', texto: 'Municipal' },
          ]}
        />
        {cobertura === 'MUNICIPAL' ? (
          <SelectorMunicipios
            municipios={catalogos.municipios}
            seleccionados={municipioIds}
            onCambiar={setMunicipioIds}
            deshabilitado={!editable}
            error={errores.municipioIds}
          />
        ) : null}
        <View style={styles.fila}>
          <View style={styles.mitad}>
            <Campo
              etiqueta="Fecha de inicio *"
              placeholder="DD/MM/AAAA"
              value={fechaInicio}
              onChangeText={setFechaInicio}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              deshabilitado={!editable}
              error={errores.fechaInicio}
            />
          </View>
          <View style={styles.mitad}>
            <Campo
              etiqueta="Fecha de conclusión *"
              placeholder="DD/MM/AAAA"
              value={fechaConclusion}
              onChangeText={setFechaConclusion}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              deshabilitado={!editable}
              error={errores.fechaConclusion}
              ayuda="No puede ser antes de la fecha de inicio."
            />
          </View>
        </View>
      </Tarjeta>

      <Tarjeta titulo="4. Población beneficiada *" subtitulo="Número de niñas, niños y adolescentes por sexo y edad">
        <TablaBeneficiarios valores={beneficiarios} onCambiar={setBeneficiarios} deshabilitado={!editable} />
        {errores.beneficiarios ? <Text style={styles.error}>{errores.beneficiarios}</Text> : null}
        <Text style={styles.ayuda}>
          Para enviar el registro debe haber al menos una niña, niño o adolescente beneficiado. El borrador se puede guardar en ceros.
        </Text>
      </Tarjeta>

      <Tarjeta titulo="5. Comentarios">
        <Campo
          etiqueta="Comentarios"
          placeholder="Opcional: cualquier dato que ayude a revisar el registro."
          value={comentarios}
          onChangeText={setComentarios}
          multiline
          maxLength={2000}
          deshabilitado={!editable}
          error={errores.comentarios}
          style={styles.areaCorta}
        />
      </Tarjeta>

      {errorGeneral ? <Aviso tono="error" texto={errorGeneral} /> : null}

      <View style={styles.barra}>
        <Text style={styles.ayuda}>{guardado ? `Guardado a las ${guardado}` : registro ? '' : 'Aún no se ha guardado'}</Text>
        <View style={styles.botones}>
          <Boton variante="secundario" texto={editable ? 'Cancelar' : 'Volver'} onPress={() => onVolver()} />
          {editable ? (
            <>
              <Boton
                variante="secundario"
                texto="Guardar borrador"
                cargando={guardando === 'borrador'}
                deshabilitado={sinPeriodo}
                onPress={guardarBorrador}
              />
              <Boton
                texto="Enviar a revisión"
                icono="paper-plane-outline"
                deshabilitado={!!guardando || sinPeriodo}
                onPress={pedirEnvio}
              />
            </>
          ) : null}
        </View>
      </View>

      <Dialogo
        visible={confirmarEnvio}
        titulo="¿Enviar a revisión?"
        ancho={460}
        onCerrar={() => setConfirmarEnvio(false)}
        pie={
          <>
            <Boton variante="secundario" texto="Seguir editando" onPress={() => setConfirmarEnvio(false)} />
            <Boton texto="Enviar" cargando={guardando === 'envio'} onPress={enviar} />
          </>
        }
      >
        <Text style={styles.texto}>
          Ya no podrás editarlo, a menos que el administrador te lo regrese con observaciones. Total de NNA beneficiados:{' '}
          <Text style={styles.negrita}>{total}</Text>.
        </Text>
      </Dialogo>

      <SelectorEstrategia
        visible={eligiendoEstrategia}
        estrategias={catalogos.estrategias}
        valor={estrategiaId}
        onElegir={(v) => {
          setEstrategiaId(v);
          setEligiendoEstrategia(false);
        }}
        onCerrar={() => setEligiendoEstrategia(false)}
      />
    </View>
  );
}

function Tarjeta({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: ReactNode }) {
  return (
    <View style={styles.tarjeta}>
      <View style={styles.tarjetaEncabezado}>
        <Text style={styles.tarjetaTitulo} accessibilityRole="header">
          {titulo}
        </Text>
        {subtitulo ? <Text style={styles.ayuda}>{subtitulo}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function SelectorEstrategia({
  visible,
  estrategias,
  valor,
  onElegir,
  onCerrar,
}: {
  visible: boolean;
  estrategias: ItemCatalogo[];
  valor: number | null;
  onElegir: (id: number) => void;
  onCerrar: () => void;
}) {
  const [buscar, setBuscar] = useState('');
  const q = buscar.trim().toLowerCase();
  const visibles = estrategias.filter((e) => !q || e.clave.includes(q) || e.nombre.toLowerCase().includes(q));
  return (
    <Dialogo
      visible={visible}
      titulo="Elige la estrategia"
      ancho={720}
      onCerrar={onCerrar}
      pie={<Boton variante="secundario" texto="Cancelar" onPress={onCerrar} />}
    >
      <Campo etiqueta="Buscar" placeholder="Clave o palabra, ej. 1.2 o nutrición" value={buscar} onChangeText={setBuscar} />
      <View accessibilityRole="radiogroup" style={styles.lista}>
        {visibles.map((e) => {
          const activa = e.id === valor;
          return (
            <Pressable
              key={e.id}
              onPress={() => onElegir(e.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: activa }}
              accessibilityLabel={`${e.clave} ${e.nombre}`}
              style={({ pressed }) => [styles.opcion, activa && styles.opcionActiva, pressed && styles.opcionPresionada]}
            >
              <Text style={[styles.opcionClave, activa && styles.textoActivo]}>{e.clave}</Text>
              <Text style={styles.opcionTexto}>{e.nombre}</Text>
            </Pressable>
          );
        })}
        {visibles.length === 0 ? <Text style={styles.ayuda}>Ninguna estrategia coincide con «{buscar}».</Text> : null}
      </View>
    </Dialogo>
  );
}

function SelectorMunicipios({
  municipios,
  seleccionados,
  onCambiar,
  deshabilitado,
  error,
}: {
  municipios: ItemCatalogo[];
  seleccionados: number[];
  onCambiar: (ids: number[]) => void;
  deshabilitado?: boolean;
  error?: string;
}) {
  const [buscar, setBuscar] = useState('');
  const q = normalizar(buscar.trim());
  const elegidos = municipios.filter((m) => seleccionados.includes(m.id));
  const resultados = q
    ? municipios.filter((m) => !seleccionados.includes(m.id) && normalizar(m.nombre).includes(q)).slice(0, 8)
    : [];

  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>
        Municipios *{' '}
        <Text style={styles.ayuda}>
          ({elegidos.length} {elegidos.length === 1 ? 'seleccionado' : 'seleccionados'})
        </Text>
      </Text>
      {elegidos.length ? (
        <View style={styles.chips}>
          {elegidos.map((m) => (
            <View key={m.id} style={styles.chip}>
              <Text style={styles.chipTexto}>{m.nombre}</Text>
              {deshabilitado ? null : (
                <Pressable
                  onPress={() => onCambiar(seleccionados.filter((s) => s !== m.id))}
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar ${m.nombre}`}
                  style={styles.chipQuitar}
                >
                  <Ionicons name="close" size={16} color={colors.primaryPressed} />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      ) : null}
      {deshabilitado ? null : (
        <View style={styles.buscador}>
          <Campo
            etiqueta="Buscar municipio"
            placeholder={`Escribe para buscar (${municipios.length})`}
            value={buscar}
            onChangeText={setBuscar}
            error={error}
          />
          {resultados.length ? (
            <View style={styles.resultados} accessibilityRole="list">
              {resultados.map((m, i) => (
                <Pressable
                  key={m.id}
                  onPress={() => {
                    onCambiar([...seleccionados, m.id]);
                    setBuscar('');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Agregar ${m.nombre}`}
                  style={({ pressed }) => [styles.resultado, i > 0 && styles.resultadoBorde, pressed && styles.opcionPresionada]}
                >
                  <Ionicons name="add" size={16} color={colors.icon} />
                  <Text style={styles.resultadoTexto}>{m.nombre}</Text>
                </Pressable>
              ))}
            </View>
          ) : q ? (
            <Text style={styles.ayuda}>Ningún municipio coincide con «{buscar}».</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

/** Quita acentos y pasa a minúsculas para buscar "tehuacan" = "Tehuacán". */
function normalizar(t: string) {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function TablaBeneficiarios({
  valores,
  onCambiar,
  deshabilitado,
}: {
  valores: Beneficiarios;
  onCambiar: (b: Beneficiarios) => void;
  deshabilitado?: boolean;
}) {
  const cambiar = (clave: keyof Beneficiarios, texto: string) => {
    const n = parseInt(texto.replace(/\D/g, ''), 10);
    onCambiar({ ...valores, [clave]: Number.isFinite(n) ? n : 0 });
  };
  return (
    <View style={styles.tablaB}>
      <View style={styles.filaB}>
        <Text style={[styles.thB, styles.colSexo]}>Sexo</Text>
        {EDADES.map((e) => (
          <Text key={e} style={[styles.thB, styles.colNum]}>
            {e.replace(' a ', '–')}
          </Text>
        ))}
        <Text style={[styles.thB, styles.colTotal]}>Total</Text>
      </View>
      {FILAS_BENEFICIARIOS.map((f) => (
        <View key={f.titulo} style={[styles.filaB, styles.filaBBorde]}>
          <Text style={[styles.tdTitulo, styles.colSexo]}>{f.titulo}</Text>
          {f.claves.map((c, i) => (
            <View key={c} style={styles.colNum}>
              <TextInput
                value={String(valores[c])}
                onChangeText={(t) => cambiar(c, t)}
                keyboardType="number-pad"
                editable={!deshabilitado}
                selectTextOnFocus
                accessibilityLabel={`${f.sexo} de ${EDADES[i]} años`}
                style={[styles.inputB, deshabilitado && styles.deshabilitado]}
              />
            </View>
          ))}
          <Text style={[styles.tdTotal, styles.colTotal]}>{f.claves.reduce((t, c) => t + valores[c], 0)}</Text>
        </View>
      ))}
      <View style={[styles.filaB, styles.filaTotal]}>
        <Text style={styles.granTotalEtiqueta}>Total de NNA beneficiados</Text>
        <Text style={styles.granTotal}>{totalBeneficiarios(valores)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 20, maxWidth: 960 },
  cargando: { paddingVertical: 48 },
  encabezado: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 },
  encabezadoTextos: { gap: 6, flexShrink: 1 },
  migas: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 32, alignSelf: 'flex-start' },
  link: { color: colors.link, fontSize: 14 },
  titulo: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitulo: { fontSize: 15, color: colors.textMuted },
  pastilla: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  pastillaTexto: { fontSize: 13, fontWeight: '600' },
  tarjeta: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E4E4EA',
    borderRadius: 12,
    padding: 24,
    gap: 18,
  },
  tarjetaEncabezado: { gap: 4 },
  tarjetaTitulo: { fontSize: 17, fontWeight: '700', color: colors.text },
  campo: { gap: 6 },
  etiqueta: { fontSize: 13, fontWeight: '600', color: colors.label },
  ayuda: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
  error: { fontSize: 12, color: '#B3261E' },
  negrita: { fontWeight: '700', color: colors.text },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  selectorError: { borderColor: '#B3261E' },
  selectorTexto: { flex: 1, fontSize: 15, color: colors.text },
  placeholder: { color: colors.placeholder },
  deshabilitado: { backgroundColor: '#F3F3F6', color: colors.textMuted },
  estrategiaCompleta: {
    padding: 12,
    borderRadius: radius.control,
    backgroundColor: '#F3F3F6',
    fontSize: 13,
    lineHeight: 20,
    color: colors.label,
  },
  areaCorta: { height: 96, paddingTop: 12, textAlignVertical: 'top' },
  areaLarga: { height: 140, paddingTop: 12, textAlignVertical: 'top' },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  mitad: { flexGrow: 1, flexBasis: 220 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
    paddingLeft: 12,
    paddingRight: 4,
    borderRadius: 999,
    backgroundColor: '#FCE4EC',
  },
  chipTexto: { fontSize: 14, fontWeight: '600', color: colors.primaryPressed, paddingRight: 8 },
  chipQuitar: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  buscador: { maxWidth: 440, gap: 0 },
  resultados: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    marginTop: 6,
    backgroundColor: colors.surface,
  },
  resultado: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 14 },
  resultadoBorde: { borderTopWidth: 1, borderTopColor: '#EEEEF2' },
  resultadoTexto: { fontSize: 15, color: colors.text },
  lista: { gap: 8 },
  opcion: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E4E4EA',
    borderRadius: radius.control,
  },
  opcionActiva: { borderColor: colors.primary, backgroundColor: '#FCE4EC' },
  opcionPresionada: { backgroundColor: '#F3F3F6' },
  opcionClave: { width: 36, fontSize: 14, fontWeight: '700', color: colors.text },
  textoActivo: { color: colors.primaryPressed },
  opcionTexto: { flex: 1, fontSize: 14, lineHeight: 20, color: colors.label },
  tablaB: { minWidth: 0 },
  filaB: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  filaBBorde: { borderTopWidth: 1, borderTopColor: '#EEEEF2', paddingVertical: 6 },
  thB: {
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  colSexo: { width: 84, textAlign: 'left' },
  colNum: { flex: 1, minWidth: 52 },
  colTotal: { width: 64, textAlign: 'right' },
  tdTitulo: { fontSize: 14, fontWeight: '600', color: colors.text },
  tdTotal: { fontSize: 15, fontWeight: '700', color: colors.text },
  inputB: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: 10,
    fontSize: 15,
    textAlign: 'right',
    color: colors.text,
    ...sinContorno,
  },
  filaTotal: { justifyContent: 'flex-end', borderTopWidth: 2, borderTopColor: '#E4E4EA', paddingTop: 12, marginTop: 4 },
  granTotalEtiqueta: { fontSize: 14, fontWeight: '600', color: colors.label, marginRight: 12 },
  granTotal: { fontSize: 22, fontWeight: '700', color: colors.primary, width: 64, textAlign: 'right' },
  barra: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E4E4EA',
    borderRadius: 12,
  },
  botones: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  texto: { fontSize: 15, lineHeight: 23, color: colors.textMuted },
});
