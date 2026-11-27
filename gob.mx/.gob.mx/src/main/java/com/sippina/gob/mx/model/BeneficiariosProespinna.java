package com.sippina.gob.mx.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Las 10 columnas de población beneficiada del formato PROESPINNA.
 * @Embeddable: no es tabla propia, sus columnas se guardan dentro de registros_proespinna.
 */
@Embeddable
@Getter @Setter @NoArgsConstructor
public class BeneficiariosProespinna {

    @Column(name = "ninas_0_5", nullable = false) private int ninas0a5;
    @Column(name = "ninas_6_8", nullable = false) private int ninas6a8;
    @Column(name = "ninas_9_11", nullable = false) private int ninas9a11;
    @Column(name = "adol_mujeres_12_14", nullable = false) private int adolescentesMujeres12a14;
    @Column(name = "adol_mujeres_15_17", nullable = false) private int adolescentesMujeres15a17;
    @Column(name = "ninos_0_5", nullable = false) private int ninos0a5;
    @Column(name = "ninos_6_8", nullable = false) private int ninos6a8;
    @Column(name = "ninos_9_11", nullable = false) private int ninos9a11;
    @Column(name = "adol_hombres_12_14", nullable = false) private int adolescentesHombres12a14;
    @Column(name = "adol_hombres_15_17", nullable = false) private int adolescentesHombres15a17;

    public int total() {
        return ninas0a5 + ninas6a8 + ninas9a11 + adolescentesMujeres12a14 + adolescentesMujeres15a17
                + ninos0a5 + ninos6a8 + ninos9a11 + adolescentesHombres12a14 + adolescentesHombres15a17;
    }
}
