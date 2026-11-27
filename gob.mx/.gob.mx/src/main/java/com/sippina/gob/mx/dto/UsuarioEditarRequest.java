package com.sippina.gob.mx.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Edición de un usuario. El username no se cambia y la contraseña
 * la cambia el propio usuario con "Olvidé mi contraseña".
 */
public record UsuarioEditarRequest(
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 150, message = "El correo admite máximo 150 caracteres")
        String correo,

        @NotBlank(message = "El rol es obligatorio")
        String rol,

        Long secretariaId
) {
}
