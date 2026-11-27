package com.sippina.gob.mx.dto;

import jakarta.validation.constraints.Size;

/** Comentario del revisor. Obligatorio al observar, opcional al aprobar. */
public record DecisionRequest(
        @Size(max = 2000, message = "Máximo 2000 caracteres")
        String comentario
) {
}
