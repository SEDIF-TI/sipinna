package com.sippina.gob.mx.dto;

import java.util.Set;

public record UsuarioActualResponse(
        Long id,
        String username,
        String correo,
        String rol,
        String secretaria,
        Set<String> permisos) {
}
