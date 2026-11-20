package com.sippina.gob.mx.config;

import com.sippina.gob.mx.model.Rol;
import com.sippina.gob.mx.model.Usuario;
import com.sippina.gob.mx.repository.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner cargarUsuarios(UsuarioRepository repo,
                                     PasswordEncoder encoder,
                                     @Value("${SEED_ADMIN_PASSWORD:}") String passAdmin,
                                     @Value("${SEED_USER_PASSWORD:}") String passUser) {
        return args -> {
            crear(repo, encoder, "admin", "admin@sipinna.local", passAdmin, Rol.ADMINISTRADOR);
            crear(repo, encoder, "usuario", "usuario@sipinna.local", passUser, Rol.USUARIO);
        };
    }

    private void crear(UsuarioRepository repo, PasswordEncoder encoder,
                       String username, String correo, String password, Rol rol) {
        if (password.isBlank()) {
            log.warn("Sin contraseña inicial para '{}': usuario no creado", username);
            return;
        }
        if (repo.findByCorreoOrUsername(correo, username).isEmpty()) {
            Usuario u = new Usuario();
            u.setUsername(username);
            u.setCorreo(correo);
            u.setPassword(encoder.encode(password));
            u.setRol(rol);
            u.setActivo(true);
            repo.save(u);
        }
    }
}