import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import { PortafolioModule } from './modules/portafolio-docente/portafolio.module';
import { VinculacionModule } from './modules/vinculacion/vinculacion.module';
import { AppController } from './app.controller';
import { FasePracticaModule } from './modules/fase-practica/fase-practica.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST') || 'localhost',
        port: config.get<number>('DB_PORT') || 5432,
        username: config.get<string>('DB_USER') || 'postgres',
        password: String(config.get('DB_PASSWORD') || 'postgres'),
        database: config.get<string>('DB_NAME') || 'postgres',
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    PortafolioModule,
    VinculacionModule,
    FasePracticaModule,
    HealthModule,
    AuthModule,
  ],
})
export class AppModule {}