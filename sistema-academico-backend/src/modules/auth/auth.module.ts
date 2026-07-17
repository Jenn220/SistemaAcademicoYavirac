import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import type jwt from 'jsonwebtoken';
import { UsuarioEntity } from './domain/usuario.entity';
import { RolEntity } from './domain/rol.entity';
import { UsuarioRolEntity } from './domain/usuario-rol.entity';
import { UsuarioPg } from './adapters/usuario.pg';
import { USUARIO_REPOSITORY } from './ports/usuario.repository';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '7d') as jwt.SignOptions['expiresIn'],
        },
      }),
    }),
    TypeOrmModule.forFeature([UsuarioEntity, RolEntity, UsuarioRolEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: USUARIO_REPOSITORY,
      useClass: UsuarioPg,
    },
  ],
})
export class AuthModule {}
