import { Module } from '@nestjs/common';
import { TutorEmpresarialEntity } from './domain/tutor-empresarial.entity';
import { NucleoEstructuranteEntity } from './domain/nucleo-estructurante.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticaController } from './controllers/practica.controller';
import { EmpresaController } from './controllers/empresa.controller';
import { DocumentoController } from './controllers/documento.controller';
import { InformeFasePracticaController } from './controllers/informe-fase-practica.controller';
import { CvController } from './controllers/cv.controller';
import { EvaluacionEmpresaController } from './controllers/evaluacion-empresa.controller';
import { EvaluacionInstitutoController } from './controllers/evaluacion-instituto.controller';
import { RubricaController } from './controllers/rubrica.controller';
import { ItemRubricaController } from './controllers/item-rubrica.controller';
import { DetalleEvaluacionController } from './controllers/detalle-evaluacion.controller';
import { PlanRotacionSemanaController } from './controllers/plan-rotacion-semana.controller';
import { PlanMarcoController } from './controllers/plan-marco.controller';
import { ItemPlanMarcoController } from './controllers/item-plan-marco.controller';
import { PerfilEstudianteController } from './controllers/perfil-estudiante.controller';
import { EvaluacionPlanMarcoController } from './controllers/evaluacion-plan-marco.controller';
import { BitacoraSemanalEntity } from './domain/bitacora-semanal.entity';
import { CvDatoAcademicoEntity } from './domain/cv-dato-academico.entity';
import { CvExperienciaLaboralEntity } from './domain/cv-experiencia-laboral.entity';
import { CvPracticaDualEntity } from './domain/cv-practica-dual.entity';
import { DetalleEvaluacionEntity } from './domain/detalle-evaluacion.entity';
import { DocumentoEntity } from './domain/documento.entity';
import { EvaluacionPlanMarcoEntity } from './domain/evaluacion-plan-marco.entity';
import { EvaluacionPracticaEntity } from './domain/evaluacion-practica.entity';
import { EmpresaEntity } from './domain/empresa.entity';
import { EstudianteEntity } from './domain/estudiante.entity';
import { InformeAprendizajeEntity } from './domain/informe-aprendizaje.entity';
import { ItemRubricaEntity } from './domain/item-rubrica.entity';
import { PlanRotacionEntity } from './domain/plan-rotacion.entity';
import { PlanRotacionSemanaEntity } from './domain/plan-rotacion-semana.entity';
import { PlanMarcoFormacionEntity } from './domain/plan-marco-formacion.entity';
import { ItemPlanMarcoEntity } from './domain/item-plan-marco.entity';
import { PracticaEntity } from './domain/practica.entity';
import { RegistroDiarioEntity } from './domain/registro-diario.entity';
import { RubricaEntity } from './domain/rubrica.entity';
import { BitacoraSemanalService } from './services/bitacora-semanal.service';
import { CvService } from './services/cv.service';
import { DocumentoPlantillaService } from './services/documento-plantilla.service';
import { DocumentoService } from './services/documento.service';
import { EmpresaService } from './services/empresa.service';
import { EvaluacionCalculoService } from './services/evaluacion-calculo.service';
import { EvaluacionEmpresaService } from './services/evaluacion-empresa.service';
import { EvaluacionInstitutoService } from './services/evaluacion-instituto.service';
import { EvaluacionPracticaService } from './services/evaluacion-practica.service';
import { InformeAprendizajeService } from './services/informe-aprendizaje.service';
import { InformeFasePracticaService } from './services/informe-fase-practica.service';
import { PlanRotacionService } from './services/plan-rotacion.service';
import { PracticaService } from './services/practica.service';
import { RegistroDiarioService } from './services/registro-diario.service';
import { RubricaService } from './services/rubrica.service';
import { ItemRubricaService } from './services/item-rubrica.service';
import { DetalleEvaluacionService } from './services/detalle-evaluacion.service';
import { PlanRotacionSemanaService } from './services/plan-rotacion-semana.service';
import { PlanMarcoService } from './services/plan-marco.service';
import { ItemPlanMarcoService } from './services/item-plan-marco.service';
import { EvaluacionPlanMarcoService } from './services/evaluacion-plan-marco.service';
import { InformeFasePracticaPg } from './adapters/informe-fase-practica.pg';
import {
  INFORME_FASE_PRACTICA_REPOSITORY,
  InformeFasePracticaRepository,
} from './ports/informe-fase-practica.repository.port';
import { PRACTICA_REPOSITORY } from './ports/practica.repository.port';
import { PracticaPg } from './adapters/practica.pg';
import { EMPRESA_REPOSITORY } from './ports/empresa.repository.port';
import { EmpresaPg } from './adapters/empresa.pg';
import { DOCUMENTO_REPOSITORY } from './ports/documento.repository.port';
import { DocumentoPg } from './adapters/documento.pg';
import { REGISTRO_DIARIO_REPOSITORY } from './ports/registro-diario.repository.port';
import { RegistroDiarioPg } from './adapters/registro-diario.pg';
import { PLAN_ROTACION_REPOSITORY } from './ports/plan-rotacion.repository.port';
import { PlanRotacionPg } from './adapters/plan-rotacion.pg';
import { PLAN_ROTACION_SEMANA_REPOSITORY } from './ports/plan-rotacion-semana.repository.port';
import { PlanRotacionSemanaPg } from './adapters/plan-rotacion-semana.pg';
import { PLAN_MARCO_REPOSITORY } from './ports/plan-marco.repository.port';
import { PlanMarcoPg } from './adapters/plan-marco.pg';
import { ITEM_PLAN_MARCO_REPOSITORY } from './ports/item-plan-marco.repository.port';
import { ItemPlanMarcoPg } from './adapters/item-plan-marco.pg';
import { EVALUACION_PLAN_MARCO_REPOSITORY } from './ports/evaluacion-plan-marco.repository.port';
import { EvaluacionPlanMarcoPg } from './adapters/evaluacion-plan-marco.pg';
import { INFORME_APRENDIZAJE_REPOSITORY } from './ports/informe-aprendizaje.repository.port';
import { InformeAprendizajePg } from './adapters/informe-aprendizaje.pg';
import { EVALUACION_PRACTICA_REPOSITORY } from './ports/evaluacion-practica.repository.port';
import { EvaluacionPracticaPg } from './adapters/evaluacion-practica.pg';
import { BITACORA_SEMANAL_REPOSITORY } from './ports/bitacora-semanal.repository.port';
import { BitacoraSemanalPg } from './adapters/bitacora-semanal.pg';
import { RUBRICA_REPOSITORY } from './ports/rubrica.repository.port';
import { RubricaPg } from './adapters/rubrica.pg';
import { CV_DATO_ACADEMICO_REPOSITORY } from './ports/cv-dato-academico.repository.port';
import { CvDatoAcademicoPg } from './adapters/cv-dato-academico.pg';
import { CV_EXPERIENCIA_LABORAL_REPOSITORY } from './ports/cv-experiencia-laboral.repository.port';
import { CvExperienciaLaboralPg } from './adapters/cv-experiencia-laboral.pg';
import { CV_PRACTICA_DUAL_REPOSITORY } from './ports/cv-practica-dual.repository.port';
import { CvPracticaDualPg } from './adapters/cv-practica-dual.pg';
import { DETALLE_EVALUACION_REPOSITORY } from './ports/detalle-evaluacion.repository.port';
import { DetalleEvaluacionPg } from './adapters/detalle-evaluacion.pg';
import { ITEM_RUBRICA_REPOSITORY } from './ports/item-rubrica.repository.port';
import { ItemRubricaPg } from './adapters/item-rubrica.pg';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PracticaEntity,
      RegistroDiarioEntity,
      PlanRotacionEntity,
      PlanRotacionSemanaEntity,
      PlanMarcoFormacionEntity,
      ItemPlanMarcoEntity,
      InformeAprendizajeEntity,
      EvaluacionPracticaEntity,
      EvaluacionPlanMarcoEntity,
      DetalleEvaluacionEntity,
      BitacoraSemanalEntity,
      RubricaEntity,
      EmpresaEntity,
      DocumentoEntity,
      CvDatoAcademicoEntity,
      CvExperienciaLaboralEntity,
      CvPracticaDualEntity,
      EstudianteEntity,
      ItemRubricaEntity,
      TutorEmpresarialEntity,
      NucleoEstructuranteEntity,
    ]),
  ],
  controllers: [
    PracticaController,
    EmpresaController,
    DocumentoController,
    InformeFasePracticaController,
    CvController,
    EvaluacionEmpresaController,
    EvaluacionInstitutoController,
    RubricaController,
    ItemRubricaController,
      DetalleEvaluacionController,
      PlanRotacionSemanaController,
      PlanMarcoController,
      ItemPlanMarcoController,
      PerfilEstudianteController,
      EvaluacionPlanMarcoController,
  ],
  providers: [
    PracticaService,
    {
      provide: PRACTICA_REPOSITORY,
      useClass: PracticaPg,
    },
    EmpresaService,
    {
      provide: EMPRESA_REPOSITORY,
      useClass: EmpresaPg,
    },
    DocumentoService,
    DocumentoPlantillaService,
    {
      provide: DOCUMENTO_REPOSITORY,
      useClass: DocumentoPg,
    },
    RegistroDiarioService,
    {
      provide: REGISTRO_DIARIO_REPOSITORY,
      useClass: RegistroDiarioPg,
    },
    PlanRotacionService,
    {
      provide: PLAN_ROTACION_REPOSITORY,
      useClass: PlanRotacionPg,
    },
    InformeAprendizajeService,
    {
      provide: INFORME_APRENDIZAJE_REPOSITORY,
      useClass: InformeAprendizajePg,
    },
    EvaluacionPracticaService,
    {
      provide: EVALUACION_PRACTICA_REPOSITORY,
      useClass: EvaluacionPracticaPg,
    },
    BitacoraSemanalService,
    {
      provide: BITACORA_SEMANAL_REPOSITORY,
      useClass: BitacoraSemanalPg,
    },
    RubricaService,
    {
      provide: RUBRICA_REPOSITORY,
      useClass: RubricaPg,
    },
    ItemRubricaService,
    {
      provide: ITEM_RUBRICA_REPOSITORY,
      useClass: ItemRubricaPg,
    },
    DetalleEvaluacionService,
    {
      provide: DETALLE_EVALUACION_REPOSITORY,
      useClass: DetalleEvaluacionPg,
    },
      PlanRotacionSemanaService,
      {
        provide: PLAN_ROTACION_SEMANA_REPOSITORY,
        useClass: PlanRotacionSemanaPg,
      },
      PlanMarcoService,
      {
        provide: PLAN_MARCO_REPOSITORY,
        useClass: PlanMarcoPg,
      },
      ItemPlanMarcoService,
      {
        provide: ITEM_PLAN_MARCO_REPOSITORY,
        useClass: ItemPlanMarcoPg,
      },
      EvaluacionPlanMarcoService,
      {
        provide: EVALUACION_PLAN_MARCO_REPOSITORY,
        useClass: EvaluacionPlanMarcoPg,
      },
      InformeFasePracticaService,
    {
      provide: INFORME_FASE_PRACTICA_REPOSITORY,
      useClass: InformeFasePracticaPg,
    },
    CvService,
    {
      provide: CV_DATO_ACADEMICO_REPOSITORY,
      useClass: CvDatoAcademicoPg,
    },
    {
      provide: CV_EXPERIENCIA_LABORAL_REPOSITORY,
      useClass: CvExperienciaLaboralPg,
    },
    {
      provide: CV_PRACTICA_DUAL_REPOSITORY,
      useClass: CvPracticaDualPg,
    },
    {
      provide: DETALLE_EVALUACION_REPOSITORY,
      useClass: DetalleEvaluacionPg,
    },
    {
      provide: ITEM_RUBRICA_REPOSITORY,
      useClass: ItemRubricaPg,
    },
    EvaluacionCalculoService,
    EvaluacionEmpresaService,
    EvaluacionInstitutoService,
  ],
})
export class FasePracticaModule {}

