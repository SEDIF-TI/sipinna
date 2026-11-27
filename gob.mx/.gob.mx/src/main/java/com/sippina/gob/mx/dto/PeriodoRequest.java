package com.sippina.gob.mx.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PeriodoRequest(
        @NotNull(message = "El año es obligatorio")
        @Min(value = 2020, message = "El año no es válido")
        @Max(value = 2100, message = "El año no es válido")
        Integer anio,

        @NotNull(message = "El trimestre es obligatorio")
        @Min(value = 1, message = "El trimestre va de 1 a 4")
        @Max(value = 4, message = "El trimestre va de 1 a 4")
        Integer trimestre,

        /** Si se omite, el periodo se crea abierto. */
        Boolean abierto
) {
}
