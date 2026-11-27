package com.sippina.gob.mx.dto;

import jakarta.validation.constraints.NotNull;

/** Cuerpo para activar o desactivar: { "activo": false } */
public record EstadoRequest(
        @NotNull(message = "Indica si debe quedar activo (true) o inactivo (false)")
        Boolean activo
) {
}
