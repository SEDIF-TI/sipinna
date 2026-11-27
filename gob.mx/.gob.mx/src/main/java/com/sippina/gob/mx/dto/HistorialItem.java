package com.sippina.gob.mx.dto;

import java.time.LocalDateTime;

/** Una línea del historial: estatusAnterior es null en la creación. */
public record HistorialItem(Long id, String estatusAnterior, String estatusNuevo, String comentario,
                            String usuario, LocalDateTime fecha) {
}
