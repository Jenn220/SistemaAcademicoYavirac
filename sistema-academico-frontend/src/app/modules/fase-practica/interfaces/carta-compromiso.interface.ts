export interface Estudiante{

    nombre:string;

    cedula:string;

    carrera:string;

    curso:string;

}

export interface EspacioFirma{

    lugar:string;

    fecha:string;

}

export interface CartaCompromiso{

    encabezado:string;

    cuerpo:string[];

    prohibicionesIntro:string;

    prohibiciones:string[];

    compromisosIntro:string;

    compromisosConfidencialidad:string[];

    cierre:string[];

    estudiante:Estudiante;

    empresaAsignada:string;

    espacioFirma:EspacioFirma;

}
