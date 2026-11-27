package com.sippina.gob.mx.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record RegistroProespinnaResponse(
        Long id,
        String estatus,
        ItemCatalogo secretaria,
        PeriodoResponse periodo,
        ItemCatalogo estrategia,
        String dependenciaAsociada,
        String accionPuntual,
        String nombreActividad,
        String descripcion,
        String cobertura,
        List<ItemCatalogo> municipios,
        LocalDate fechaInicio,
        LocalDate fechaConclusion,
        BeneficiariosDto beneficiarios,
        int totalNna,
        String comentarios,
        String creadoPor,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion,
        LocalDateTime fechaEnvio,
        /** Último comentario del revisor cuando el registro está OBSERVADO; null en otro caso. */
        String observacion
) {
}
