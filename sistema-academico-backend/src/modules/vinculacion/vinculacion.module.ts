import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controladores

import { VinculacionEstudianteController } from './controllers/vinculacion-estudiante.controller';
import { VinculacionReportesController } from './controllers/vinculacion-reportes.controller';
import { VinculacionEvaluacionController } from './controllers/vinculacion-evaluacion.controller';
import { VinculacionActividadesController } from './controllers/vinculacion-actividades.controller';

// Entidades
import { VinculacionActividadEstudiante } from './domain/vinculacion_actividad_estudiante.entity';
import { VinculacionAsistenciaTutor } from './domain/vinculacion-asistencia-tutor.entity';
import { VinculacionEstudianteEntity } from './domain/vinculacion-estudiante.entity';
import { VinculacionInforme } from './domain/vinculacion-informe.entity';
import { VinculacionObjetivo } from './domain/vinculacion-objetivo.entity';
import { EvaluacionVinculacion } from './domain/vinculacion-evaluacion';
import { DetalleEvaluacionVinculacion } from './domain/detalle-evaluacion-vinculacion.entity';

// Servicios de Aplicación
import { VinculacionEstudianteService } from './services/vinculacion-estudiante.service';
import { VinculacionObjetivosService } from './services/vinculacion-objetivos.service';
import { VinculacionActividadesService } from './services/vinculacion-actividades.service';
import { VinculacionAsistenciaService } from './services/vinculacion-asistencia.service';
import { VinculacionInformeService } from './services/vinculacion-informe.service';
import { VinculacionEvaluacionService } from './services/vinculacion-evaluacion.service';
import { VinculacionReportesService } from './services/vinculacion-reportes.service';

// Puertos (Tokens / Interfaces)
import { VINCULACION_ESTUDIANTE_PORT } from './ports/vinculacion-estudiante.port';
import { VINCULACION_OBJETIVOS_PORT } from './ports/vinculacion-objetivos.port';
import { VINCULACION_ACTIVIDADES_PORT } from './ports/vinculacion-actividades.port';
import { VINCULACION_ASISTENCIA_PORT } from './ports/vinculacion-asistencia.port';
import { VINCULACION_INFORME_PORT } from './ports/vinculacion-informe.port';
import { VINCULACION_EVALUACION_PORT } from './ports/vinculacion-evaluacion.port';
import { VINCULACION_REPORTES_PORT } from './ports/vinculacion-reportes.port';

// Adaptadores de Infraestructura (TypeORM)
import { VinculacionEstudianteAdapter } from './adapters/vinculacion-estudiante.adapter';
import { VinculacionActividadesAdapter } from './adapters/vinculacion-actividades.adapter';
import { VinculacionAsistenciaAdapter } from './adapters/vinculacion-asistencia.adapter';
import { VinculacionReportesAdapter } from './adapters/vinculacion-reportes.adapter';
import { VinculacionObjetivosAdapter } from './adapters/vinculacion-objetivos.adapter';
import { VinculacionInformeAdapter } from './adapters/vinculacion-informe.adapter';
import { VinculacionEvaluacionAdapter } from './adapters/vinculacion-evaluacion.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VinculacionActividadEstudiante,
      VinculacionAsistenciaTutor,
      VinculacionEstudianteEntity,
      VinculacionInforme,
      VinculacionObjetivo,
      EvaluacionVinculacion,
      DetalleEvaluacionVinculacion,
    ]),
  ],
  controllers: [
    // Registro de todos los controladores especializados
    VinculacionEstudianteController,
    VinculacionReportesController,
    VinculacionEvaluacionController,
    VinculacionActividadesController,
  ],
  providers: [
    // 1. Servicios Granulares (Capa de Aplicación)
    VinculacionEstudianteService,
    VinculacionObjetivosService,
    VinculacionActividadesService,
    VinculacionAsistenciaService,
    VinculacionInformeService,
    VinculacionEvaluacionService,
    VinculacionReportesService,

    // 2. Inyección de Dependencias Puerto -> Adaptador (Capa de Infraestructura)
    {
      provide: VINCULACION_ESTUDIANTE_PORT,
      useClass: VinculacionEstudianteAdapter,
    },
    {
      provide: VINCULACION_OBJETIVOS_PORT,
      useClass: VinculacionObjetivosAdapter,
    },
    {
      provide: VINCULACION_ACTIVIDADES_PORT,
      useClass: VinculacionActividadesAdapter,
    },
    {
      provide: VINCULACION_ASISTENCIA_PORT,
      useClass: VinculacionAsistenciaAdapter,
    },
    {
      provide: VINCULACION_INFORME_PORT,
      useClass: VinculacionInformeAdapter,
    },
    {
      provide: VINCULACION_EVALUACION_PORT,
      useClass: VinculacionEvaluacionAdapter,
    },
    {
      provide: VINCULACION_REPORTES_PORT,
      useClass: VinculacionReportesAdapter,
    },
  ],
  // SOLO se exportan Servicios/Providers que otros módulos puedan necesitar (NUNCA Controladores)
  exports: [
    VinculacionEstudianteService,
    VinculacionObjetivosService,
    VinculacionActividadesService,
    VinculacionAsistenciaService,
    VinculacionInformeService,
    VinculacionEvaluacionService,
    VinculacionReportesService,
  ],
})
export class VinculacionModule {}