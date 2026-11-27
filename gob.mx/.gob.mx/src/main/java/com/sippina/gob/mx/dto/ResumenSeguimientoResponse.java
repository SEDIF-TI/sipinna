package com.sippina.gob.mx.dto;

/** Contadores para el tablero. porRevisar = registros en ENVIADO. */
public record ResumenSeguimientoResponse(long porRevisar, long observados, long aprobados, long borradores, long total) {
}
