package com.sippina.gob.mx.controller;

import com.sippina.gob.mx.dto.DecisionRequest;
import com.sippina.gob.mx.dto.DetalleSeguimientoResponse;
import com.sippina.gob.mx.dto.RegistroProespinnaResponse;
import com.sippina.gob.mx.dto.ResumenSeguimientoResponse;
import com.sippina.gob.mx.service.SeguimientoService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Bandeja de revisión del administrador y del superadmin. */
@RestController
@RequestMapping("/api/seguimiento")
@PreAuthorize("hasAuthority('DAR_SEGUIMIENTO')")
public class SeguimientoController {

    private final SeguimientoService seguimientoService;

    public SeguimientoController(SeguimientoService seguimientoService) {
        this.seguimientoService = seguimientoService;
    }

    /** Filtros opcionales: ?periodoId=1&secretariaId=2&estatus=ENVIADO */
    @GetMapping("/registros")
    public List<RegistroProespinnaResponse> bandeja(@RequestParam(required = false) Long periodoId,
                                                    @RequestParam(required = false) Long secretariaId,
                                                    @RequestParam(required = false) String estatus) {
        return seguimientoService.bandeja(periodoId, secretariaId, estatus);
    }

    @GetMapping("/registros/{id}")
    public DetalleSeguimientoResponse detalle(@PathVariable Long id) {
        return seguimientoService.detalle(id);
    }

    @GetMapping("/resumen")
    public ResumenSeguimientoResponse resumen(@RequestParam(required = false) Long periodoId) {
        return seguimientoService.resumen(periodoId);
    }

    /** Cuerpo opcional: { "comentario": "..." } */
    @PostMapping("/registros/{id}/aprobar")
    public DetalleSeguimientoResponse aprobar(@PathVariable Long id,
                                              @Valid @RequestBody(required = false) DecisionRequest datos,
                                              Authentication auth) {
        return seguimientoService.aprobar(id, datos == null ? null : datos.comentario(), auth.getName());
    }

    /** Cuerpo obligatorio: { "comentario": "Qué debe corregir" } */
    @PostMapping("/registros/{id}/observar")
    public DetalleSeguimientoResponse observar(@PathVariable Long id,
                                               @Valid @RequestBody(required = false) DecisionRequest datos,
                                               Authentication auth) {
        return seguimientoService.observar(id, datos == null ? null : datos.comentario(), auth.getName());
    }
}
