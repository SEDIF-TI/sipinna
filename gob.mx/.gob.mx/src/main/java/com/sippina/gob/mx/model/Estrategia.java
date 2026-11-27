package com.sippina.gob.mx.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Catálogo de estrategias prioritarias (hoja 2 del Excel PROESPINNA). */
@Entity
@Table(name = "estrategias", uniqueConstraints = @UniqueConstraint(columnNames = {"programa", "clave"}))
@Getter @Setter @NoArgsConstructor
public class Estrategia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String programa;

    @Column(nullable = false, length = 10)
    private String clave;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    private boolean activo = true;

    public Estrategia(String programa, String clave, String descripcion) {
        this.programa = programa;
        this.clave = clave;
        this.descripcion = descripcion;
    }
}
