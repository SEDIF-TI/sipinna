package com.sippina.gob.mx.repository;

import com.sippina.gob.mx.model.RegistroProespinna;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistroProespinnaRepository extends JpaRepository<RegistroProespinna, Long> {
    List<RegistroProespinna> findBySecretariaIdOrderByFechaCreacionDesc(Long secretariaId);
}
