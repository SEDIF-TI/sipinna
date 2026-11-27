package com.sippina.gob.mx.model;

/**
 * Ciclo de vida de un registro capturado.
 * BORRADOR -> ENVIADO (Bloque F)
 * ENVIADO -> EN_REVISION -> APROBADO u OBSERVADO; OBSERVADO -> ENVIADO (Bloque G)
 * Se declaran todos desde ahora porque Hibernate crea una restricción CHECK
 * con los valores del enum al crear la tabla.
 */
public enum EstatusRegistro {
    BORRADOR,
    ENVIADO,
    EN_REVISION,
    OBSERVADO,
    APROBADO;

    /** Solo se puede editar lo que aún no se envía o lo que la revisión regresó. */
    public boolean esEditable() {
        return this == BORRADOR || this == OBSERVADO;
    }
}
