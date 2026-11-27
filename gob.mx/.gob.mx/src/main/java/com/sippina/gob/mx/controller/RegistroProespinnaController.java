package com.sippina.gob.mx.controller;

import com.sippina.gob.mx.dto.HistorialItem;
import com.sippina.gob.mx.dto.RegistroProespinnaRequest;
import com.sippina.gob.mx.dto.RegistroProespinnaResponse;
import com.sippina.gob.mx.service.RegistroProespinnaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Captura del formato PROESPINNA por la secretaría del usuario. */
@RestController
@RequestMapping("/api/proespinna/registros")
@PreAuthorize("hasAuthority('CAPTURAR')")
public class RegistroProespinnaController {

    private final RegistroProespinnaService registroService;

    public RegistroProespinnaController(RegistroProespinnaService registroService) {
        this.registroService = registroService;
    }

    @GetMapping
    public List<RegistroProespinnaResponse> misRegistros(Authentication auth) {
        return registroService.misRegistros(auth.getName());
    }

    @GetMapping("/{id}")
    public RegistroProespinnaResponse obtener(@PathVariable Long id, Authentication auth) {
        return registroService.obtener(id, auth.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RegistroProespinnaResponse crear(@Valid @RequestBody RegistroProespinnaRequest datos, Authentication auth) {
        return registroService.crear(datos, auth.getName());
    }

    @PutMapping("/{id}")
    public RegistroProespinnaResponse editar(@PathVariable Long id, @Valid @RequestBody RegistroProespinnaRequest datos, Authentication auth) {
        return registroService.editar(id, datos, auth.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id, Authentication auth) {
        registroService.eliminar(id, auth.getName());
    }

    /** Historial de estatus (creado, enviado, observado, reenviado, aprobado). */
    @GetMapping("/{id}/historial")
    public List<HistorialItem> historial(@PathVariable Long id, Authentication auth) {
        return registroService.historial(id, auth.getName());
    }

    /** Envía un BORRADOR o reenvía un OBSERVADO ya corregido. */
    @PostMapping("/{id}/enviar")
    public RegistroProespinnaResponse enviar(@PathVariable Long id, Authentication auth) {
        return registroService.enviar(id, auth.getName());
    }
}
