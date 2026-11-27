package com.sippina.gob.mx.controller;

import com.sippina.gob.mx.dto.LoginRequest;
import com.sippina.gob.mx.dto.LoginResponse;
import com.sippina.gob.mx.dto.RestablecerPasswordRequest;
import com.sippina.gob.mx.dto.SolicitudRecuperacionRequest;
import com.sippina.gob.mx.dto.UsuarioActualResponse;
import com.sippina.gob.mx.service.AuthService;
import com.sippina.gob.mx.service.RecuperacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RecuperacionService recuperacionService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioActualResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.usuarioActual(authentication.getName()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        authService.logout(authorization.substring("Bearer ".length()));
        return ResponseEntity.ok(Map.of("mensaje", "Sesión cerrada correctamente"));
    }

    // "¿Olvidó su contraseña?" -> siempre la misma respuesta, exista o no el correo
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody SolicitudRecuperacionRequest request) {
        recuperacionService.solicitar(request.correo());
        return ResponseEntity.ok(Map.of("mensaje",
                "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña"));
    }

    // "Usuario establece nueva contraseña" -> "Contraseña restablecida correctamente"
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody RestablecerPasswordRequest request) {
        recuperacionService.restablecer(request.token(), request.nuevaPassword());
        return ResponseEntity.ok(Map.of("mensaje", "Contraseña restablecida correctamente"));
    }
}
