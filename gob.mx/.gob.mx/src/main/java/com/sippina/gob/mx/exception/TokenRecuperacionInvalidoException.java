package com.sippina.gob.mx.exception;

public class TokenRecuperacionInvalidoException extends RuntimeException {
    public TokenRecuperacionInvalidoException() {
        super("El enlace de recuperación no es válido o ya expiró");
    }
}
