package com.sippina.gob.mx.config;

import com.sippina.gob.mx.model.Permiso;
import com.sippina.gob.mx.model.Rol;
import com.sippina.gob.mx.model.Secretaria;
import com.sippina.gob.mx.model.Usuario;
import com.sippina.gob.mx.repository.PermisoRepository;
import com.sippina.gob.mx.repository.RolRepository;
import com.sippina.gob.mx.repository.SecretariaRepository;
import com.sippina.gob.mx.repository.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;

@Slf4j
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner cargarDatosIniciales(PermisoRepository permisoRepo,
                                           RolRepository rolRepo,
                                           SecretariaRepository secretariaRepo,
                                           UsuarioRepository usuarioRepo,
                                           PasswordEncoder encoder,
                                           @Value("${SEED_SUPERADMIN_PASSWORD:}") String passSuper,
                                           @Value("${SEED_ADMIN_PASSWORD:}") String passAdmin,
                                           @Value("${SEED_USER_PASSWORD:}") String passUser) {
        return args -> {
            // 1. Permisos (las acciones del diagrama)
            Permiso capturar    = permiso(permisoRepo, "CAPTURAR", "Capturar información estadística");
            Permiso consultar   = permiso(permisoRepo, "CONSULTAR", "Consultar información registrada");
            Permiso seguimiento = permiso(permisoRepo, "DAR_SEGUIMIENTO", "Revisar y actualizar estatus");
            Permiso reportes    = permiso(permisoRepo, "VER_REPORTES", "Generar reportes o estadísticas");
            Permiso usuarios    = permiso(permisoRepo, "GESTIONAR_USUARIOS", "Administrar usuarios y secretarías");

            // 2. Roles y sus permisos
            rol(rolRepo, Rol.SUPERADMINISTRADOR, capturar, consultar, seguimiento, reportes, usuarios);
            rol(rolRepo, Rol.ADMINISTRADOR, consultar, seguimiento, reportes);
            rol(rolRepo, Rol.USUARIO, capturar, consultar);

            // 3. Secretaría de prueba
            Secretaria prueba = secretariaRepo.findByNombre("Secretaría de Prueba")
                    .orElseGet(() -> secretariaRepo.save(new Secretaria("Secretaría de Prueba", "SP")));

            // 4. Usuarios iniciales
            usuario(usuarioRepo, rolRepo, encoder, "superadmin", "superadmin@sipinna.local", passSuper, Rol.SUPERADMINISTRADOR, null);
            usuario(usuarioRepo, rolRepo, encoder, "admin", "admin@sipinna.local", passAdmin, Rol.ADMINISTRADOR, null);
            usuario(usuarioRepo, rolRepo, encoder, "usuario", "usuario@sipinna.local", passUser, Rol.USUARIO, prueba);
        };
    }

    private Permiso permiso(PermisoRepository repo, String nombre, String descripcion) {
        return repo.findByNombre(nombre)
                .orElseGet(() -> repo.save(new Permiso(nombre, descripcion)));
    }

    private void rol(RolRepository repo, String nombre, Permiso... permisos) {
        Rol rol = repo.findByNombre(nombre).orElseGet(() -> new Rol(nombre));
        rol.setPermisos(new HashSet<>(List.of(permisos)));
        repo.save(rol);
    }

    private void usuario(UsuarioRepository repo, RolRepository rolRepo, PasswordEncoder encoder,
                         String username, String correo, String password,
                         String nombreRol, Secretaria secretaria) {
        if (password.isBlank()) {
            log.warn("Sin contraseña inicial para '{}': usuario no creado", username);
            return;
        }
        if (repo.findByCorreoOrUsername(correo, username).isPresent()) {
            return;
        }
        Usuario u = new Usuario();
        u.setUsername(username);
        u.setCorreo(correo);
        u.setPassword(encoder.encode(password));
        u.setRol(rolRepo.findByNombre(nombreRol).orElseThrow());
        u.setSecretaria(secretaria);
        repo.save(u);
    }
}