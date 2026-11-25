package com.sippina.gob.mx.security;

import com.sippina.gob.mx.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey clave;
    private final long expiracionMinutos;

    public JwtService(@Value("${jwt.secret}") String secretoBase64,
                      @Value("${jwt.expiration-minutes}") long expiracionMinutos) {
        this.clave = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretoBase64));
        this.expiracionMinutos = expiracionMinutos;
    }

    /** Crea el Access Token: identifica al usuario, incluye ID y rol, tiene expiración. */
    public String generarToken(Usuario usuario) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(usuario.getUsername())
                .claim("id", usuario.getId())
                .claim("rol", usuario.getRol().getNombre())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plus(expiracionMinutos, ChronoUnit.MINUTES)))
                .signWith(clave)
                .compact();
    }

    /** Verifica firma y expiración. Si algo está mal, lanza una JwtException. */
    public Claims validarYLeer(String token) {
        return Jwts.parser()
                .verifyWith(clave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpiracionSegundos() {
        return expiracionMinutos * 60;
    }
}