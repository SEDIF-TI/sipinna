package com.sippina.gob.mx.controller;

import com.sippina.gob.mx.dto.EstadoRequest;
import com.sippina.gob.mx.dto.UsuarioCrearRequest;
import com.sippina.gob.mx.dto.UsuarioEditarRequest;
import com.sippina.gob.mx.dto.UsuarioResponse;
import com.sippina.gob.mx.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /** Para llenar el combo de roles en el formulario. */
    @GetMapping("/roles")
    public List<String> roles() {
        return usuarioService.roles();
    }

    @GetMapping("/usuarios")
    public List<UsuarioResponse> listar() {
        return usuarioService.listar();
    }

    @GetMapping("/usuarios/{id}")
    public UsuarioResponse obtener(@PathVariable Long id) {
        return usuarioService.obtener(id);
    }

    @PostMapping("/usuarios")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse crear(@Valid @RequestBody UsuarioCrearRequest datos, Authentication auth) {
        return usuarioService.crear(datos, auth.getName());
    }

    @PutMapping("/usuarios/{id}")
    public UsuarioResponse editar(@PathVariable Long id, @Valid @RequestBody UsuarioEditarRequest datos, Authentication auth) {
        return usuarioService.editar(id, datos, auth.getName());
    }

    @PatchMapping("/usuarios/{id}/estado")
    public UsuarioResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest datos, Authentication auth) {
        return usuarioService.cambiarEstado(id, datos.activo(), auth.getName());
    }
}
