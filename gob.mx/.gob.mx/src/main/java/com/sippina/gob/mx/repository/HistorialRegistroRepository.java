package com.sippina.gob.mx.repository;

import com.sippina.gob.mx.model.EstatusRegistro;
import com.sippina.gob.mx.model.HistorialRegistro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HistorialRegistroRepository extends JpaRepository<HistorialRegistro, Long> {
    List<HistorialRegistro> findByRegistroIdOrderByFechaAscIdAsc(Long registroId);
    Optional<HistorialRegistro> findFirstByRegistroIdAndEstatusNuevoOrderByFechaDescIdDesc(Long registroId, EstatusRegistro estatus);
    void deleteByRegistroId(Long registroId);
}
