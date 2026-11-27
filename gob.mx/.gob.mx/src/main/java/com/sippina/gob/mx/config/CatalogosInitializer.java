package com.sippina.gob.mx.config;

import com.sippina.gob.mx.model.Estrategia;
import com.sippina.gob.mx.model.Municipio;
import com.sippina.gob.mx.repository.EstrategiaRepository;
import com.sippina.gob.mx.repository.MunicipioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Carga los catálogos desde src/main/resources/catalogos/*.csv (separados por |).
 * Es idempotente: si la tabla ya tiene datos, no hace nada.
 */
@Component
public class CatalogosInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CatalogosInitializer.class);

    private final EstrategiaRepository estrategiaRepository;
    private final MunicipioRepository municipioRepository;

    public CatalogosInitializer(EstrategiaRepository estrategiaRepository, MunicipioRepository municipioRepository) {
        this.estrategiaRepository = estrategiaRepository;
        this.municipioRepository = municipioRepository;
    }

    @Override
    public void run(String... args) throws IOException {
        if (municipioRepository.count() == 0) {
            List<Municipio> municipios = new ArrayList<>();
            for (String[] fila : leer("catalogos/municipios-puebla.csv")) {
                municipios.add(new Municipio(fila[0], fila[1]));
            }
            municipioRepository.saveAll(municipios);
            log.info("Catálogo de municipios cargado: {}", municipios.size());
        }
        if (estrategiaRepository.count() == 0) {
            List<Estrategia> estrategias = new ArrayList<>();
            for (String[] fila : leer("catalogos/estrategias-proespinna.csv")) {
                estrategias.add(new Estrategia("PROESPINNA", fila[0], fila[1]));
            }
            estrategiaRepository.saveAll(estrategias);
            log.info("Catálogo de estrategias PROESPINNA cargado: {}", estrategias.size());
        }
    }

    private List<String[]> leer(String ruta) throws IOException {
        List<String[]> filas = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                new ClassPathResource(ruta).getInputStream(), StandardCharsets.UTF_8))) {
            String linea;
            while ((linea = br.readLine()) != null) {
                if (linea.isBlank()) continue;
                filas.add(linea.strip().split("\\|", 2));
            }
        }
        return filas;
    }
}
