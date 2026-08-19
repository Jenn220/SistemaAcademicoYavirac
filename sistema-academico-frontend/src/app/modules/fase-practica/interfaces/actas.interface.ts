export interface ActaInduccionSeguridad {
  lugarFecha: string;
  estudiante: {
    nombre: string;
    cedula: string;
    nivel: string;
    carrera: string;
  };
  empresa: {
    razonSocial: string;
  };
  textoLegal: string[];
  firmaEstudiante: string;
}

export interface EstudianteActaEntorno {
  no: number;
  nombre: string;
  cedula: string;
  nivel: string;
  nota: string;
  firma: string;
}

export interface FirmasActaEntorno {
  tutorEmpresarial: {
    nombre: string;
    cedula: string;
  };
  coordinador: {
    nombre: string;
    cedula: string;
  };
  tutorAcademico: {
    nombre: string;
    cedula: string;
  };
}

export interface ActaEntornoLaboral {
  encabezado: {
    instituto: string;
    titulo: string;
    fecha: string;
    carrera: string;
    periodoAcademico: string;
    entidadReceptora: string;
  };
  textoLegal: string[];
  anexos: string[];
  estudiantes: EstudianteActaEntorno[];
  firmas: FirmasActaEntorno;
}

/** Estudiante de la misma empresa/tutor empresarial/docente, candidato a agregar al listado del acta. */
export interface CandidatoActaEntorno {
  id_practica: number;
  nombre: string;
  cedula: string;
  nivel: string;
  nota: string;
}