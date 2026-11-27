package com.sippina.gob.mx.controller;

import com.sippina.gob.mx.dto.AuditoriaResponse;
import com.sippina.gob.mx.service.AuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    // Últimas 100 acciones, de la más reciente a la más antigua (solo superadministrador)
    @GetMapping
    @PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')")
    public List<AuditoriaResponse> recientes() {
        return auditoriaService.recientes();
    }
}
