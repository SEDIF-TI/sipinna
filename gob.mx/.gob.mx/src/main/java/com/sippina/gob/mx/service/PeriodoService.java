package com.sippina.gob.mx.service;

import com.sippina.gob.mx.dto.PeriodoRequest;
import com.sippina.gob.mx.dto.PeriodoResponse;
import com.sippina.gob.mx.exception.NegocioException;
import com.sippina.gob.mx.model.PeriodoCaptura;
import com.sippina.gob.mx.repository.PeriodoCapturaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class PeriodoService {

    private final PeriodoCapturaRepository periodoRepository;
    private final AuditoriaService auditoriaService;

    public PeriodoService(PeriodoCapturaRepository periodoRepository, AuditoriaService auditoriaService) {
        this.periodoRepository = periodoRepository;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<PeriodoResponse> listar() {
        return periodoRepository.findAllByOrderByAnioDescTrimestreDesc().stream().map(PeriodoService::aRespuesta).toList();
    }

    @Transactional(readOnly = true)
    public List<PeriodoResponse> abiertos() {
        return periodoRepository.findByAbiertoTrueOrderByAnioDescTrimestreDesc().stream().map(PeriodoService::aRespuesta).toList();
    }

    @Transactional
    public PeriodoResponse crear(PeriodoRequest datos, String actor) {
        if (periodoRepository.existsByAnioAndTrimestre(datos.anio(), datos.trimestre())) {
            throw NegocioException.conflicto("Ese trimestre ya fue creado");
        }
        // Trimestre 1 = enero-marzo, 2 = abril-junio, 3 = julio-septiembre, 4 = octubre-diciembre
        LocalDate inicio = LocalDate.of(datos.anio(), (datos.trimestre() - 1) * 3 + 1, 1);
        PeriodoCaptura p = new PeriodoCaptura();
        p.setAnio(datos.anio());
        p.setTrimestre(datos.trimestre());
        p.setFechaInicio(inicio);
        p.setFechaFin(inicio.plusMonths(3).minusDays(1));
        p.setAbierto(datos.abierto() == null || datos.abierto());
        p = periodoRepository.save(p);
        auditoriaService.registrar(actor, "PERIODO_CREADO", etiqueta(p));
        return aRespuesta(p);
    }

    @Transactional
    public PeriodoResponse cambiarEstado(Long id, boolean abierto, String actor) {
        PeriodoCaptura p = buscar(id);
        p.setAbierto(abierto);
        auditoriaService.registrar(actor, abierto ? "PERIODO_ABIERTO" : "PERIODO_CERRADO", etiqueta(p));
        return aRespuesta(p);
    }

    PeriodoCaptura buscar(Long id) {
        return periodoRepository.findById(id)
                .orElseThrow(() -> NegocioException.noEncontrado("El periodo no existe"));
    }

    static String etiqueta(PeriodoCaptura p) {
        return p.getAnio() + " - Trimestre " + p.getTrimestre();
    }

    static PeriodoResponse aRespuesta(PeriodoCaptura p) {
        return new PeriodoResponse(p.getId(), p.getAnio(), p.getTrimestre(), etiqueta(p),
                p.getFechaInicio(), p.getFechaFin(), p.isAbierto());
    }
}
