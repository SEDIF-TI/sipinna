package com.sippina.gob.mx.controller;

import com.sippina.gob.mx.dto.ItemCatalogo;
import com.sippina.gob.mx.dto.PeriodoResponse;
import com.sippina.gob.mx.service.CatalogoService;
import com.sippina.gob.mx.service.PeriodoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Catálogos para los combos del formulario. Basta con tener sesión. */
@RestController
@RequestMapping("/api/catalogos")
public class CatalogoController {

    private final CatalogoService catalogoService;
    private final PeriodoService periodoService;

    public CatalogoController(CatalogoService catalogoService, PeriodoService periodoService) {
        this.catalogoService = catalogoService;
        this.periodoService = periodoService;
    }

    @GetMapping("/estrategias")
    public List<ItemCatalogo> estrategias(@RequestParam(defaultValue = "PROESPINNA") String programa) {
        return catalogoService.estrategias(programa);
    }

    @GetMapping("/municipios")
    public List<ItemCatalogo> municipios() {
        return catalogoService.municipios();
    }

    @GetMapping("/periodos-abiertos")
    public List<PeriodoResponse> periodosAbiertos() {
        return periodoService.abiertos();
    }
}
