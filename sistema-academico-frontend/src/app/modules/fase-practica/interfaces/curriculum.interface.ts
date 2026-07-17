export interface CurriculumDatosPersonales {

    nombre:string;

    cedula:string;

    estadoCivil:string;

    telefono:string;

    domicilio:string;

    emailInstitucional:string;

}

export interface CurriculumDatoAcademico {

    anio:string;

    institucion:string;

    tituloMencion:string;

    notaFinal:string;

}

export interface CurriculumExperienciaLaboral {

    anio:string;

    institucion:string;

    cargo:string;

    actividades:string;

}

export interface CurriculumPracticaDual {

    anio:string;

    institucion:string;

    puestoAprendizaje:string;

    actividades:string;

}

export interface CurriculumInformacionAdicional {

    anio:string;

    institucion:string;

    logro:string;

    detalle:string;

}

export interface Curriculum {

    periodoAcademico:string;

    datosPersonales:CurriculumDatosPersonales;

    datosAcademicos:CurriculumDatoAcademico[];

    experienciaLaboral:CurriculumExperienciaLaboral[];

    practicasDuales:CurriculumPracticaDual[];

    informacionAdicional:CurriculumInformacionAdicional[];

}
