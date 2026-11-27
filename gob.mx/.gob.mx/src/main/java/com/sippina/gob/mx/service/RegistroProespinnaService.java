package com.sippina.gob.mx.service;

import com.sippina.gob.mx.dto.BeneficiariosDto;
import com.sippina.gob.mx.dto.HistorialItem;
import com.sippina.gob.mx.dto.ItemCatalogo;
import com.sippina.gob.mx.dto.RegistroProespinnaRequest;
import com.sippina.gob.mx.dto.RegistroProespinnaResponse;
import com.sippina.gob.mx.exception.NegocioException;
import com.sippina.gob.mx.model.*;
import com.sippina.gob.mx.repository.EstrategiaRepository;
import com.sippina.gob.mx.repository.MunicipioRepository;
import com.sippina.gob.mx.repository.RegistroProespinnaRepository;
import com.sippina.gob.mx.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;

/**
 * Captura del formato PROESPINNA.
 * Cada usuario trabaja solo con los registros de SU secretaría.
 */
@Service
public class RegistroProespinnaService {

    private static final String PROGRAMA = "PROESPINNA";

    private final RegistroProespinnaRepository registroRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstrategiaRepository estrategiaRepository;
    private final MunicipioRepository municipioRepository;
    private final PeriodoService periodoService;
    private final AuditoriaService auditoriaService;
    private final HistorialRegistroService historialService;

    public RegistroProespinnaService(RegistroProespinnaRepository registroRepository,
                                     UsuarioRepository usuarioRepository,
                                     EstrategiaRepository estrategiaRepository,
                                     MunicipioRepository municipioRepository,
                                     PeriodoService periodoService,
                                     AuditoriaService auditoriaService,
                                     HistorialRegistroService historialService) {
        this.registroRepository = registroRepository;
        this.usuarioRepository = usuarioRepository;
        this.estrategiaRepository = estrategiaRepository;
        this.municipioRepository = municipioRepository;
        this.periodoService = periodoService;
        this.auditoriaService = auditoriaService;
        this.historialService = historialService;
    }

    @Transactional(readOnly = true)
    public List<RegistroProespinnaResponse> misRegistros(String username) {
        Secretaria secretaria = secretariaDe(usuario(username));
        return registroRepository.findBySecretariaIdOrderByFechaCreacionDesc(secretaria.getId()).stream()
                .map(this::aRespuesta)
                .toList();
    }

    @Transactional(readOnly = true)
    public RegistroProespinnaResponse obtener(Long id, String username) {
        return aRespuesta(buscarPropio(id, usuario(username)));
    }

    /** Historial de estatus de un registro de mi secretaría. */
    @Transactional(readOnly = true)
    public List<HistorialItem> historial(Long id, String username) {
        RegistroProespinna r = buscarPropio(id, usuario(username));
        return historialService.de(r.getId());
    }

    @Transactional
    public RegistroProespinnaResponse crear(RegistroProespinnaRequest datos, String username) {
        Usuario u = usuario(username);
        RegistroProespinna r = new RegistroProespinna();
        r.setSecretaria(secretariaDe(u));
        r.setCreadoPor(u);
        aplicar(r, datos);
        r = registroRepository.save(r);
        historialService.registrar(r, null, EstatusRegistro.BORRADOR, "Registro creado", u);
        auditoriaService.registrar(username, "REGISTRO_CREADO", "PROESPINNA #" + r.getId());
        return aRespuesta(r);
    }

    @Transactional
    public RegistroProespinnaResponse editar(Long id, RegistroProespinnaRequest datos, String username) {
        RegistroProespinna r = buscarPropio(id, usuario(username));
        exigirEditable(r);
        aplicar(r, datos);
        auditoriaService.registrar(username, "REGISTRO_EDITADO", "PROESPINNA #" + r.getId());
        return aRespuesta(r);
    }

    @Transactional
    public void eliminar(Long id, String username) {
        RegistroProespinna r = buscarPropio(id, usuario(username));
        if (r.getEstatus() != EstatusRegistro.BORRADOR) {
            throw NegocioException.invalido("Solo se pueden eliminar registros en borrador");
        }
        historialService.borrarDe(r.getId());
        registroRepository.delete(r);
        auditoriaService.registrar(username, "REGISTRO_ELIMINADO", "PROESPINNA #" + id);
    }

    @Transactional
    public RegistroProespinnaResponse enviar(Long id, String username) {
        Usuario u = usuario(username);
        RegistroProespinna r = buscarPropio(id, u);
        exigirEditable(r);
        EstatusRegistro anterior = r.getEstatus();
        // Una corrección pedida por la Ejecutiva se puede reenviar aunque el trimestre ya esté cerrado
        if (anterior == EstatusRegistro.BORRADOR && !r.getPeriodo().isAbierto()) {
            throw NegocioException.invalido("El periodo de captura está cerrado");
        }
        if (r.getTotalNna() == 0) {
            throw NegocioException.invalido("Registra al menos una niña, niño o adolescente beneficiado antes de enviar");
        }
        r.setEstatus(EstatusRegistro.ENVIADO);
        r.setFechaEnvio(LocalDateTime.now());
        historialService.registrar(r, anterior, EstatusRegistro.ENVIADO,
                anterior == EstatusRegistro.OBSERVADO ? "Reenviado con correcciones" : "Enviado a revisión", u);
        auditoriaService.registrar(username, anterior == EstatusRegistro.OBSERVADO ? "REGISTRO_REENVIADO" : "REGISTRO_ENVIADO",
                "PROESPINNA #" + r.getId());
        return aRespuesta(r);
    }

    // ---------- reglas ----------

    /** Copia los datos del formulario al registro, validando las reglas del formato. */
    private void aplicar(RegistroProespinna r, RegistroProespinnaRequest d) {
        PeriodoCaptura periodo = periodoService.buscar(d.periodoId());
        // Al corregir un registro OBSERVADO se permite su mismo periodo aunque ya esté cerrado
        boolean correccionMismoPeriodo = r.getEstatus() == EstatusRegistro.OBSERVADO
                && r.getPeriodo() != null && Objects.equals(r.getPeriodo().getId(), periodo.getId());
        if (!periodo.isAbierto() && !correccionMismoPeriodo) {
            throw NegocioException.invalido("El periodo de captura está cerrado");
        }
        Estrategia estrategia = estrategiaRepository.findById(d.estrategiaId())
                .filter(e -> PROGRAMA.equals(e.getPrograma()) && e.isActivo())
                .orElseThrow(() -> NegocioException.invalido("La estrategia no existe"));
        if (d.fechaConclusion().isBefore(d.fechaInicio())) {
            throw NegocioException.invalido("La fecha de conclusión no puede ser anterior a la de inicio");
        }

        Cobertura cobertura = Cobertura.valueOf(d.cobertura());
        HashSet<Municipio> municipios = new HashSet<>();
        if (cobertura == Cobertura.MUNICIPAL) {
            List<Long> ids = d.municipioIds() == null ? List.of() : d.municipioIds();
            if (ids.isEmpty()) {
                throw NegocioException.invalido("Si la cobertura es municipal, selecciona al menos un municipio");
            }
            municipios.addAll(municipioRepository.findAllById(ids));
            if (municipios.size() != new HashSet<>(ids).size()) {
                throw NegocioException.invalido("Alguno de los municipios no existe");
            }
        }

        r.setPeriodo(periodo);
        r.setEstrategia(estrategia);
        r.setDependenciaAsociada(vacioANull(d.dependenciaAsociada()));
        r.setAccionPuntual(d.accionPuntual().trim());
        r.setNombreActividad(d.nombreActividad().trim());
        r.setDescripcion(d.descripcion().trim());
        r.setCobertura(cobertura);
        r.getMunicipios().clear();
        r.getMunicipios().addAll(municipios);
        r.setFechaInicio(d.fechaInicio());
        r.setFechaConclusion(d.fechaConclusion());

        BeneficiariosDto b = d.beneficiarios();
        BeneficiariosProespinna e = r.getBeneficiarios();
        e.setNinas0a5(b.ninas0a5());
        e.setNinas6a8(b.ninas6a8());
        e.setNinas9a11(b.ninas9a11());
        e.setAdolescentesMujeres12a14(b.adolescentesMujeres12a14());
        e.setAdolescentesMujeres15a17(b.adolescentesMujeres15a17());
        e.setNinos0a5(b.ninos0a5());
        e.setNinos6a8(b.ninos6a8());
        e.setNinos9a11(b.ninos9a11());
        e.setAdolescentesHombres12a14(b.adolescentesHombres12a14());
        e.setAdolescentesHombres15a17(b.adolescentesHombres15a17());
        r.setTotalNna(e.total());

        r.setComentarios(vacioANull(d.comentarios()));
    }

    private void exigirEditable(RegistroProespinna r) {
        if (!r.getEstatus().esEditable()) {
            throw NegocioException.invalido("El registro ya fue enviado y no se puede modificar");
        }
    }

    private Usuario usuario(String username) {
        return usuarioRepository.findByCorreoOrUsername(username, username)
                .orElseThrow(() -> NegocioException.noEncontrado("Usuario no encontrado"));
    }

    private Secretaria secretariaDe(Usuario u) {
        if (u.getSecretaria() == null) {
            throw NegocioException.invalido("Tu cuenta no tiene una secretaría asignada para capturar");
        }
        return u.getSecretaria();
    }

    /** Un registro de otra secretaría se trata como inexistente (404) para no revelar que existe. */
    private RegistroProespinna buscarPropio(Long id, Usuario u) {
        Secretaria s = secretariaDe(u);
        return registroRepository.findById(id)
                .filter(r -> r.getSecretaria().getId().equals(s.getId()))
                .orElseThrow(() -> NegocioException.noEncontrado("El registro no existe"));
    }

    private static String vacioANull(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }

    /** También lo usa SeguimientoService para no repetir el mapeo. */
    RegistroProespinnaResponse aRespuesta(RegistroProespinna r) {
        BeneficiariosProespinna b = r.getBeneficiarios();
        List<ItemCatalogo> municipios = r.getMunicipios().stream()
                .sorted(Comparator.comparing(Municipio::getNombre))
                .map(m -> new ItemCatalogo(m.getId(), m.getClave(), m.getNombre()))
                .toList();
        return new RegistroProespinnaResponse(
                r.getId(),
                r.getEstatus().name(),
                new ItemCatalogo(r.getSecretaria().getId(), r.getSecretaria().getSiglas(), r.getSecretaria().getNombre()),
                PeriodoService.aRespuesta(r.getPeriodo()),
                new ItemCatalogo(r.getEstrategia().getId(), r.getEstrategia().getClave(), r.getEstrategia().getDescripcion()),
                r.getDependenciaAsociada(),
                r.getAccionPuntual(),
                r.getNombreActividad(),
                r.getDescripcion(),
                r.getCobertura().name(),
                municipios,
                r.getFechaInicio(),
                r.getFechaConclusion(),
                new BeneficiariosDto(b.getNinas0a5(), b.getNinas6a8(), b.getNinas9a11(),
                        b.getAdolescentesMujeres12a14(), b.getAdolescentesMujeres15a17(),
                        b.getNinos0a5(), b.getNinos6a8(), b.getNinos9a11(),
                        b.getAdolescentesHombres12a14(), b.getAdolescentesHombres15a17()),
                r.getTotalNna(),
                r.getComentarios(),
                r.getCreadoPor().getUsername(),
                r.getFechaCreacion(),
                r.getFechaActualizacion(),
                r.getFechaEnvio(),
                historialService.ultimaObservacion(r));
    }
}
