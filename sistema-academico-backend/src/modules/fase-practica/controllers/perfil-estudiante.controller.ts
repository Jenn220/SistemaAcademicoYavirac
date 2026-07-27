import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { EstudianteEntity } from '../domain/estudiante.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ActualizarDatosEstudianteDto } from '../dto/actualizar-datos-estudiante.dto';

@UseGuards(JwtGuard, RolesGuard)
@Roles('ESTUDIANTE')
@Controller('fase-practica')
export class PerfilEstudianteController {
  constructor(@InjectRepository(EstudianteEntity) private readonly repo: Repository<EstudianteEntity>) {}

  @Get('perfil')
  async obtenerPerfil(@Req() req: any) {
    return this.repo.findOne({ where: { id_estudiante: req.user.idEstudiante } });
  }

  @Patch('perfil')
  async actualizarPerfil(@Req() req: any, @Body() dto: ActualizarDatosEstudianteDto) {
    const estudiante = await this.repo.findOne({ where: { id_estudiante: req.user.idEstudiante } });
    if (!estudiante) return null;
    Object.assign(estudiante, dto);
    return this.repo.save(estudiante);
  }
}
