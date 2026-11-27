package com.sippina.gob.mx.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria")
@Getter @Setter @NoArgsConstructor
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quién (username, o lo que escribió si el login falló)
    @Column(length = 150)
    private String usuario;

    // Qué: LOGIN_EXITOSO, LOGIN_FALLIDO, LOGOUT, SOLICITUD_RECUPERACION, PASSWORD_RESTABLECIDA...
    @Column(nullable = false, length = 50)
    private String accion;

    @Column(length = 255)
    private String detalle;

    // Desde dónde (IPv6 llega a medir hasta 45 caracteres)
    @Column(length = 45)
    private String ip;

    @Column(nullable = false)
    private LocalDateTime fecha;

    public Auditoria(String usuario, String accion, String detalle, String ip) {
        this.usuario = usuario;
        this.accion = accion;
        this.detalle = detalle;
        this.ip = ip;
        this.fecha = LocalDateTime.now();
    }
}
