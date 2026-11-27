package com.sippina.gob.mx.dto;

import java.time.LocalDate;

/** etiqueta = texto listo para mostrar, p. ej. "2026 - Trimestre 4". */
public record PeriodoResponse(Long id, int anio, int trimestre, String etiqueta,
                              LocalDate fechaInicio, LocalDate fechaFin, boolean abierto) {
}
