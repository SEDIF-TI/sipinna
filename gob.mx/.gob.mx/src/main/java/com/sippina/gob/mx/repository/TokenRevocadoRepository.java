package com.sippina.gob.mx.repository;

import com.sippina.gob.mx.model.TokenRevocado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface TokenRevocadoRepository extends JpaRepository<TokenRevocado, Long> {
    boolean existsByJti(String jti);
    long deleteByExpiracionBefore(LocalDateTime fecha);
}
