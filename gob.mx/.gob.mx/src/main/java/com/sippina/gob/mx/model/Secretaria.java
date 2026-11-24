package com.sippina.gob.mx.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "secretarias")
@Getter @Setter @NoArgsConstructor
public class Secretaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String nombre;

    @Column(length = 20)
    private String siglas;

    @Column(nullable = false)
    private boolean activo = true;

    public Secretaria(String nombre, String siglas) {
        this.nombre = nombre;
        this.siglas = siglas;
    }
}