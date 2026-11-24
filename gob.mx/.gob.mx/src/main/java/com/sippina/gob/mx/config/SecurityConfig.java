package com.sippina.gob.mx.config;

import com.sippina.gob.mx.repository.UsuarioRepository;



import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableWebSecurity 
public class SecurityConfig {
     @Bean
     public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
     }
     @Bean
     public UserDetailsService userDetailsService(UsuarioRepository repo){
        return identificador -> repo.findByCorreoOrUsername(identificador, identificador)
        .map(u -> User.withUsername(u.getUsername())
        .password(u.getPassword())
        .roles(u.getRol().name())
        .disabled(!u.isActivo())
        .build())
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
