package com.sippina.gob.mx.repository;

import com.sippina.gob.mx.model.Auditoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {
    List<Auditoria> findTop100ByOrderByFechaDesc();
}
