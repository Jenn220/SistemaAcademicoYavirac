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
  periodo: string;
  nucleo: string;
  tutorAcademico: string;
  coordinador: string;
  tutorEmpresarial: string;
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
    estudianteNombre: string;
    estudianteCedula: string;
    carrera: string;
    nivel: string;
    periodoAcademico: string;
    entidadReceptora: string;
    tutorAcademico: string;
    coordinador: string;
    tutorEmpresarial: string;
  };
  textoLegal: string[];
  anexos: string[];
  estudiantes: EstudianteActaEntorno[];
  firmas: FirmasActaEntorno;
}