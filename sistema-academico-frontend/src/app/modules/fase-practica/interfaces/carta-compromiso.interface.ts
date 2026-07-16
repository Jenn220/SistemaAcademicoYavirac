export interface Estudiante{

    nombre:string;

    cedula:string;

}

export interface EspacioFirma{

    lugar:string;

    fecha:string;

}

export interface CartaCompromiso{

    encabezado:string;

    destinatario:string;

    cuerpo:string[];

    obligaciones:string[];

    prohibiciones:string[];

    compromisosConfidencialidad:string[];

    estudiante:Estudiante;

    espacioFirma:EspacioFirma;

}