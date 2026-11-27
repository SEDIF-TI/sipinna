package com.sippina.gob.mx.repository;

import com.sippina.gob.mx.model.Municipio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MunicipioRepository extends JpaRepository<Municipio, Long> {
    List<Municipio> findAllByOrderByNombreAsc();
}
