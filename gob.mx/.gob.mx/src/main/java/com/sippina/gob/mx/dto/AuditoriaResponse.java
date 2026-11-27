package com.sippina.gob.mx.dto;

import com.sippina.gob.mx.model.Auditoria;

import java.time.LocalDateTime;

public record AuditoriaResponse(
        Long id,
        String usuario,
        String accion,
        String detalle,
        String ip,
        LocalDateTime fecha) {

    public static AuditoriaResponse de(Auditoria a) {
        return new AuditoriaResponse(a.getId(), a.getUsuario(), a.getAccion(), a.getDetalle(), a.getIp(), a.getFecha());
    }
}
