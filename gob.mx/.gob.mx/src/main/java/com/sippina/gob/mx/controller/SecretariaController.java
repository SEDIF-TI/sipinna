package com.sippina.gob.mx.controller;

import com.sippina.gob.mx.dto.EstadoRequest;
import com.sippina.gob.mx.dto.SecretariaRequest;
import com.sippina.gob.mx.dto.SecretariaResponse;
import com.sippina.gob.mx.service.SecretariaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/secretarias")
@PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')")
public class SecretariaController {

    private final SecretariaService secretariaService;

    public SecretariaController(SecretariaService secretariaService) {
        this.secretariaService = secretariaService;
    }

    @GetMapping
    public List<SecretariaResponse> listar() {
        return secretariaService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SecretariaResponse crear(@Valid @RequestBody SecretariaRequest datos, Authentication auth) {
        return secretariaService.crear(datos, auth.getName());
    }

    @PutMapping("/{id}")
    public SecretariaResponse editar(@PathVariable Long id, @Valid @RequestBody SecretariaRequest datos, Authentication auth) {
        return secretariaService.editar(id, datos, auth.getName());
    }

    @PatchMapping("/{id}/estado")
    public SecretariaResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest datos, Authentication auth) {
        return secretariaService.cambiarEstado(id, datos.activo(), auth.getName());
    }
}
