import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortafolioInformeFinal } from './domain/informe-final.entity';
import { InformeFinalPg } from './adapters/informe-final.pg';
import { InformeFinalService } from './services/informe-final.service';
import { InformeFinalController } from './controllers/informe-final.controller';
import { INFORME_FINAL_REPOSITORY } from './ports/informe-final.repository';
import { PortafolioReporteNotas } from './domain/reporte-notas.entity';
import { PortafolioAceptacionEstudiante } from './domain/aceptacion-estudiante.entity';
import { AceptacionNotasPg } from './adapters/aceptacion-notas.pg';
import { AceptacionNotasService } from './services/aceptacion-notas.service';
import { AceptacionNotasController } from './controllers/aceptacion-notas.controller';
import { ACEPTACION_NOTAS_REPOSITORY } from './ports/aceptacion-notas.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PortafolioInformeFinal,
      PortafolioReporteNotas,
      PortafolioAceptacionEstudiante,
    ]),
  ],
  providers: [
    InformeFinalService,
    {
      provide: INFORME_FINAL_REPOSITORY,
      useClass: InformeFinalPg,
    },
    AceptacionNotasService,
    {
      provide: ACEPTACION_NOTAS_REPOSITORY,
      useClass: AceptacionNotasPg,
    },
  ],
  controllers: [InformeFinalController, AceptacionNotasController],
})
export class PortafolioModule {}
