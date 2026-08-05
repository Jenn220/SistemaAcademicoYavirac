import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controladores
import { EntidadReceptoraController } from './controllers/entidad-receptora.controller';
import { InicioActividadesTutorController } from './controllers/Inicio-Actividades-Tutor.controller';
import { ActaCompromisoController } from './controllers/Acta-Compromiso.Controller';
import { AsistenciaEstudianteController } from './controllers/Asistencia-Estudiante.Controller';
import { AsistenciaTutorController } from './controllers/Asistencia-Tutor.Controller';
import { InformeActividadesController } from './controllers/Informe-Actividades.Controller';
import { CertificadoVinculacionController } from './controllers/Certificado-Vinculacion.Controller';
import { InformeFinalController } from './controllers/Informe-Final.Controller';

// Entidades
import { VinculacionActividadEstudiante } from './domain/vinculacion_actividad_estudiante.entity';
import { VinculacionAsistenciaTutor } from './domain/vinculacion-asistencia-tutor.entity';
import { VinculacionEstudianteEntity } from './domain/vinculacion-estudiante.entity';
import { VinculacionInforme } from './domain/vinculacion-informe.entity';
import { VinculacionObjetivo } from './domain/vinculacion-objetivo.entity';
import { EvaluacionVinculacion } from './domain/vinculacion-evaluacion';
import { DetalleEvaluacionVinculacion } from './domain/detalle-evaluacion-vinculacion.entity';
import { VinculacionReporteObservacionEntity } from './domain/vinculacion_reporte_observacion';
import { EntidadReceptoraEntity } from './domain/entidad-receptora.entity';

// Servicios
import { EntidadReceptoraService } from './services/entidad-receptora.service';
import { AuthVinculacionService } from './services/auth-vinculacion.service';
import { ActaCompromisoService } from './services/acta-compromiso.service';
import { InicioActividadesTutorService } from './services/inicio-actividades-tutor.service';
import { AsistenciaEstudianteService } from './services/asistencia-estudiante.service';
import { AsistenciaTutorService } from './services/asistencia-tutor.service';
import { InformeActividadesService } from './services/informe-actividades.service';
import { InformeFinalService } from './services/informe-final.service';
import { CertificadoVinculacionService } from './services/certificado-vinculacion.service';

// Puertos
import { ENTIDAD_RECEPTORA_PORT } from './ports/entidad-receptora.port';
import { VINCULACION_ACTA_PORT } from './ports/acta-compromiso.port';
import { VINCULACION_ASISTENCIA_ESTUDIANTE_PORT } from './ports/asistencia-estudiante.port';
import { VINCULACION_INICIO_ACTIVIDADES_PORT } from './ports/inicio-actividades-tutor.port';
import { VINCULACION_ASISTENCIA_TUTOR_PORT } from './ports/asistencia-tutor.port';
import { INFORME_ACTIVIDADES_PORT } from './ports/informe-actividades.port';
import { CERTIFICADO_VINCULACION_PORT } from './ports/certificado-vinculacion.port';
import { INFORME_FINAL_PORT } from './ports/informe-final.port';

// Adaptadores
import { EntidadReceptoraAdapter } from './adapters/entidad-receptora.adapter';
import { CartaCompromisoReportesAdapter } from './adapters/Acta-Compromiso.adapter';
import { VinculacionAsistenciaEstudianteAdapter } from './adapters/Asistencia-Estudiante';
import { InicioActividadesTutorAdapter } from './adapters/Inicio-Actividades-Tutor';
import { AsistenciaTutorAdapter } from './adapters/Asistencia-Tutor';
import { InformeActividadesAdapter } from './adapters/Informe-Actividades';
import { CertificadoVinculacionAdapter } from './adapters/Certificado-Vinculacion';
import { InformeFinalAdapter } from './adapters/Informe-Final';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VinculacionActividadEstudiante,
      VinculacionAsistenciaTutor,
      VinculacionEstudianteEntity,
      VinculacionInforme,
      VinculacionObjetivo, // ✅ Agregado
      EvaluacionVinculacion,
      DetalleEvaluacionVinculacion,
      VinculacionReporteObservacionEntity,
      EntidadReceptoraEntity,
    ]),
  ],
  controllers: [
    EntidadReceptoraController,
    InicioActividadesTutorController,
    ActaCompromisoController,
    AsistenciaEstudianteController,
    AsistenciaTutorController,
    InformeActividadesController,
    CertificadoVinculacionController,
    InformeFinalController,
  ],
  providers: [
    // Servicios
    EntidadReceptoraService,
    AuthVinculacionService,
    ActaCompromisoService,
    InicioActividadesTutorService,
    AsistenciaEstudianteService,
    AsistenciaTutorService,
    InformeActividadesService,
    InformeFinalService,
    CertificadoVinculacionService,

    // Adaptadores
    {
      provide: ENTIDAD_RECEPTORA_PORT,
      useClass: EntidadReceptoraAdapter,
    },
    {
      provide: VINCULACION_ACTA_PORT,
      useClass: CartaCompromisoReportesAdapter,
    },
    {
      provide: VINCULACION_ASISTENCIA_ESTUDIANTE_PORT,
      useClass: VinculacionAsistenciaEstudianteAdapter,
    },
    {
      provide: VINCULACION_INICIO_ACTIVIDADES_PORT,
      useClass: InicioActividadesTutorAdapter,
    },
    {
      provide: VINCULACION_ASISTENCIA_TUTOR_PORT,
      useClass: AsistenciaTutorAdapter,
    },
    {
      provide: INFORME_ACTIVIDADES_PORT,
      useClass: InformeActividadesAdapter,
    },
    {
      provide: CERTIFICADO_VINCULACION_PORT,
      useClass: CertificadoVinculacionAdapter,
    },
    {
      provide: INFORME_FINAL_PORT,
      useClass: InformeFinalAdapter,
    },
  ],
  exports: [
    EntidadReceptoraService,
    AuthVinculacionService,
  ],
})
export class VinculacionModule {}