package com.sippina.gob.mx.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SecretariaRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre admite máximo 150 caracteres")
        String nombre,

        @NotBlank(message = "Las siglas son obligatorias")
        @Size(max = 20, message = "Las siglas admiten máximo 20 caracteres")
        String siglas
) {
}
