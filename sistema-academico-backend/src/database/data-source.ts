import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

dotenv.config();

const requiredEnvironmentVariables = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
] as const;

for (const variable of requiredEnvironmentVariables) {
  if (!process.env[variable]) {
    throw new Error(
      `Falta la variable de entorno obligatoria: ${variable}`,
    );
  }
}

const databasePort = Number(process.env.DB_PORT);

if (!Number.isInteger(databasePort) || databasePort <= 0) {
  throw new Error('DB_PORT debe ser un número entero válido.');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: databasePort,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  synchronize: false,
  migrationsRun: false,
  logging: process.env.NODE_ENV === 'development',

  entities: [
    join(__dirname, '..', '**', '*.entity.{ts,js}'),
  ],

  migrations: [
    join(__dirname, 'migrations', '*.{ts,js}'),
  ],

  migrationsTableName: 'typeorm_migrations',
});