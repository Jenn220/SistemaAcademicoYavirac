export interface Registro{

    fecha:string;

    horaIngreso:string;

    almuerzo:string;

    horaSalida:string;

    horasDia:number;

    firma:string;

    observaciones:string;

}

export interface RegistroAsistencia{

    estudiante:{

        nombre:string;

        cedula:string;

        email:string;

        telefono:string;

        tipoSangre:string;

    };

    empresa:string;

    carrera:string;

    curso:string;

    periodoAcademico:string;

    nucleoEstructurante:string;

    tutorAcademico:string;

    tutorEmpresarial:string;

    contactoEmergenciaNombre:string;

    contactoEmergenciaTelefono:string;

    registros:Registro[];

    horasAutonomas:number;

    subtotalHorasPractica:number;

}
