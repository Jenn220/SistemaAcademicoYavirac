import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticaController } from './controllers/practica.controller';
import { EmpresaController } from './controllers/empresa.controller';
import { BitacoraSemanalEntity } from './domain/bitacora-semanal.entity';
import { DocumentoEntity } from './domain/documento.entity';
import { EvaluacionPracticaEntity } from './domain/evaluacion-practica.entity';
import { EmpresaEntity } from './domain/empresa.entity';
import { InformeAprendizajeEntity } from './domain/informe-aprendizaje.entity';
import { PlanRotacionEntity } from './domain/plan-rotacion.entity';
import { PracticaEntity } from './domain/practica.entity';
import { RegistroDiarioEntity } from './domain/registro-diario.entity';
import { RubricaEntity } from './domain/rubrica.entity';
import { PracticaService } from './services/practica.service';
import { EmpresaService } from './services/empresa.service';
import { DocumentoService } from './services/documento.service';
import { DocumentoController } from './controllers/documento.controller';
import { InformeFasePracticaService } from './services/informe-fase-practica.service';
import { InformeFasePracticaController } from './controllers/informe-fase-practica.controller';
import { InformeFasePracticaPg } from './adapters/informe-fase-practica.pg';
import {
  INFORME_FASE_PRACTICA_REPOSITORY,
  InformeFasePracticaRepository,
} from './ports/informe-fase-practica.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PracticaEntity,
      RegistroDiarioEntity,
      PlanRotacionEntity,
      InformeAprendizajeEntity,
      EvaluacionPracticaEntity,
      BitacoraSemanalEntity,
      RubricaEntity,
      EmpresaEntity,
      DocumentoEntity,
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
    EmpresaService,
    DocumentoService,
    InformeFasePracticaService,
    {
      provide: INFORME_FASE_PRACTICA_REPOSITORY,
      useClass: InformeFasePracticaPg,
    },
  ],
})
export class FasePracticaModule {}
