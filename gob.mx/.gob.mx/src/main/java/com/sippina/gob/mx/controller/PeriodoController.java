package com.sippina.gob.mx.controller;

import com.sippina.gob.mx.dto.EstadoRequest;
import com.sippina.gob.mx.dto.PeriodoRequest;
import com.sippina.gob.mx.dto.PeriodoResponse;
import com.sippina.gob.mx.service.PeriodoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Solo la Secretaría Ejecutiva (superadmin) abre y cierra trimestres. */
@RestController
@RequestMapping("/api/periodos")
@PreAuthorize("hasRole('SUPERADMINISTRADOR')")
public class PeriodoController {

    private final PeriodoService periodoService;

    public PeriodoController(PeriodoService periodoService) {
        this.periodoService = periodoService;
    }

    @GetMapping
    public List<PeriodoResponse> listar() {
        return periodoService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PeriodoResponse crear(@Valid @RequestBody PeriodoRequest datos, Authentication auth) {
        return periodoService.crear(datos, auth.getName());
    }

    /** { "activo": true } abre el periodo, { "activo": false } lo cierra. */
    @PatchMapping("/{id}/estado")
    public PeriodoResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest datos, Authentication auth) {
        return periodoService.cambiarEstado(id, datos.activo(), auth.getName());
    }
}
