package com.sippina.gob.mx.dto;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(
        int status,
        String error,
        String mensaje,
        String ruta,
        LocalDateTime fecha,
        Map<String, String> detalles) {

    public static ErrorResponse of(HttpStatus status, String mensaje, String ruta) {
        return of(status, mensaje, ruta, null);
    }

    public static ErrorResponse of(HttpStatus status, String mensaje, String ruta, Map<String, String> detalles) {
        return new ErrorResponse(status.value(), status.getReasonPhrase(), mensaje, ruta, LocalDateTime.now(), detalles);
    }
}