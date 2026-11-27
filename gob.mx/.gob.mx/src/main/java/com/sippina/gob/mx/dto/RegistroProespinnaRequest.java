package com.sippina.gob.mx.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/** Cuerpo para crear o editar un registro PROESPINNA. */
public record RegistroProespinnaRequest(
        @NotNull(message = "El periodo es obligatorio")
        Long periodoId,

        @NotNull(message = "La estrategia es obligatoria")
        Long estrategiaId,

        @Size(max = 255, message = "Máximo 255 caracteres")
        String dependenciaAsociada,

        @NotBlank(message = "La acción puntual es obligatoria")
        @Size(max = 2000, message = "Máximo 2000 caracteres")
        String accionPuntual,

        @NotBlank(message = "El nombre del programa o actividad es obligatorio")
        @Size(max = 255, message = "Máximo 255 caracteres")
        String nombreActividad,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(max = 4000, message = "Máximo 4000 caracteres")
        String descripcion,

        @NotBlank(message = "La cobertura es obligatoria")
        @Pattern(regexp = "ESTATAL|MUNICIPAL", message = "La cobertura debe ser ESTATAL o MUNICIPAL")
        String cobertura,

        List<Long> municipioIds,

        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDate fechaInicio,

        @NotNull(message = "La fecha de conclusión es obligatoria")
        LocalDate fechaConclusion,

        @NotNull(message = "La población beneficiada es obligatoria")
        @Valid
        BeneficiariosDto beneficiarios,

        @Size(max = 2000, message = "Máximo 2000 caracteres")
        String comentarios
) {
}
