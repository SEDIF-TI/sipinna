package com.sippina.gob.mx.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens_recuperacion")
@Getter @Setter @NoArgsConstructor
public class TokenRecuperacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // Solo guardamos el HASH (SHA-256) del token, nunca el token en claro
    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(nullable = false)
    private LocalDateTime expiracion;

    @Column(nullable = false)
    private boolean usado = false;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    public TokenRecuperacion(Usuario usuario, String tokenHash, LocalDateTime expiracion) {
        this.usuario = usuario;
        this.tokenHash = tokenHash;
        this.expiracion = expiracion;
        this.fechaCreacion = LocalDateTime.now();
    }
}
