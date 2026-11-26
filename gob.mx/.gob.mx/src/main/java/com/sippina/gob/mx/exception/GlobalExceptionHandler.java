package com.sippina.gob.mx.exception;

import com.sippina.gob.mx.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 400: faltan campos o vienen vacíos (@Valid + @NotBlank)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> datosInvalidos(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> detalles = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> detalles.putIfAbsent(e.getField(), e.getDefaultMessage()));
        return responder(HttpStatus.BAD_REQUEST, "Datos incompletos o inválidos", request, detalles);
    }

    // 400: el cuerpo no es un JSON válido
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> jsonMalFormado(HttpServletRequest request) {
        return responder(HttpStatus.BAD_REQUEST, "El cuerpo de la petición no es un JSON válido", request, null);
    }

    // 401: usuario inexistente, inactivo o contraseña incorrecta (un solo mensaje)
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> credencialesInvalidas(HttpServletRequest request) {
        return responder(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos", request, null);
    }

    // 403: autenticado pero sin permiso (Parte 5)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> accesoDenegado(HttpServletRequest request) {
        return responder(HttpStatus.FORBIDDEN, "No tienes permiso para realizar esta acción", request, null);
    }

    // 404: la ruta no existe
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> noEncontrado(HttpServletRequest request) {
        return responder(HttpStatus.NOT_FOUND, "Recurso no encontrado", request, null);
    }

    // 405: la ruta existe pero con otro método (GET en vez de POST)
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> metodoNoPermitido(HttpServletRequest request) {
        return responder(HttpStatus.METHOD_NOT_ALLOWED, "Método HTTP no permitido para esta ruta", request, null);
    }

    // 409: viola una restricción de la base (ej. dos usuarios en la misma secretaría)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> conflicto(HttpServletRequest request) {
        return responder(HttpStatus.CONFLICT, "El registro entra en conflicto con datos existentes", request, null);
    }

    // 500: cualquier otro error. Se registra en el log, pero NO se le muestra el detalle al usuario
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> errorInesperado(Exception ex, HttpServletRequest request) {
        log.error("Error inesperado en {}", request.getRequestURI(), ex);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado", request, null);
    }

    private ResponseEntity<ErrorResponse> responder(HttpStatus status, String mensaje,
                                                    HttpServletRequest request, Map<String, String> detalles) {
        return ResponseEntity.status(status)
                .body(ErrorResponse.of(status, mensaje, request.getRequestURI(), detalles));
    }
}