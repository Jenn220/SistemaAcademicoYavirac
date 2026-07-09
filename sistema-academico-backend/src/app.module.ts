import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortafolioInformeFinal } from './modules/portafolio-docente/domain/informe-final.entity';
import { PortafolioReporteNotas } from './modules/portafolio-docente/domain/reporte-notas.entity';
import { PortafolioAceptacionEstudiante } from './modules/portafolio-docente/domain/aceptacion-estudiante.entity';
import { PortafolioModule } from './modules/portafolio-docente/portafolio.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [PortafolioInformeFinal, PortafolioReporteNotas, PortafolioAceptacionEstudiante],
        synchronize: false,
      }),
    }),
    PortafolioModule,
  ],
})
export class AppModule {}
