package com.sippina.gob.mx.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Catálogo de los 217 municipios de Puebla con su clave INEGI. */
@Entity
@Table(name = "municipios")
@Getter @Setter @NoArgsConstructor
public class Municipio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 3)
    private String clave;

    @Column(nullable = false, length = 100)
    private String nombre;

    public Municipio(String clave, String nombre) {
        this.clave = clave;
        this.nombre = nombre;
    }
}
