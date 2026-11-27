package com.sippina.gob.mx.dto;

import java.util.List;

public record DetalleSeguimientoResponse(RegistroProespinnaResponse registro, List<HistorialItem> historial) {
}
