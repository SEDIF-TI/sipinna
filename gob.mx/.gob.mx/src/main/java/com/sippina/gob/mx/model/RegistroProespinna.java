package com.sippina.gob.mx.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/** Una fila del formato de seguimiento PROESPINNA, capturada por una secretaría. */
@Entity
@Table(name = "registros_proespinna")
@Getter @Setter @NoArgsConstructor
public class RegistroProespinna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "secretaria_id", nullable = false)
    private Secretaria secretaria;

    @ManyToOne(optional = false)
    @JoinColumn(name = "periodo_id", nullable = false)
    private PeriodoCaptura periodo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "estrategia_id", nullable = false)
    private Estrategia estrategia;

    @Column(name = "dependencia_asociada", length = 255)
    private String dependenciaAsociada;

    @Column(name = "accion_puntual", nullable = false, columnDefinition = "TEXT")
    private String accionPuntual;

    @Column(name = "nombre_actividad", nullable = false, length = 255)
    private String nombreActividad;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private Cobertura cobertura;

    @ManyToMany
    @JoinTable(name = "registro_proespinna_municipio",
            joinColumns = @JoinColumn(name = "registro_id"),
            inverseJoinColumns = @JoinColumn(name = "municipio_id"))
    private Set<Municipio> municipios = new HashSet<>();

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_conclusion", nullable = false)
    private LocalDate fechaConclusion;

    @Embedded
    private BeneficiariosProespinna beneficiarios = new BeneficiariosProespinna();

    /** Se guarda calculado para que los reportes sumen rápido. */
    @Column(name = "total_nna", nullable = false)
    private int totalNna;

    @Column(columnDefinition = "TEXT")
    private String comentarios;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private EstatusRegistro estatus = EstatusRegistro.BORRADOR;

    @ManyToOne(optional = false)
    @JoinColumn(name = "creado_por", nullable = false)
    private Usuario creadoPor;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    @PrePersist
    void alCrear() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = fechaCreacion;
    }

    @PreUpdate
    void alActualizar() {
        fechaActualizacion = LocalDateTime.now();
    }
}
