import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticaController } from './controllers/practica.controller';
import { EmpresaController } from './controllers/empresa.controller';
import { DocumentoController } from './controllers/documento.controller';
import { InformeFasePracticaController } from './controllers/informe-fase-practica.controller';
import { BitacoraSemanalEntity } from './domain/bitacora-semanal.entity';
import { CvDatoAcademicoEntity } from './domain/cv-dato-academico.entity';
import { CvExperienciaLaboralEntity } from './domain/cv-experiencia-laboral.entity';
import { CvPracticaDualEntity } from './domain/cv-practica-dual.entity';
import { DetalleEvaluacionEntity } from './domain/detalle-evaluacion.entity';
import { DocumentoEntity } from './domain/documento.entity';
import { EvaluacionPlanMarcoEntity } from './domain/evaluacion-plan-marco.entity';
import { EvaluacionPracticaEntity } from './domain/evaluacion-practica.entity';
import { EmpresaEntity } from './domain/empresa.entity';
import { InformeAprendizajeEntity } from './domain/informe-aprendizaje.entity';
import { PlanRotacionEntity } from './domain/plan-rotacion.entity';
import { PlanRotacionSemanaEntity } from './domain/plan-rotacion-semana.entity';
import { PracticaEntity } from './domain/practica.entity';
import { RegistroDiarioEntity } from './domain/registro-diario.entity';
import { RubricaEntity } from './domain/rubrica.entity';
import { PracticaService } from './services/practica.service';
import { EmpresaService } from './services/empresa.service';
import { DocumentoService } from './services/documento.service';
import { DocumentoPlantillaService } from './services/documento-plantilla.service';
import { RegistroDiarioService } from './services/registro-diario.service';
import { PlanRotacionService } from './services/plan-rotacion.service';
import { InformeAprendizajeService } from './services/informe-aprendizaje.service';
import { EvaluacionPracticaService } from './services/evaluacion-practica.service';
import { BitacoraSemanalService } from './services/bitacora-semanal.service';
import { RubricaService } from './services/rubrica.service';
import { InformeFasePracticaService } from './services/informe-fase-practica.service';
import { InformeFasePracticaPg } from './adapters/informe-fase-practica.pg';
import {
  INFORME_FASE_PRACTICA_REPOSITORY,
  InformeFasePracticaRepository,
} from './ports/informe-fase-practica.repository';
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
import { INFORME_APRENDIZAJE_REPOSITORY } from './ports/informe-aprendizaje.repository.port';
import { InformeAprendizajePg } from './adapters/informe-aprendizaje.pg';
import { EVALUACION_PRACTICA_REPOSITORY } from './ports/evaluacion-practica.repository.port';
import { EvaluacionPracticaPg } from './adapters/evaluacion-practica.pg';
import { BITACORA_SEMANAL_REPOSITORY } from './ports/bitacora-semanal.repository.port';
import { BitacoraSemanalPg } from './adapters/bitacora-semanal.pg';
import { RUBRICA_REPOSITORY } from './ports/rubrica.repository.port';
import { RubricaPg } from './adapters/rubrica.pg';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PracticaEntity,
      RegistroDiarioEntity,
      PlanRotacionEntity,
      PlanRotacionSemanaEntity,
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
    ]),
  ],
  controllers: [
    PracticaController,
    EmpresaController,
    DocumentoController,
    InformeFasePracticaController,
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
    InformeFasePracticaService,
    {
      provide: INFORME_FASE_PRACTICA_REPOSITORY,
      useClass: InformeFasePracticaPg,
    },
  ],
})
export class FasePracticaModule {}
