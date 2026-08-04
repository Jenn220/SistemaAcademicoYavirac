import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// -----------------------------------------------------------------------
// 🕹️ CONTROLADORES
// -----------------------------------------------------------------------


import { EntidadReceptoraController } from './controllers/entidad-receptora.controller';

// 📄 Los 7 Controladores Modulares de Documentos
import { InicioActividadesTutorController } from './controllers/Inicio-Actividades-Tutor.controller';
import { ActaCompromisoController } from './controllers/Acta-Compromiso.Controller';
import { AsistenciaEstudianteController } from './controllers/Asistencia-Estudiante.Controller';
import { AsistenciaTutorController } from './controllers/Asistencia-Tutor.Controller';
import { InformeActividadesController } from './controllers/Informe-Actividades.Controller';
import { CertificadoVinculacionController } from './controllers/Certificado-Vinculacion.Controller';
import { InformeFinalController } from './controllers/Informe-Final.Controller';

// -----------------------------------------------------------------------
// 🗄️ ENTIDADES (DOMINIO / PERSISTENCIA)
// -----------------------------------------------------------------------
import { VinculacionActividadEstudiante } from './domain/vinculacion_actividad_estudiante.entity';
import { VinculacionAsistenciaTutor } from './domain/vinculacion-asistencia-tutor.entity';
import { VinculacionEstudianteEntity } from './domain/vinculacion-estudiante.entity';
import { VinculacionInforme } from './domain/vinculacion-informe.entity';
import { VinculacionObjetivo } from './domain/vinculacion-objetivo.entity';
import { EvaluacionVinculacion } from './domain/vinculacion-evaluacion';
import { DetalleEvaluacionVinculacion } from './domain/detalle-evaluacion-vinculacion.entity';
import { VinculacionReporteObservacionEntity } from './domain/vinculacion_reporte_observacion';
import { EntidadReceptoraEntity } from './domain/entidad-receptora.entity';

// -----------------------------------------------------------------------
// ⚙️ SERVICIOS (CAPA DE APLICACIÓN)
// -----------------------------------------------------------------------

import { EntidadReceptoraService } from './services/entidad-receptora.service';

// 🧱 8 Nuevos Servicios Modulares para los Documentos de Vinculación
import { AuthVinculacionService } from './services/auth-vinculacion.service';
import { ActaCompromisoService } from './services/acta-compromiso.service';
import { InicioActividadesTutorService } from './services/inicio-actividades-tutor.service';
import { AsistenciaEstudianteService } from './services/asistencia-estudiante.service';
import { AsistenciaTutorService } from './services/asistencia-tutor.service';
import { InformeActividadesService } from './services/informe-actividades.service';
import { InformeFinalService } from './services/informe-final.service';
import { CertificadoVinculacionService } from './services/certificado-vinculacion.service';

// -----------------------------------------------------------------------
// 🔌 PUERTOS (INTERFACES DE INFRAESTRUCTURA)

import { ENTIDAD_RECEPTORA_PORT } from './ports/entidad-receptora.port';

// -----------------------------------------------------------------------
// 🔌 ADAPTADORES (INFRAESTRUCTURA TYPEORM)
// -----------------------------------------------------------------------

import { EntidadReceptoraAdapter } from './adapters/entidad-receptora.adapter';
import { VINCULACION_ACTA_PORT } from './ports/acta-compromiso.port';
import { CartaCompromisoReportesAdapter } from './adapters/Acta-Compromiso.adapter';
import { VINCULACION_ASISTENCIA_ESTUDIANTE_PORT } from './ports/asistencia-estudiante.port';
import { VinculacionAsistenciaEstudianteAdapter } from './adapters/Asistencia-Estudiante';
import { VINCULACION_INICIO_ACTIVIDADES_PORT } from './ports/inicio-actividades-tutor.port';
import { InicioActividadesTutorAdapter } from './adapters/Inicio-Actividades-Tutor';
import { VINCULACION_ASISTENCIA_TUTOR_PORT } from './ports/asistencia-tutor.port';
import { AsistenciaTutorAdapter } from './adapters/Asistencia-Tutor';
import { INFORME_ACTIVIDADES_PORT } from './ports/informe-actividades.port';
import { InformeActividadesAdapter } from './adapters/Informe-Actividades';
import { CERTIFICADO_VINCULACION_PORT } from './ports/certificado-vinculacion.port';
import { CertificadoVinculacionAdapter } from './adapters/Certificado-Vinculacion';
import { INFORME_FINAL_PORT } from './ports/informe-final.port';
import { InformeFinalAdapter } from './adapters/Informe-Final';

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
      VinculacionReporteObservacionEntity,
      EntidadReceptoraEntity,
      VinculacionAsistenciaTutor,
    ]),
  ],
  controllers: [
    // Controladores Generales
    EntidadReceptoraController,
    // Controladores Especializados (7 Documentos)
    InicioActividadesTutorController,
    ActaCompromisoController,
    AsistenciaEstudianteController,
    AsistenciaTutorController,
    InformeActividadesController,
    CertificadoVinculacionController,
    InformeFinalController,
  ],
  providers: [
    // 1. Servicios de Entidades Generales
 
    EntidadReceptoraService,

    // 2. Servicios Modulares de Documentos (Reemplazan a VinculacionReportesService)
    AuthVinculacionService,
    ActaCompromisoService,
    InicioActividadesTutorService,
    AsistenciaEstudianteService,
    AsistenciaTutorService,
    InformeActividadesService,
    InformeFinalService,
    CertificadoVinculacionService,


    // 4. Inyección de Dependencias (Puerto -> Adaptador

    {
      provide: ENTIDAD_RECEPTORA_PORT,
      useClass: EntidadReceptoraAdapter,
    },

    {
      provide: VINCULACION_ACTA_PORT,
      useClass: CartaCompromisoReportesAdapter, // O la clase adaptador que implemente obtainActaCompromisoRaw
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
  useClass: InformeActividadesAdapter, // Tu clase adaptadora de TypeORM
},
{
  provide: CERTIFICADO_VINCULACION_PORT,
  useClass: CertificadoVinculacionAdapter, // Tu adaptador TypeORM/RAW
},
{
  provide: INFORME_FINAL_PORT,
  useClass: InformeFinalAdapter,
}
  ],
  exports: [
    // Servicios expuestos a otros módulos
    EntidadReceptoraService,
    AuthVinculacionService,
  ],
})
export class VinculacionModule {}