export interface CurriculumDatosPersonales {

    nombre:string;

    cedula:string;

    estadoCivil:string;

    telefono:string;

    domicilio:string;

    emailInstitucional:string;

}

export interface CurriculumDatoAcademico {

    /** id_cv_dato_academico real si ya está persistido en el back. */
    id?:number;

    anio:string;

    institucion:string;

    tituloMencion:string;

    notaFinal:string;

}

export interface CurriculumExperienciaLaboral {

    /** id_cv_experiencia_laboral real si ya está persistido en el back. */
    id?:number;

    anio:string;

    institucion:string;

    cargo:string;

    actividades:string;

}

export interface CurriculumPracticaDual {

    /** id_cv_practica_dual real si ya está persistido en el back. */
    id?:number;

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

export interface CurriculumEncabezado {

    carrera:string;

    nivel:string;

    periodoAcademico:string;

    nucleo:string;

    tutorAcademico:string;

    coordinador:string;

    empresa:string;

    tutorEmpresarial:string;

    proyecto:string;

    cobertura:string;

    plazo:string;

    fechaInicio:string;

    fechaFin:string;

}

export interface Curriculum {

    periodoAcademico:string;

    datosPersonales:CurriculumDatosPersonales;

    datosAcademicos:CurriculumDatoAcademico[];

    experienciaLaboral:CurriculumExperienciaLaboral[];

    practicasDuales:CurriculumPracticaDual[];

    informacionAdicional:CurriculumInformacionAdicional[];

    encabezado:CurriculumEncabezado;

}
