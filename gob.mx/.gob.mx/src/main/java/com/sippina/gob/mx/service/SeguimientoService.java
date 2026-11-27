package com.sippina.gob.mx.service;

import com.sippina.gob.mx.dto.DetalleSeguimientoResponse;
import com.sippina.gob.mx.dto.RegistroProespinnaResponse;
import com.sippina.gob.mx.dto.ResumenSeguimientoResponse;
import com.sippina.gob.mx.exception.NegocioException;
import com.sippina.gob.mx.model.EstatusRegistro;
import com.sippina.gob.mx.model.RegistroProespinna;
import com.sippina.gob.mx.model.Usuario;
import com.sippina.gob.mx.repository.RegistroProespinnaRepository;
import com.sippina.gob.mx.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

/**
 * Revisión de los registros enviados por las secretarías.
 * ENVIADO -> APROBADO  (queda como información oficial)
 * ENVIADO -> OBSERVADO (regresa a la secretaría con un comentario)
 */
@Service
public class SeguimientoService {

    private final RegistroProespinnaRepository registroRepository;
    private final UsuarioRepository usuarioRepository;
    private final RegistroProespinnaService registroService;
    private final HistorialRegistroService historialService;
    private final AuditoriaService auditoriaService;

    public SeguimientoService(RegistroProespinnaRepository registroRepository,
                              UsuarioRepository usuarioRepository,
                              RegistroProespinnaService registroService,
                              HistorialRegistroService historialService,
                              AuditoriaService auditoriaService) {
        this.registroRepository = registroRepository;
        this.usuarioRepository = usuarioRepository;
        this.registroService = registroService;
        this.historialService = historialService;
        this.auditoriaService = auditoriaService;
    }

    /** Bandeja: todo lo enviado por las secretarías (nunca borradores), con filtros opcionales. */
    @Transactional(readOnly = true)
    public List<RegistroProespinnaResponse> bandeja(Long periodoId, Long secretariaId, String estatus) {
        EstatusRegistro filtroEstatus = estatusValido(estatus);
        return registroRepository.findByEstatusNotOrderByFechaEnvioDesc(EstatusRegistro.BORRADOR).stream()
                .filter(r -> periodoId == null || r.getPeriodo().getId().equals(periodoId))
                .filter(r -> secretariaId == null || r.getSecretaria().getId().equals(secretariaId))
                .filter(r -> filtroEstatus == null || r.getEstatus() == filtroEstatus)
                .map(registroService::aRespuesta)
                .toList();
    }

    @Transactional(readOnly = true)
    public DetalleSeguimientoResponse detalle(Long id) {
        RegistroProespinna r = buscarEnviado(id);
        return new DetalleSeguimientoResponse(registroService.aRespuesta(r), historialService.de(r.getId()));
    }

    @Transactional(readOnly = true)
    public ResumenSeguimientoResponse resumen(Long periodoId) {
        List<RegistroProespinna> todos = registroRepository.findAll().stream()
                .filter(r -> periodoId == null || r.getPeriodo().getId().equals(periodoId))
                .toList();
        return new ResumenSeguimientoResponse(
                contar(todos, EstatusRegistro.ENVIADO),
                contar(todos, EstatusRegistro.OBSERVADO),
                contar(todos, EstatusRegistro.APROBADO),
                contar(todos, EstatusRegistro.BORRADOR),
                todos.size());
    }

    @Transactional
    public DetalleSeguimientoResponse aprobar(Long id, String comentario, String username) {
        return decidir(id, EstatusRegistro.APROBADO, comentario, username, "REGISTRO_APROBADO");
    }

    @Transactional
    public DetalleSeguimientoResponse observar(Long id, String comentario, String username) {
        if (comentario == null || comentario.isBlank()) {
            throw NegocioException.invalido("Escribe qué debe corregir la secretaría");
        }
        return decidir(id, EstatusRegistro.OBSERVADO, comentario, username, "REGISTRO_OBSERVADO");
    }

    private DetalleSeguimientoResponse decidir(Long id, EstatusRegistro nuevo, String comentario,
                                               String username, String accion) {
        RegistroProespinna r = buscarEnviado(id);
        if (r.getEstatus() != EstatusRegistro.ENVIADO && r.getEstatus() != EstatusRegistro.EN_REVISION) {
            throw NegocioException.invalido("Solo se pueden revisar registros enviados; este está " + r.getEstatus());
        }
        Usuario revisor = usuarioRepository.findByCorreoOrUsername(username, username)
                .orElseThrow(() -> NegocioException.noEncontrado("Usuario no encontrado"));
        EstatusRegistro anterior = r.getEstatus();
        r.setEstatus(nuevo);
        String texto = comentario == null || comentario.isBlank() ? null : comentario.trim();
        historialService.registrar(r, anterior, nuevo, texto, revisor);
        auditoriaService.registrar(username, accion, "PROESPINNA #" + r.getId() + " (" + r.getSecretaria().getSiglas() + ")");
        return new DetalleSeguimientoResponse(registroService.aRespuesta(r), historialService.de(r.getId()));
    }

    /** Los borradores no existen para el revisor: son privados de la secretaría. */
    private RegistroProespinna buscarEnviado(Long id) {
        return registroRepository.findById(id)
                .filter(r -> r.getEstatus() != EstatusRegistro.BORRADOR)
                .orElseThrow(() -> NegocioException.noEncontrado("El registro no existe"));
    }

    private static EstatusRegistro estatusValido(String estatus) {
        if (estatus == null || estatus.isBlank()) {
            return null;
        }
        try {
            return EstatusRegistro.valueOf(estatus.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw NegocioException.invalido("Estatus no válido: " + estatus);
        }
    }

    private static long contar(List<RegistroProespinna> lista, EstatusRegistro estatus) {
        return lista.stream().filter(r -> r.getEstatus() == estatus).count();
    }
}
