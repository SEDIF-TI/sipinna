package com.sippina.gob.mx.repository;

import com.sippina.gob.mx.model.Estrategia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EstrategiaRepository extends JpaRepository<Estrategia, Long> {
    List<Estrategia> findByProgramaAndActivoTrueOrderByIdAsc(String programa);
}
