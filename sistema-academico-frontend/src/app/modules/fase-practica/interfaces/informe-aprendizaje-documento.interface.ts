export interface InformeAprendizajeEncabezado {

    empresaFormadora:string;

    nivel:string;

    cicloAcademico:string;

    fechaInicioFasePractica:string;

    fechaFinFasePractica:string;

    tutorAcademico:string;

    nucleoEstructurante:string;

    tutorEmpresarial:string;

    carrera:string;

    objetivoNucleoEstructurante:string;

}

export interface InformeAprendizajeSemana {

    semana:number;

    fechaInicio:string;

    fechaFin:string;

    puestoAprendizaje:string;

    actividadesRealizadas:string;

    actividadesAutonomas:string;

}

export interface InformeAprendizajeDocumento {

    estudiante:{

        nombre:string;

        cedula:string;

    };

    encabezado:InformeAprendizajeEncabezado;

    semanas:InformeAprendizajeSemana[];

    reflexionAprendizaje:string;

    observacionesEmpresa:string;

}
