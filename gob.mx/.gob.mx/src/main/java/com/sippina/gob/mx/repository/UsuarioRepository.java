package com.sippina.gob.mx.repository;

import com.sippina.gob.mx.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCorreoOrUsername(String correo, String username);
}
