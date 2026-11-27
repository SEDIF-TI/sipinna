package com.sippina.gob.mx.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** Trimestre que la Secretaría Ejecutiva abre o cierra para la captura. */
@Entity
@Table(name = "periodos_captura", uniqueConstraints = @UniqueConstraint(columnNames = {"anio", "trimestre"}))
@Getter @Setter @NoArgsConstructor
public class PeriodoCaptura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int anio;

    @Column(nullable = false)
    private int trimestre;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(nullable = false)
    private boolean abierto;
}
