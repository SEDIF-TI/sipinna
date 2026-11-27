package com.sippina.gob.mx.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Convierte NegocioException en el mismo JSON de error que usa
 * GlobalExceptionHandler. Tiene prioridad alta para que el manejador
 * genérico de Exception (500) no la atrape primero.
 */
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class NegocioExceptionHandler {

    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<Map<String, Object>> manejar(NegocioException ex, HttpServletRequest request) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("status", ex.getStatus().value());
        cuerpo.put("error", ex.getStatus().getReasonPhrase());
        cuerpo.put("mensaje", ex.getMessage());
        cuerpo.put("ruta", request.getRequestURI());
        cuerpo.put("fecha", LocalDateTime.now());
        cuerpo.put("detalles", null);
        return ResponseEntity.status(ex.getStatus()).body(cuerpo);
    }
}
