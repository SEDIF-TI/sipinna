package com.sippina.gob.mx.repository;

import com.sippina.gob.mx.model.PeriodoCaptura;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PeriodoCapturaRepository extends JpaRepository<PeriodoCaptura, Long> {
    List<PeriodoCaptura> findAllByOrderByAnioDescTrimestreDesc();
    List<PeriodoCaptura> findByAbiertoTrueOrderByAnioDescTrimestreDesc();
    boolean existsByAnioAndTrimestre(int anio, int trimestre);
}
