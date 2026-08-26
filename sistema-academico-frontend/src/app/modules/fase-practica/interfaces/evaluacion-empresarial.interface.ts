import { InformeAprendizajeEncabezado } from './informe-aprendizaje-documento.interface';

export interface CriterioNota10 {

    criterio:string;

    nota:number;

    /** id_item real del catálogo de rúbricas, si ya se cargó desde el back. */
    idItem?:number;

    /** id_detalle_evaluacion real si ya existe una nota guardada para este criterio. */
    idDetalle?:number;

}

export interface CriterioDefensaProyecto {

    criterio:string;

    nota:number;

    /** id_item real del catálogo de rúbricas, si ya se cargó desde el back. */
    idItem?:number;

    /** id_detalle_evaluacion real si ya existe una nota guardada para este criterio. */
    idDetalle?:number;

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

    /** id_evaluacion_empresa real si ya existe una evaluación guardada para esta práctica. */
    idEvaluacion?:number;

}
