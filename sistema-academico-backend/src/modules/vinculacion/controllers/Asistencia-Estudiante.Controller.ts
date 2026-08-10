import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe, 
  Req, 
  UseGuards, 
  BadRequestException
} from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

import { AsistenciaEstudianteService } from '../services/asistencia-estudiante.service';
import { AuthVinculacionService } from '../services/auth-vinculacion.service';

import { CreateActividadEstudianteDto } from '../dto/create-actividad-estudiante.dto';
import { UpdateActividadEstudianteDto } from '../dto/update-actividad-estudiante.dto';

@UseGuards(JwtGuard, RolesGuard)
@Controller('vinculacion/asistencia-estudiante')
export class AsistenciaEstudianteController {
  constructor(
    private readonly authService: AuthVinculacionService,
    private readonly asistenciaService: AsistenciaEstudianteService,
  ) {}

  @Get(':id')
  @Roles('ESTUDIANTE', 'COORDINADOR')
  async obtenerAsistencia(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const idFinal = await this.authService.resolverIdVinculacionLectura(req, id);
    return await this.asistenciaService.obtenerAsistenciaEstudiante(idFinal);
  }
  
@Patch(':idVinculacion/observaciones')
  @Roles('ESTUDIANTE', 'COORDINADOR', 'DOCENTE')
  async actualizarObservacionControlador(
    @Param('idVinculacion', ParseIntPipe) idVinculacion: number,
    @Body() dto: { observaciones: string },
    @Req() req: any,
  ) {
    const idFinal = await this.authService.resolverIdVinculacionLectura(req, idVinculacion);
    return await this.asistenciaService.actualizarObservacion(idFinal, dto.observaciones || '');
  }

@Post()
@Roles('ESTUDIANTE')
@UseGuards(RolesGuard)
async crearActividad(
  @Body() dto: CreateActividadEstudianteDto, 
  @Req() req: any
) {
  // 🟢 Pasamos (dto.id_vinculacion || 0) para asegurar a TypeScript que siempre viaja un 'number'
  const idVinculacionObtenido = await this.authService.resolverIdVinculacionLectura(
    req, 
    dto.id_vinculacion || 0
  );

  if (!idVinculacionObtenido) {
    throw new BadRequestException('No se pudo identificar la vinculación del estudiante autenticado.');
  }

  // Se asegura el tipo number para el servicio
  const idVinculacionValido: number = Number(idVinculacionObtenido);

  return await this.asistenciaService.crearActividadEstudiante({
    ...dto,
    id_vinculacion: idVinculacionValido,
  });
}

 @Patch(':id')
@Roles('ESTUDIANTE')
async actualizarActividad(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateActividadEstudianteDto,
  @Req() req: any,
) {
  // Extraemos id_vinculacion del token JWT o perfil
  const idVinculacionExplicit = req.user?.id_vinculacion || req.user?.id_vinculacion_estudiante;

  return await this.asistenciaService.actualizarActividadEstudiante(
    id, 
    dto, 
    req.user, 
    idVinculacionExplicit
  );
}

@Delete(':id')
@Roles('ESTUDIANTE')
async eliminarActividad(
  @Param('id', ParseIntPipe) id: number,
  @Req() req: any,
) {
  const idVinculacionExplicit = req.user?.id_vinculacion || req.user?.id_vinculacion_estudiante;

  return await this.asistenciaService.eliminarActividadEstudiante(
    id, 
    req.user, 
    idVinculacionExplicit
  );
}
}