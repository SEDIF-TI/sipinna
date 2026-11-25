package com.sippina.gob.mx.dto;

import java.util.Set;

public record LoginResponse(
        String token,
        String tipo,
        long expiraEnSegundos,
        Long id,
        String username,
        String rol,
        Set<String> permisos) {
}