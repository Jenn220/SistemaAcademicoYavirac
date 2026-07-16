import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PortafolioInformeFinal } from '../modules/portafolio-docente/domain/informe-final.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_academico',
  entities: [PortafolioInformeFinal],
  synchronize: false,
};
