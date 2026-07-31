import { InformeAprendizajeEncabezado } from './informe-aprendizaje-documento.interface';
import { CriterioDefensaProyecto, CriterioNota10 } from './evaluacion-empresarial.interface';

export interface EvaluacionInstituto {

    estudiante:{

        nombre:string;

        cedula:string;

    };

    encabezado:InformeAprendizajeEncabezado;

    defensaProyecto:CriterioDefensaProyecto[];

    tema:string;

    parametrosProyecto:CriterioNota10[];

    notaFinalEmpresa:number;

    observaciones:string;

    /** id_evaluacion_instituto real si ya existe una evaluación guardada para esta práctica. */
    idEvaluacion?:number;

}
