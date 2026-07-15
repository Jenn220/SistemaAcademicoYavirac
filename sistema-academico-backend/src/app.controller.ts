import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  getRoot() {
    return {
      message: 'Backend funcionando',
      status: 'ok',
      database: 'conectada',
    };
  }

  @Get('health/db')
  async getDatabaseHealth() {
    try {
      const result = await this.dataSource.query('SELECT NOW() as now');
      return {
        status: 'ok',
        database: 'connected',
        timestamp: result[0].now,
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        message: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }

  @Get('health/tables')
  async getTables() {
    try {
      const result = await this.dataSource.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);

      return {
        status: 'ok',
        database: 'connected',
        tables: result.map((row: any) => row.table_name),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        message: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }
}
