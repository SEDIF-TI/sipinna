package com.sippina.gob.mx.service;

import com.sippina.gob.mx.exception.TokenRecuperacionInvalidoException;
import com.sippina.gob.mx.model.TokenRecuperacion;
import com.sippina.gob.mx.model.Usuario;
import com.sippina.gob.mx.repository.TokenRecuperacionRepository;
import com.sippina.gob.mx.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecuperacionService {

    private static final SecureRandom ALEATORIO = new SecureRandom();

    private final UsuarioRepository usuarioRepository;
    private final TokenRecuperacionRepository tokenRecuperacionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditoriaService auditoriaService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.recuperacion.minutos}")
    private long minutosValidez;

    // Paso 1 del diagrama: "Ingresar correo" -> "Generar token" -> "Enviar enlace"
    @Transactional
    public void solicitar(String correo) {
        usuarioRepository.findByCorreo(correo)
                .filter(Usuario::isActivo)
                .ifPresent(usuario -> {
                    // Un enlace nuevo invalida los anteriores que no se usaron
                    tokenRecuperacionRepository.findByUsuarioIdAndUsadoFalse(usuario.getId())
                            .forEach(t -> t.setUsado(true));

                    String token = generarToken();
                    tokenRecuperacionRepository.save(new TokenRecuperacion(
                            usuario, hash(token), LocalDateTime.now().plusMinutes(minutosValidez)));

                    String enlace = frontendUrl + "/restablecer-password?token=" + token;
                    // TODO: enviar por correo. Por ahora, solo en el log (SOLO DESARROLLO)
                    log.info("[SOLO DESARROLLO] Enlace de recuperación para {}: {}", usuario.getCorreo(), enlace);

                    auditoriaService.registrar(usuario.getUsername(), "SOLICITUD_RECUPERACION", null);
                });
        // Si el correo no existe no hacemos nada, y la respuesta es la misma (no revelamos qué correos existen)
    }

    // Paso 2 del diagrama: "¿Token válido y contraseña válida?" -> "Generar hash y actualizar" -> "Invalidar token"
    @Transactional
    public void restablecer(String token, String nuevaPassword) {
        TokenRecuperacion recuperacion = tokenRecuperacionRepository.findByTokenHash(hash(token))
                .filter(t -> !t.isUsado())
                .filter(t -> t.getExpiracion().isAfter(LocalDateTime.now()))
                .orElseThrow(TokenRecuperacionInvalidoException::new);

        Usuario usuario = recuperacion.getUsuario();
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        recuperacion.setUsado(true);

        auditoriaService.registrar(usuario.getUsername(), "PASSWORD_RESTABLECIDA", null);
    }

    // 32 bytes aleatorios en Base64 URL-safe (43 caracteres, se pueden poner en un enlace)
    private String generarToken() {
        byte[] bytes = new byte[32];
        ALEATORIO.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    // SHA-256 en hexadecimal (64 caracteres)
    private String hash(String token) {
        try {
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(sha256.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }
}
