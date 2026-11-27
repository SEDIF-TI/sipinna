package com.sippina.gob.mx.security;

import com.sippina.gob.mx.repository.TokenRevocadoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class LimpiezaTokensRevocados {

    private final TokenRevocadoRepository tokenRevocadoRepository;

    // Todos los días a las 3:00 a. m. borra los tokens revocados que ya caducaron
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void limpiar() {
        long borrados = tokenRevocadoRepository.deleteByExpiracionBefore(LocalDateTime.now());
        log.info("Tokens revocados caducados eliminados: {}", borrados);
    }
}
