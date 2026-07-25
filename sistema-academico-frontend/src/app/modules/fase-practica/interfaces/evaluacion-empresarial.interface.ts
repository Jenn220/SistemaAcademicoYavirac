import { InformeAprendizajeEncabezado } from './informe-aprendizaje-documento.interface';

export interface CriterioNota10 {

    criterio:string;

    nota:number;

}

export interface CriterioDefensaProyecto {

    criterio:string;

    nota:number;

}

export interface EvaluacionEmpresarial {

    estudiante:{

        nombre:string;

        cedula:string;

    };

    encabezado:InformeAprendizajeEncabezado;

    desempeno:CriterioNota10[];

    defensaProyecto:CriterioDefensaProyecto[];

    observaciones:string;

}
