import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { adminApi, formatearFecha, Secretaria, UsuarioAdmin } from '../../api/admin';
import { ApiError } from '../../api/client';
import { useSesion } from '../../auth/AuthContext';
import { nombreDelRol, ROLES } from '../../auth/types';
import { Aviso, Boton, Campo, Dialogo, Opciones, Pastilla } from '../../components/form';
import Tabla, { Celda, Columna } from '../../components/Tabla';
import { EstadoVacio } from '../../components/ui';
import { colors } from '../../theme';

type Modal =
  | { tipo: 'nuevo' }
  | { tipo: 'editar'; usuario: UsuarioAdmin }
  | { tipo: 'desactivar'; usuario: UsuarioAdmin }
  | null;

type FiltroEstado = 'todos' | 'activos' | 'inactivos';

export default function UsuariosTab() {
  const { token, usuario: yo } = useSesion();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [buscar, setBuscar] = useState('');
  const [filtroRol, setFiltroRol] = useState<string>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [modal, setModal] = useState<Modal>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null);

  const cargar = useCallback(
    () =>
      Promise.all([adminApi.usuarios(token), adminApi.secretarias(token), adminApi.roles(token)])
        .then(([u, s, r]) => {
          setUsuarios(u);
          setSecretarias(s);
          setRoles(r);
          setError(null);
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar la lista.'))
        .finally(() => setCargando(false)),
    [token],
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return usuarios.filter(
      (u) =>
        (!q || u.username.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q)) &&
        (filtroRol === 'TODOS' || u.rol === filtroRol) &&
        (filtroEstado === 'todos' || (filtroEstado === 'activos') === u.activo),
    );
  }, [usuarios, buscar, filtroRol, filtroEstado]);

  const terminado = async (mensaje: string) => {
    setModal(null);
    setExito(mensaje);
    await cargar();
  };

  const cambiarEstado = async (u: UsuarioAdmin, activo: boolean) => {
    setCambiandoEstado(u.id);
    setExito(null);
    try {
      await adminApi.estadoUsuario(token, u.id, activo);
      await terminado(activo ? `Se activó a ${u.username}.` : `Se desactivó a ${u.username}.`);
    } catch (e) {
      setModal(null);
      setError(e instanceof Error ? e.message : 'No se pudo cambiar el estado.');
    } finally {
      setCambiandoEstado(null);
    }
  };

  const columnas: Columna<UsuarioAdmin>[] = [
    {
      titulo: 'Usuario',
      peso: 3,
      render: (u) => (
        <View style={styles.dosLineas}>
          <Celda fuerte>
            {u.username}
            {u.id === yo.id ? <Text style={styles.tu}> (tú)</Text> : null}
          </Celda>
          <Celda tenue>{u.correo}</Celda>
        </View>
      ),
    },
    { titulo: 'Rol', peso: 2, render: (u) => <Celda>{nombreDelRol(u.rol)}</Celda> },
    {
      titulo: 'Secretaría',
      peso: 2.5,
      render: (u) => <Celda tenue={!u.secretaria}>{u.secretaria ?? '—'}</Celda>,
    },
    { titulo: 'Último acceso', peso: 2, render: (u) => <Celda tenue>{formatearFecha(u.ultimoAcceso)}</Celda> },
    {
      titulo: 'Estado',
      peso: 1.4,
      render: (u) => <Pastilla texto={u.activo ? 'Activo' : 'Inactivo'} tono={u.activo ? 'verde' : 'gris'} />,
    },
    {
      titulo: 'Acciones',
      peso: 2.6,
      alinear: 'derecha',
      render: (u) => (
        <View style={styles.acciones}>
          {u.activo ? (
            <Boton compacto variante="secundario" texto="Editar" onPress={() => setModal({ tipo: 'editar', usuario: u })} />
          ) : null}
          {u.id === yo.id ? null : u.activo ? (
            <Boton
              compacto
              variante="peligro"
              texto="Desactivar"
              onPress={() => setModal({ tipo: 'desactivar', usuario: u })}
            />
          ) : (
            <Boton
              compacto
              variante="exito"
              texto="Activar"
              cargando={cambiandoEstado === u.id}
              onPress={() => cambiarEstado(u, true)}
            />
          )}
        </View>
      ),
    },
  ];

  return (
    <View style={styles.contenedor}>
      <View style={styles.barra}>
        <View style={styles.buscar}>
          <Campo etiqueta="Buscar" placeholder="Usuario o correo" value={buscar} onChangeText={setBuscar} />
        </View>
        <Boton texto="Nuevo usuario" icono="add" onPress={() => { setExito(null); setModal({ tipo: 'nuevo' }); }} />
      </View>
      <View style={styles.filtros}>
        <Opciones
          etiqueta="Rol"
          valor={filtroRol}
          onCambiar={setFiltroRol}
          opciones={[{ valor: 'TODOS', texto: 'Todos' }, ...roles.map((r) => ({ valor: r, texto: nombreDelRol(r) }))]}
        />
        <Opciones<FiltroEstado>
          etiqueta="Estado"
          valor={filtroEstado}
          onCambiar={setFiltroEstado}
          opciones={[
            { valor: 'todos', texto: 'Todos' },
            { valor: 'activos', texto: 'Activos' },
            { valor: 'inactivos', texto: 'Inactivos' },
          ]}
        />
      </View>

      {exito ? <Aviso tono="exito" texto={exito} /> : null}
      {error ? <Aviso tono="error" texto={error} /> : null}

      {cargando ? (
        <ActivityIndicator style={styles.cargando} color={colors.primary} />
      ) : (
        <Tabla
          columnas={columnas}
          filas={visibles}
          clave={(u) => u.id}
          anchoMinimo={900}
          atenuar={(u) => !u.activo}
          vacio={
            <EstadoVacio icono="people-outline" titulo="Sin resultados" texto="Ningún usuario coincide con la búsqueda o los filtros." />
          }
        />
      )}
      <Text style={styles.nota}>No puedes cambiar tu propio rol ni desactivar tu propia cuenta.</Text>

      {modal?.tipo === 'nuevo' || modal?.tipo === 'editar' ? (
        <FormularioUsuario
          usuario={modal.tipo === 'editar' ? modal.usuario : null}
          esYo={modal.tipo === 'editar' && modal.usuario.id === yo.id}
          roles={roles}
          secretarias={secretarias}
          onCerrar={() => setModal(null)}
          onGuardado={terminado}
        />
      ) : null}

      <Dialogo
        visible={modal?.tipo === 'desactivar'}
        titulo={modal?.tipo === 'desactivar' ? `¿Desactivar a ${modal.usuario.username}?` : ''}
        ancho={440}
        onCerrar={() => setModal(null)}
        pie={
          <>
            <Boton variante="secundario" texto="Cancelar" onPress={() => setModal(null)} />
            <Boton
              variante="peligro"
              texto="Desactivar"
              cargando={modal?.tipo === 'desactivar' && cambiandoEstado === modal.usuario.id}
              onPress={() => modal?.tipo === 'desactivar' && cambiarEstado(modal.usuario, false)}
            />
          </>
        }
      >
        <Text style={styles.texto}>
          Ya no podrá iniciar sesión. Su información se conserva y puedes volver a activarlo cuando quieras.
        </Text>
      </Dialogo>
    </View>
  );
}

const USUARIO_VALIDO = /^[a-zA-Z0-9._-]{3,50}$/;
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FormularioUsuario({
  usuario,
  esYo,
  roles,
  secretarias,
  onCerrar,
  onGuardado,
}: {
  usuario: UsuarioAdmin | null;
  esYo: boolean;
  roles: string[];
  secretarias: Secretaria[];
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}) {
  const { token } = useSesion();
  const nuevo = usuario === null;
  const [username, setUsername] = useState(usuario?.username ?? '');
  const [correo, setCorreo] = useState(usuario?.correo ?? '');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<string | null>(usuario?.rol ?? ROLES.USUARIO);
  const [secretariaId, setSecretariaId] = useState<number | null>(usuario?.secretariaId ?? null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const llevaSecretaria = rol === ROLES.USUARIO;
  // Activas y libres (o la que ya tiene este usuario).
  const disponibles = secretarias.filter(
    (s) => s.activo && (!s.usuarioAsignado || s.usuarioAsignado === usuario?.username),
  );

  const validar = () => {
    const e: Record<string, string> = {};
    if (nuevo && !USUARIO_VALIDO.test(username.trim()))
      e.username = 'De 3 a 50 caracteres: letras, números, punto, guion o guion bajo.';
    if (!CORREO_VALIDO.test(correo.trim())) e.correo = 'Escribe un correo válido.';
    if (nuevo && (password.length < 8 || password.length > 72))
      e.password = 'Debe tener entre 8 y 72 caracteres.';
    if (!rol) e.rol = 'Elige un rol.';
    if (llevaSecretaria && !secretariaId) e.secretariaId = 'Elige la secretaría del capturista.';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const guardar = async () => {
    if (!validar() || !rol) return;
    setGuardando(true);
    setErrorGeneral(null);
    const secretaria = llevaSecretaria ? secretariaId : null;
    try {
      if (nuevo) {
        const u = await adminApi.crearUsuario(token, {
          username: username.trim(),
          correo: correo.trim(),
          password,
          rol,
          secretariaId: secretaria,
        });
        onGuardado(`Se creó el usuario ${u.username}.`);
      } else {
        const u = await adminApi.editarUsuario(token, usuario.id, {
          correo: correo.trim(),
          rol,
          secretariaId: secretaria,
        });
        onGuardado(`Se guardaron los cambios de ${u.username}.`);
      }
    } catch (e) {
      if (e instanceof ApiError && e.detalles) setErrores(e.detalles);
      else setErrorGeneral(e instanceof Error ? e.message : 'No se pudo guardar.');
      setGuardando(false);
    }
  };

  return (
    <Dialogo
      visible
      titulo={nuevo ? 'Nuevo usuario' : 'Editar usuario'}
      onCerrar={onCerrar}
      pie={
        <>
          <Boton variante="secundario" texto="Cancelar" onPress={onCerrar} />
          <Boton texto={nuevo ? 'Crear usuario' : 'Guardar cambios'} cargando={guardando} onPress={guardar} />
        </>
      }
    >
      <Campo
        etiqueta="Nombre de usuario *"
        placeholder="ej. juan.perez"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        deshabilitado={!nuevo}
        error={errores.username}
        ayuda={nuevo ? '3 a 50 caracteres: letras, números, punto, guion y guion bajo. No se puede cambiar después.' : undefined}
      />
      <Campo
        etiqueta="Correo electrónico *"
        placeholder="ejemplo@correo.gob.mx"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        error={errores.correo}
      />
      {nuevo ? (
        <Campo
          etiqueta="Contraseña inicial *"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          error={errores.password}
          ayuda="Compártela con la persona; después puede cambiarla con «¿Olvidaste tu contraseña?»."
        />
      ) : null}
      <Opciones
        etiqueta="Rol *"
        valor={rol}
        onCambiar={setRol}
        deshabilitado={esYo}
        error={errores.rol}
        ayuda={esYo ? 'No puedes cambiar tu propio rol.' : undefined}
        opciones={roles.map((r) => ({ valor: r, texto: nombreDelRol(r) }))}
      />
      {llevaSecretaria ? (
        <Opciones
          etiqueta="Secretaría *"
          valor={secretariaId}
          onCambiar={setSecretariaId}
          error={errores.secretariaId}
          vacio="No hay secretarías libres. Crea una nueva en la pestaña Secretarías."
          opciones={disponibles.map((s) => ({ valor: s.id, texto: `${s.nombre} (${s.siglas})` }))}
        />
      ) : null}
      <Aviso texto="Solo el rol Capturista lleva secretaría, y cada secretaría tiene un solo capturista. Aquí solo aparecen las secretarías activas y libres." />
      {errorGeneral ? <Aviso tono="error" texto={errorGeneral} /> : null}
    </Dialogo>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 20 },
  barra: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16, justifyContent: 'space-between' },
  buscar: { flexGrow: 1, flexBasis: 280, maxWidth: 480 },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  dosLineas: { gap: 2 },
  tu: { fontWeight: '400', color: colors.textMuted },
  acciones: { flexDirection: 'row', gap: 8 },
  cargando: { paddingVertical: 48 },
  nota: { fontSize: 13, color: colors.textMuted },
  texto: { fontSize: 15, lineHeight: 23, color: colors.textMuted },
});
