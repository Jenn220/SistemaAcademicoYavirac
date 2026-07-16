import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// 👇 1. Descomentamos la importación del archivo
import { VinculacionModule } from './modules/vinculacion/vinculacion.module';
<<<<<<< Updated upstream
=======
import { AppController } from './app.controller';
import { FasePracticaModule } from './modules/fase-practica/fase-practica.module';
import { HealthModule } from './health/health.module';
>>>>>>> Stashed changes

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true 
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: String(configService.get('DB_PASSWORD')),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true, 
        synchronize: true, 
      }),
    }),

    // 👇 2. Descomentamos el módulo para que NestJS lo registre
    VinculacionModule,
<<<<<<< Updated upstream
=======
    FasePracticaModule,
    HealthModule,
>>>>>>> Stashed changes
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}