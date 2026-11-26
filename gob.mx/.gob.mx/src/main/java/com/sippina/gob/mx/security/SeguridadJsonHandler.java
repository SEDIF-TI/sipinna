package com.sippina.gob.mx.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class SeguridadJsonHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

    // 401: ruta protegida sin token válido
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException ex) throws IOException {
        escribir(response, HttpStatus.UNAUTHORIZED,
                "Debes iniciar sesión para acceder a este recurso", request.getRequestURI());
    }

    // 403: token válido, pero el rol no tiene permiso
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException ex) throws IOException {
        escribir(response, HttpStatus.FORBIDDEN,
                "No tienes permiso para realizar esta acción", request.getRequestURI());
    }

    private void escribir(HttpServletResponse response, HttpStatus status,
                          String mensaje, String ruta) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        String json = """
                {"status":%d,"error":"%s","mensaje":"%s","ruta":"%s","fecha":"%s","detalles":null}"""
                .formatted(status.value(), status.getReasonPhrase(), mensaje,
                        ruta.replace("\"", ""), LocalDateTime.now());
        response.getWriter().write(json);
    }
}