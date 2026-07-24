import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Patch, Delete } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { VinculacionEstudianteService } from '../services/vinculacion-estudiante.service';
import { CreateVinculacionDto } from '../dto/create-vinculacion.dto';
import { UpdateVinculacionEstudianteDto } from '../dto/update-vinculacion-estudiante.dto';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
@Controller('vinculacion')
export class VinculacionEstudianteController {
  constructor(private readonly estudianteService: VinculacionEstudianteService) {}

  @Post('vinculacion-estudiante')
  async crearVinculacion(@Body() createVinculacionDto: CreateVinculacionDto) {
    return await this.estudianteService.crearVinculacion(createVinculacionDto);
  }

@Get('estudiantes')
async obtenerVinculacionesEstudiantes() {
  return await this.estudianteService.obtenerVinculacionesEstudiantes();
}

  @Get('verificar-acceso/:idEstudiante')
  async verificarAcceso(@Param('idEstudiante', ParseIntPipe) idEstudiante: number) {
    return await this.estudianteService.verificarAccesoVinculacion(idEstudiante);
  }

  @Get(':id/verificar-cierre')
  async verificarCierre(@Param('id', ParseIntPipe) idVinculacion: number) {
    return await this.estudianteService.verificarRequisitosCierre(idVinculacion);
  }

  @Patch('vinculacion-estudiante/:id')
  async actualizarVinculacionEstudiante(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateVinculacionEstudianteDto,
  ) {
    return await this.estudianteService.actualizarVinculacionEstudiante(id, updateDto);
  }

  @Delete('vinculacion-estudiante/:id')
  async eliminarVinculacionEstudiante(@Param('id', ParseIntPipe) id: number) {
    return await this.estudianteService.eliminarVinculacionEstudiante(id);
  }
}