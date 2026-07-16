import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VinculacionController } from './controllers/vinculacion.controller';
import { VinculacionService } from './services/vinculacion.service';
// Entidades
import { VinculacionActividadEstudiante } from './domain/vinculacion_actividad_estudiante.entity';
import { VinculacionAsistenciaTutor } from './domain/vinculacion-asistencia-tutor.entity';
import { VinculacionEstudianteEntity } from './domain/vinculacion-estudiante.entity';
import { VinculacionInforme } from './domain/vinculacion-informe.entity';
// Hexagonal
import { VINCULACION_REPOSITORY, IVinculacionRepository } from './ports/vinculacion.repository.port';
import { VinculacionTypeOrmAdapter } from './adapters/vinculacion.typeorm.adapter';
import { VinculacionObjetivo } from './domain/vinculacion-objetivo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VinculacionActividadEstudiante,
      VinculacionAsistenciaTutor,
      VinculacionEstudianteEntity,
      VinculacionInforme,
      VinculacionObjetivo
    ]),
  ],
  controllers: [VinculacionController],
  providers: [
    VinculacionService,
    {
      provide: VINCULACION_REPOSITORY,
      useClass: VinculacionTypeOrmAdapter, // Intercambiable por cualquier otro adaptador en el futuro
    },
  ],
})
export class VinculacionModule {}
