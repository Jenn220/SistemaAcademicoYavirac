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

    };

    empresa:string;

    registros:Registro[];

    horasAutonomas:number;

    subtotalHorasPractica:number;

}