package com.sippina.gob.mx.dto;

import java.time.LocalDateTime;

/** Nunca incluye la contraseña. */
public record UsuarioResponse(
        Long id,
        String username,
        String correo,
        String rol,
        Long secretariaId,
        String secretaria,
        boolean activo,
        LocalDateTime fechaCreacion,
        LocalDateTime ultimoAcceso
) {
}
