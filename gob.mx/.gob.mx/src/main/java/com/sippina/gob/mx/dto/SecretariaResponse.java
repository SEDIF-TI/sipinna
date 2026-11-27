package com.sippina.gob.mx.dto;

/**
 * usuarioAsignado = username del usuario de esa secretaría, o null si está libre.
 */
public record SecretariaResponse(
        Long id,
        String nombre,
        String siglas,
        boolean activo,
        String usuarioAsignado
) {
}
