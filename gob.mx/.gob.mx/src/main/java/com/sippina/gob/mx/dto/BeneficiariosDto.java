package com.sippina.gob.mx.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** Población beneficiada por sexo y grupo de edad (formato PROESPINNA). */
public record BeneficiariosDto(
        @NotNull @Min(value = 0, message = "No puede ser negativo") Integer ninas0a5,
        @NotNull @Min(value = 0, message = "No puede ser negativo") Integer ninas6a8,
        @NotNull @Min(value = 0, message = "No puede ser negativo") Integer ninas9a11,
        @NotNull @Min(value = 0, message = "No puede ser negativo") Integer adolescentesMujeres12a14,
        @NotNull @Min(value = 0, message = "No puede ser negativo") Integer adolescentesMujeres15a17,
        @NotNull @Min(value = 0, message = "No puede ser negativo") Integer ninos0a5,
        @NotNull @Min(value = 0, message = "No puede ser negativo") Integer ninos6a8,
        @NotNull @Min(value = 0, message = "No puede ser negativo") Integer ninos9a11,
        @NotNull @Min(value = 0, message = "No puede ser negativo") Integer adolescentesHombres12a14,
        @NotNull @Min(value = 0, message = "No puede ser negativo") Integer adolescentesHombres15a17
) {
}
