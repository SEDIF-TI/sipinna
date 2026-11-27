package com.sippina.gob.mx.service;

import com.sippina.gob.mx.dto.LoginRequest;
import com.sippina.gob.mx.dto.LoginResponse;
import com.sippina.gob.mx.dto.UsuarioActualResponse;
import com.sippina.gob.mx.model.Permiso;
import com.sippina.gob.mx.model.TokenRevocado;
import com.sippina.gob.mx.model.Usuario;
import com.sippina.gob.mx.repository.TokenRevocadoRepository;
import com.sippina.gob.mx.repository.UsuarioRepository;
import com.sippina.gob.mx.security.JwtService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final TokenRevocadoRepository tokenRevocadoRepository;
    private final JwtService jwtService;
    private final AuditoriaService auditoriaService;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        // 1. Valida usuario, estado activo y contraseña. Si falla, se audita y se relanza la excepción.
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.identificador(), request.password()));
        } catch (AuthenticationException e) {
            auditoriaService.registrar(request.identificador(), "LOGIN_FALLIDO", null);
            throw e;
        }

        // 2. Ya autenticado: traemos la entidad completa
        Usuario usuario = usuarioRepository
                .findByCorreoOrUsername(request.identificador(), request.identificador())
                .orElseThrow();

        // 3. Último acceso (se guarda solo al terminar, gracias a @Transactional)
        usuario.setUltimoAcceso(LocalDateTime.now());
        auditoriaService.registrar(usuario.getUsername(), "LOGIN_EXITOSO", null);

        // 4. Access Token
        return new LoginResponse(
                jwtService.generarToken(usuario),
                "Bearer",
                jwtService.getExpiracionSegundos(),
                usuario.getId(),
                usuario.getUsername(),
                usuario.getRol().getNombre(),
                nombresDePermisos(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioActualResponse usuarioActual(String username) {
        Usuario usuario = usuarioRepository.findByCorreoOrUsername(username, username).orElseThrow();

        return new UsuarioActualResponse(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getCorreo(),
                usuario.getRol().getNombre(),
                usuario.getSecretaria() != null ? usuario.getSecretaria().getNombre() : null,
                nombresDePermisos(usuario));
    }

    // Cierre de sesión: el token queda en la lista negra hasta que caduque
    @Transactional
    public void logout(String token) {
        Claims claims = jwtService.validarYLeer(token);
        if (!tokenRevocadoRepository.existsByJti(claims.getId())) {
            LocalDateTime expira = LocalDateTime.ofInstant(
                    claims.getExpiration().toInstant(), ZoneId.systemDefault());
            tokenRevocadoRepository.save(new TokenRevocado(claims.getId(), expira));
            auditoriaService.registrar(claims.getSubject(), "LOGOUT", null);
        }
    }

    private Set<String> nombresDePermisos(Usuario usuario) {
        return usuario.getRol().getPermisos().stream()
                .map(Permiso::getNombre)
                .collect(Collectors.toSet());
    }
}
