package com.sippina.gob.mx.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/panel")
public class PanelController {

    // Módulos que puede ver el usuario actual (para el menú lateral de React)
    @GetMapping("/menu")
    public Map<String, Object> menu(Authentication auth) {
        Set<String> permisos = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        List<String> modulos = new ArrayList<>();
        if (permisos.contains("CAPTURAR"))           modulos.add("captura");
        if (permisos.contains("CONSULTAR"))          modulos.add("consulta");
        if (permisos.contains("DAR_SEGUIMIENTO"))    modulos.add("seguimiento");
        if (permisos.contains("VER_REPORTES"))       modulos.add("reportes");
        if (permisos.contains("GESTIONAR_USUARIOS")) modulos.add("usuarios");

        return Map.of("usuario", auth.getName(), "modulos", modulos);
    }

    @GetMapping("/captura")
    @PreAuthorize("hasAuthority('CAPTURAR')")
    public Map<String, String> captura(Authentication auth) {
        return acceso("Captura de información", auth);
    }

    @GetMapping("/consulta")
    @PreAuthorize("hasAuthority('CONSULTAR')")
    public Map<String, String> consulta(Authentication auth) {
        return acceso("Consulta de información", auth);
    }

    @GetMapping("/seguimiento")
    @PreAuthorize("hasAuthority('DAR_SEGUIMIENTO')")
    public Map<String, String> seguimiento(Authentication auth) {
        return acceso("Seguimiento de formularios", auth);
    }

    @GetMapping("/reportes")
    @PreAuthorize("hasAuthority('VER_REPORTES')")
    public Map<String, String> reportes(Authentication auth) {
        return acceso("Reportes y estadísticas", auth);
    }

    @GetMapping("/usuarios")
    @PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')")
    public Map<String, String> usuarios(Authentication auth) {
        return acceso("Gestión de usuarios y secretarías", auth);
    }

    private Map<String, String> acceso(String modulo, Authentication auth) {
        return Map.of("modulo", modulo, "usuario", auth.getName(), "mensaje", "Acceso permitido");
    }
}
