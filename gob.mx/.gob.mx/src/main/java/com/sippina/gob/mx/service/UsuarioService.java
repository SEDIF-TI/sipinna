package com.sippina.gob.mx.service;

import com.sippina.gob.mx.dto.UsuarioCrearRequest;
import com.sippina.gob.mx.dto.UsuarioEditarRequest;
import com.sippina.gob.mx.dto.UsuarioResponse;
import com.sippina.gob.mx.exception.NegocioException;
import com.sippina.gob.mx.model.Rol;
import com.sippina.gob.mx.model.Secretaria;
import com.sippina.gob.mx.model.Usuario;
import com.sippina.gob.mx.repository.RolRepository;
import com.sippina.gob.mx.repository.SecretariaRepository;
import com.sippina.gob.mx.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

/**
 * Reglas:
 *  - Rol USUARIO: debe tener secretaría, activa y sin otro usuario asignado.
 *  - ADMINISTRADOR y SUPERADMINISTRADOR: no llevan secretaría.
 *  - Username y correo no se repiten.
 *  - Nadie puede desactivarse ni cambiarse el rol a sí mismo.
 */
@Service
public class UsuarioService {

    private static final String ROL_USUARIO = "USUARIO";

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final SecretariaRepository secretariaRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditoriaService auditoriaService;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          RolRepository rolRepository,
                          SecretariaRepository secretariaRepository,
                          PasswordEncoder passwordEncoder,
                          AuditoriaService auditoriaService) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.secretariaRepository = secretariaRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream()
                .sorted(Comparator.comparing(Usuario::getId))
                .map(this::aRespuesta)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id) {
        return aRespuesta(buscar(id));
    }

    @Transactional(readOnly = true)
    public List<String> roles() {
        return rolRepository.findAll().stream().map(Rol::getNombre).sorted().toList();
    }

    @Transactional
    public UsuarioResponse crear(UsuarioCrearRequest datos, String actor) {
        String username = datos.username().trim();
        String correo = datos.correo().trim().toLowerCase();

        for (Usuario otro : usuarioRepository.findAll()) {
            if (otro.getUsername().equalsIgnoreCase(username)) {
                throw NegocioException.conflicto("Ese nombre de usuario ya está en uso");
            }
            if (otro.getCorreo().equalsIgnoreCase(correo)) {
                throw NegocioException.conflicto("Ese correo ya está registrado");
            }
        }

        Rol rol = buscarRol(datos.rol());
        Secretaria secretaria = resolverSecretaria(rol, datos.secretariaId(), null);

        Usuario u = new Usuario();
        u.setUsername(username);
        u.setCorreo(correo);
        u.setPassword(passwordEncoder.encode(datos.password()));
        u.setRol(rol);
        u.setSecretaria(secretaria);
        u.setActivo(true);
        u = usuarioRepository.save(u);

        auditoriaService.registrar(actor, "USUARIO_CREADO", u.getUsername() + " (" + rol.getNombre() + ")");
        return aRespuesta(u);
    }

    @Transactional
    public UsuarioResponse editar(Long id, UsuarioEditarRequest datos, String actor) {
        Usuario u = buscar(id);
        String correo = datos.correo().trim().toLowerCase();

        for (Usuario otro : usuarioRepository.findAll()) {
            if (!otro.getId().equals(id) && otro.getCorreo().equalsIgnoreCase(correo)) {
                throw NegocioException.conflicto("Ese correo ya está registrado");
            }
        }

        Rol rol = buscarRol(datos.rol());
        if (u.getUsername().equals(actor) && !rol.getNombre().equals(u.getRol().getNombre())) {
            throw NegocioException.invalido("No puedes cambiar tu propio rol");
        }

        u.setCorreo(correo);
        u.setRol(rol);
        u.setSecretaria(resolverSecretaria(rol, datos.secretariaId(), id));

        auditoriaService.registrar(actor, "USUARIO_EDITADO", u.getUsername());
        return aRespuesta(u);
    }

    @Transactional
    public UsuarioResponse cambiarEstado(Long id, boolean activo, String actor) {
        Usuario u = buscar(id);
        if (u.getUsername().equals(actor) && !activo) {
            throw NegocioException.invalido("No puedes desactivar tu propia cuenta");
        }
        u.setActivo(activo);
        auditoriaService.registrar(actor, activo ? "USUARIO_ACTIVADO" : "USUARIO_DESACTIVADO", u.getUsername());
        return aRespuesta(u);
    }

    private Usuario buscar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> NegocioException.noEncontrado("El usuario no existe"));
    }

    private Rol buscarRol(String nombre) {
        return rolRepository.findAll().stream()
                .filter(r -> r.getNombre().equalsIgnoreCase(nombre.trim()))
                .findFirst()
                .orElseThrow(() -> NegocioException.invalido("El rol no existe: " + nombre));
    }

    /** Aplica la regla de "un usuario por secretaría". */
    private Secretaria resolverSecretaria(Rol rol, Long secretariaId, Long usuarioActualId) {
        if (!ROL_USUARIO.equals(rol.getNombre())) {
            return null; // administradores no pertenecen a una secretaría
        }
        if (secretariaId == null) {
            throw NegocioException.invalido("Un usuario con rol USUARIO debe tener una secretaría");
        }
        Secretaria s = secretariaRepository.findById(secretariaId)
                .orElseThrow(() -> NegocioException.noEncontrado("La secretaría no existe"));
        if (!s.isActivo()) {
            throw NegocioException.invalido("La secretaría está desactivada");
        }
        for (Usuario otro : usuarioRepository.findAll()) {
            boolean mismaSecretaria = otro.getSecretaria() != null && otro.getSecretaria().getId().equals(secretariaId);
            if (mismaSecretaria && !otro.getId().equals(usuarioActualId)) {
                throw NegocioException.conflicto("Esa secretaría ya tiene asignado al usuario " + otro.getUsername());
            }
        }
        return s;
    }

    private UsuarioResponse aRespuesta(Usuario u) {
        Secretaria s = u.getSecretaria();
        return new UsuarioResponse(
                u.getId(),
                u.getUsername(),
                u.getCorreo(),
                u.getRol().getNombre(),
                s != null ? s.getId() : null,
                s != null ? s.getNombre() : null,
                u.isActivo(),
                u.getFechaCreacion(),
                u.getUltimoAcceso());
    }
}
