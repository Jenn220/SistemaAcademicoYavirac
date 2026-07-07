import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortafolioInformeFinal } from './domain/informe-final.entity';
import { InformeFinalPg } from './adapters/informe-final.pg';
import { InformeFinalService } from './services/informe-final.service';
import { InformeFinalController } from './controllers/informe-final.controller';
import { INFORME_FINAL_REPOSITORY } from './ports/informe-final.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PortafolioInformeFinal])],
  providers: [
    InformeFinalService,
    {
      provide: INFORME_FINAL_REPOSITORY,
      useClass: InformeFinalPg,
    },
  ],
  controllers: [InformeFinalController],
})
export class PortafolioModule {}
