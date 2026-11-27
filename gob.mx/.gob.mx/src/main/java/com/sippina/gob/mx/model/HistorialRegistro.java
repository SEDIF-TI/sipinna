package com.sippina.gob.mx.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Cada cambio de estatus de un registro: quién lo hizo, cuándo y con qué comentario.
 * Es el "apartado de estatus" que se ve después del formulario.
 */
@Entity
@Table(name = "historial_registros")
@Getter @Setter @NoArgsConstructor
public class HistorialRegistro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registro_id", nullable = false)
    private RegistroProespinna registro;

    /** null cuando el registro se acaba de crear. */
    @Enumerated(EnumType.STRING)
    @Column(name = "estatus_anterior", length = 15)
    private EstatusRegistro estatusAnterior;

    @Enumerated(EnumType.STRING)
    @Column(name = "estatus_nuevo", nullable = false, length = 15)
    private EstatusRegistro estatusNuevo;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private LocalDateTime fecha;

    public HistorialRegistro(RegistroProespinna registro, EstatusRegistro anterior, EstatusRegistro nuevo,
                             String comentario, Usuario usuario) {
        this.registro = registro;
        this.estatusAnterior = anterior;
        this.estatusNuevo = nuevo;
        this.comentario = comentario;
        this.usuario = usuario;
        this.fecha = LocalDateTime.now();
    }
}
