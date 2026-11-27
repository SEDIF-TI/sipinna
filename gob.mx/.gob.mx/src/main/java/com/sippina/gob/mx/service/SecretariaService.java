package com.sippina.gob.mx.service;

import com.sippina.gob.mx.dto.SecretariaRequest;
import com.sippina.gob.mx.dto.SecretariaResponse;
import com.sippina.gob.mx.exception.NegocioException;
import com.sippina.gob.mx.model.Secretaria;
import com.sippina.gob.mx.model.Usuario;
import com.sippina.gob.mx.repository.SecretariaRepository;
import com.sippina.gob.mx.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SecretariaService {

    private final SecretariaRepository secretariaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public SecretariaService(SecretariaRepository secretariaRepository,
                             UsuarioRepository usuarioRepository,
                             AuditoriaService auditoriaService) {
        this.secretariaRepository = secretariaRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<SecretariaResponse> listar() {
        // Mapa secretariaId -> username para saber cuáles ya están ocupadas
        Map<Long, String> asignadas = usuarioRepository.findAll().stream()
                .filter(u -> u.getSecretaria() != null)
                .collect(Collectors.toMap(u -> u.getSecretaria().getId(), Usuario::getUsername, (a, b) -> a));

        return secretariaRepository.findAll().stream()
                .sorted(Comparator.comparing(Secretaria::getNombre, String.CASE_INSENSITIVE_ORDER))
                .map(s -> aRespuesta(s, asignadas.get(s.getId())))
                .toList();
    }

    @Transactional
    public SecretariaResponse crear(SecretariaRequest datos, String actor) {
        validarQueNoSeRepita(datos, null);
        Secretaria s = new Secretaria();
        s.setNombre(datos.nombre().trim());
        s.setSiglas(datos.siglas().trim().toUpperCase());
        s.setActivo(true);
        s = secretariaRepository.save(s);
        auditoriaService.registrar(actor, "SECRETARIA_CREADA", s.getNombre());
        return aRespuesta(s, null);
    }

    @Transactional
    public SecretariaResponse editar(Long id, SecretariaRequest datos, String actor) {
        Secretaria s = buscar(id);
        validarQueNoSeRepita(datos, id);
        s.setNombre(datos.nombre().trim());
        s.setSiglas(datos.siglas().trim().toUpperCase());
        auditoriaService.registrar(actor, "SECRETARIA_EDITADA", s.getNombre());
        return aRespuesta(s, usuarioDe(id));
    }

    @Transactional
    public SecretariaResponse cambiarEstado(Long id, boolean activo, String actor) {
        Secretaria s = buscar(id);
        s.setActivo(activo);
        auditoriaService.registrar(actor, activo ? "SECRETARIA_ACTIVADA" : "SECRETARIA_DESACTIVADA", s.getNombre());
        return aRespuesta(s, usuarioDe(id));
    }

    Secretaria buscar(Long id) {
        return secretariaRepository.findById(id)
                .orElseThrow(() -> NegocioException.noEncontrado("La secretaría no existe"));
    }

    private void validarQueNoSeRepita(SecretariaRequest datos, Long idActual) {
        for (Secretaria otra : secretariaRepository.findAll()) {
            if (otra.getId().equals(idActual)) continue;
            if (otra.getNombre().equalsIgnoreCase(datos.nombre().trim())) {
                throw NegocioException.conflicto("Ya existe una secretaría con ese nombre");
            }
            if (otra.getSiglas() != null && otra.getSiglas().equalsIgnoreCase(datos.siglas().trim())) {
                throw NegocioException.conflicto("Ya existe una secretaría con esas siglas");
            }
        }
    }

    private String usuarioDe(Long secretariaId) {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getSecretaria() != null && u.getSecretaria().getId().equals(secretariaId))
                .map(Usuario::getUsername)
                .findFirst().orElse(null);
    }

    private SecretariaResponse aRespuesta(Secretaria s, String usuario) {
        return new SecretariaResponse(s.getId(), s.getNombre(), s.getSiglas(), s.isActivo(), usuario);
    }
}
