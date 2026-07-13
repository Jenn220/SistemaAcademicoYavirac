import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { FasePracticaModule } from './modules/fase-practica/fase-practica.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USERNAME || process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || process.env.DB_DATABASE || 'postgres',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    FasePracticaModule,
  ],
})
export class AppModule {}
