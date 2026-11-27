package com.sippina.gob.mx.service;

import com.sippina.gob.mx.dto.ItemCatalogo;
import com.sippina.gob.mx.repository.EstrategiaRepository;
import com.sippina.gob.mx.repository.MunicipioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CatalogoService {

    private final EstrategiaRepository estrategiaRepository;
    private final MunicipioRepository municipioRepository;

    public CatalogoService(EstrategiaRepository estrategiaRepository, MunicipioRepository municipioRepository) {
        this.estrategiaRepository = estrategiaRepository;
        this.municipioRepository = municipioRepository;
    }

    @Transactional(readOnly = true)
    public List<ItemCatalogo> estrategias(String programa) {
        return estrategiaRepository.findByProgramaAndActivoTrueOrderByIdAsc(programa.toUpperCase()).stream()
                .map(e -> new ItemCatalogo(e.getId(), e.getClave(), e.getDescripcion()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ItemCatalogo> municipios() {
        return municipioRepository.findAllByOrderByNombreAsc().stream()
                .map(m -> new ItemCatalogo(m.getId(), m.getClave(), m.getNombre()))
                .toList();
    }
}
