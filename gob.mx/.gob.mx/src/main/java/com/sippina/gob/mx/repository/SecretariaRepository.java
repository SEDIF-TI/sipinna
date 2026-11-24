package com.sippina.gob.mx.repository;

import com.sippina.gob.mx.model.Secretaria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SecretariaRepository extends JpaRepository<Secretaria, Long> {
    Optional<Secretaria> findByNombre(String nombre);
}