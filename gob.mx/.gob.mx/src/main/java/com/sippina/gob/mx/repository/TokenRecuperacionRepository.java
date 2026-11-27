package com.sippina.gob.mx.repository;

import com.sippina.gob.mx.model.TokenRecuperacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TokenRecuperacionRepository extends JpaRepository<TokenRecuperacion, Long> {
    Optional<TokenRecuperacion> findByTokenHash(String tokenHash);
    List<TokenRecuperacion> findByUsuarioIdAndUsadoFalse(Long usuarioId);
}
