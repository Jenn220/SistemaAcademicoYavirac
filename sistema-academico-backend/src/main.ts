import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// El driver pg devuelve bigint como texto; lo convertimos a número al leer.
// Se registra antes de NestFactory.create (momento en que TypeORM conecta).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pg = require('pg');
pg.types.setTypeParser(20, (value: string) => (value === null ? null : parseInt(value, 10)));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.enableCors({ origin: process.env.CORS_ORIGIN || 'http://localhost:4200' });
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Servidor corriendo en http://localhost:${port}/api`);
}

bootstrap();