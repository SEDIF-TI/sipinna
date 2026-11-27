package com.sippina.gob.mx.service;

import com.sippina.gob.mx.dto.AuditoriaResponse;
import com.sippina.gob.mx.model.Auditoria;
import com.sippina.gob.mx.repository.AuditoriaRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;

    // REQUIRES_NEW: se guarda en su propia transacción, aunque la operación que la llama falle
    // (así un LOGIN_FALLIDO queda registrado aunque el login lance una excepción)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(String usuario, String accion, String detalle) {
        auditoriaRepository.save(new Auditoria(usuario, accion, detalle, ipActual()));
    }

    @Transactional(readOnly = true)
    public List<AuditoriaResponse> recientes() {
        return auditoriaRepository.findTop100ByOrderByFechaDesc().stream()
                .map(AuditoriaResponse::de)
                .toList();
    }

    // IP de quien hace la petición (X-Forwarded-For cuando hay un proxy, como Nginx en producción)
    private String ipActual() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes atributos) {
            HttpServletRequest request = atributos.getRequest();
            String reenviada = request.getHeader("X-Forwarded-For");
            if (reenviada != null && !reenviada.isBlank()) {
                return reenviada.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
        return null;
    }
}
