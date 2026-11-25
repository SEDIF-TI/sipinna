package com.sippina.gob.mx.config;

import com.sippina.gob.mx.repository.UsuarioRepository;

import java.util.ArrayList;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import java.util.List;


@Configuration
@EnableWebSecurity 
public class SecurityConfig {
     @Bean
     public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
     }
       @Bean
     public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
     }
         @Bean
     public UserDetailsService userDetailsService(UsuarioRepository repo) {
        return identificador -> repo.findByCorreoOrUsername(identificador, identificador)
            .map(u -> {
                List<SimpleGrantedAuthority> autoridades = new ArrayList<>();
                autoridades.add(new SimpleGrantedAuthority("ROLE_" + u.getRol().getNombre()));
                u.getRol().getPermisos()
                    .forEach(p -> autoridades.add(new SimpleGrantedAuthority(p.getNombre())));

                return User.withUsername(u.getUsername())
                    .password(u.getPassword())
                    .authorities(autoridades)
                    .disabled(!u.isActivo())
                    .build();
            })
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
     }

     @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated())
            .httpBasic(basic -> {});   // temporal, solo para probar
        return http.build();
    }
}
