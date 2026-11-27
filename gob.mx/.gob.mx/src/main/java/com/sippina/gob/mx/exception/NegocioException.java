package com.sippina.gob.mx.exception;

import org.springframework.http.HttpStatus;

/**
 * Error de una regla del sistema (dato duplicado, registro inexistente,
 * secretaría ocupada...). Lleva el código HTTP que debe recibir el frontend.
 */
public class NegocioException extends RuntimeException {

    private final HttpStatus status;

    public NegocioException(HttpStatus status, String mensaje) {
        super(mensaje);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public static NegocioException noEncontrado(String mensaje) {
        return new NegocioException(HttpStatus.NOT_FOUND, mensaje);
    }

    public static NegocioException conflicto(String mensaje) {
        return new NegocioException(HttpStatus.CONFLICT, mensaje);
    }

    public static NegocioException invalido(String mensaje) {
        return new NegocioException(HttpStatus.BAD_REQUEST, mensaje);
    }
}
