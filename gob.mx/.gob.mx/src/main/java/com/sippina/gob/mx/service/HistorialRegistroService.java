package com.sippina.gob.mx.service;

import com.sippina.gob.mx.dto.HistorialItem;
import com.sippina.gob.mx.model.EstatusRegistro;
import com.sippina.gob.mx.model.HistorialRegistro;
import com.sippina.gob.mx.model.RegistroProespinna;
import com.sippina.gob.mx.model.Usuario;
import com.sippina.gob.mx.repository.HistorialRegistroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Guarda y consulta el historial de estatus de los registros. */
@Service
public class HistorialRegistroService {

    private final HistorialRegistroRepository historialRepository;

    public HistorialRegistroService(HistorialRegistroRepository historialRepository) {
        this.historialRepository = historialRepository;
    }

    @Transactional
    public void registrar(RegistroProespinna r, EstatusRegistro anterior, EstatusRegistro nuevo,
                          String comentario, Usuario usuario) {
        historialRepository.save(new HistorialRegistro(r, anterior, nuevo, comentario, usuario));
    }

    @Transactional(readOnly = true)
    public List<HistorialItem> de(Long registroId) {
        return historialRepository.findByRegistroIdOrderByFechaAscIdAsc(registroId).stream()
                .map(h -> new HistorialItem(
                        h.getId(),
                        h.getEstatusAnterior() == null ? null : h.getEstatusAnterior().name(),
                        h.getEstatusNuevo().name(),
                        h.getComentario(),
                        h.getUsuario().getUsername(),
                        h.getFecha()))
                .toList();
    }

    /** Comentario de la observación vigente, para mostrarlo en "Mis registros". */
    @Transactional(readOnly = true)
    public String ultimaObservacion(RegistroProespinna r) {
        if (r.getEstatus() != EstatusRegistro.OBSERVADO) {
            return null;
        }
        return historialRepository
                .findFirstByRegistroIdAndEstatusNuevoOrderByFechaDescIdDesc(r.getId(), EstatusRegistro.OBSERVADO)
                .map(HistorialRegistro::getComentario)
                .orElse(null);
    }

    @Transactional
    public void borrarDe(Long registroId) {
        historialRepository.deleteByRegistroId(registroId);
    }
}
