package com.sippina.gob.mx.security;

import com.sippina.gob.mx.model.Rol;
import com.sippina.gob.mx.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    // Clave de 64 bytes solo para pruebas (nunca la real)
    private final String secretoPrueba = Base64.getEncoder().encodeToString(
            "clave-de-prueba-de-64-bytes-solo-para-tests-no-usar-en-produccion".getBytes(StandardCharsets.UTF_8));

    private final JwtService jwtService = new JwtService(secretoPrueba, 60);

    private Usuario usuarioDePrueba() {
        Usuario u = new Usuario();
        u.setId(1L);
        u.setUsername("admin");
        u.setRol(new Rol(Rol.ADMINISTRADOR));
        return u;
    }

    @Test
    void generaTokenConUsuarioIdYRol() {
        String token = jwtService.generarToken(usuarioDePrueba());
        Claims claims = jwtService.validarYLeer(token);

        assertEquals("admin", claims.getSubject());
        assertEquals(1L, claims.get("id", Long.class));
        assertEquals("ADMINISTRADOR", claims.get("rol", String.class));
        assertNotNull(claims.getExpiration());
        assertNotNull(claims.getId());
    }

    @Test
    void rechazaTokenConRolFalsificado() {
        String token = jwtService.generarToken(usuarioDePrueba());
        String[] partes = token.split("\\.");

        // Alguien cambia el payload para hacerse SUPERADMINISTRADOR, pero conserva la firma original
        String payloadFalso = Base64.getUrlEncoder().withoutPadding().encodeToString(
                "{\"sub\":\"admin\",\"id\":1,\"rol\":\"SUPERADMINISTRADOR\"}".getBytes(StandardCharsets.UTF_8));
        String tokenFalso = partes[0] + "." + payloadFalso + "." + partes[2];

        assertThrows(JwtException.class, () -> jwtService.validarYLeer(tokenFalso));
    }

    @Test
    void rechazaTokenCaducado() {
        JwtService servicioQueCaducaAlInstante = new JwtService(secretoPrueba, -1);
        String token = servicioQueCaducaAlInstante.generarToken(usuarioDePrueba());

        assertThrows(ExpiredJwtException.class, () -> jwtService.validarYLeer(token));
    }
}