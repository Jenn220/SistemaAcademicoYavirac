import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DetalleEvaluacionService } from '../services/detalle-evaluacion.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateDetalleEvaluacionDto } from '../dto/create-detalle-evaluacion.dto';
import { UpdateDetalleEvaluacionDto } from '../dto/update-detalle-evaluacion.dto';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE', 'COORDINADOR')
@Controller('fase-practica')
export class DetalleEvaluacionController {
  constructor(private readonly service: DetalleEvaluacionService) {}

  @Post('evaluaciones/:idEvaluacion/detalles')
  create(@Param('idEvaluacion') idEvaluacion: string, @Body() dto: CreateDetalleEvaluacionDto) {
    const data = {
      id_evaluacion: Number(idEvaluacion),
      id_item: dto.id_item,
      puntaje_asignado: dto.puntaje_asignado,
      tipo_criterio: dto.tipo_criterio,
      nivel_calificacion: dto.nivel_calificacion,
      observacion: dto.observacion,
    };
    return this.service.create(data);
  }

  @Get('evaluaciones/:idEvaluacion/detalles')
  findByEvaluacion(@Param('idEvaluacion') idEvaluacion: string) {
    return this.service.findByEvaluacion(Number(idEvaluacion));
  }

  @Get('detalles-evaluacion/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch('detalles-evaluacion/:id')
  update(@Param('id') id: string, @Body() dto: UpdateDetalleEvaluacionDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete('detalles-evaluacion/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id)).then(() => ({ deleted: true, id_detalle_evaluacion: Number(id) }));
  }
}
