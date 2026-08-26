import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async check(): Promise<{
    status: 'ok';
    application: string;
    database: string;
    timestamp: string;
    environment: string;
    version: string;
    commit: string;
  }> {
    try {
      await this.dataSource.query('SELECT 1');

      return {
        status: 'ok',
        application: 'up',
        database: 'connected',
        timestamp: new Date().toISOString(),
        environment:
          this.configService.get<string>('NODE_ENV') ?? 'development',
        version:
          this.configService.get<string>('APP_VERSION') ?? 'unknown',
        commit:
          this.configService.get<string>('COMMIT_SHA') ?? 'local',
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        application: 'up',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  }
}