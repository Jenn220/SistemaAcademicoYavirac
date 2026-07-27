import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Patch, Delete } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { VinculacionEvaluacionService } from '../services/vinculacion-evaluacion.service';
import { CreateEvaluacionDto } from '../dto/create-evaluacion.dto';
import { CreateDetalleEvaluacionDto } from '../dto/create-detalle-evaluacion.dto';
import { UpdateEvaluacionDto } from '../dto/update-evaluacion.dto';
import { UpdateDetalleEvaluacionDto } from '../dto/update-detalle-evaluacion.dto';
import { EvaluacionVinculacion } from '../domain/vinculacion-evaluacion';
import { DetalleEvaluacionVinculacion } from '../domain/detalle-evaluacion-vinculacion.entity';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
@Controller('vinculacion/evaluaciones')
export class VinculacionEvaluacionController {
  constructor(private readonly evaluacionService: VinculacionEvaluacionService) {}

  @Post()
  async crearEvaluacion(@Body() createEvaluacionDto: CreateEvaluacionDto) {
    return await this.evaluacionService.crearEvaluacion(createEvaluacionDto);
  }

  @Post('detalle')
  async crearDetalleEvaluacion(@Body() createDetalleEvaluacionDto: CreateDetalleEvaluacionDto) {
    return await this.evaluacionService.crearDetalleEvaluacion(createDetalleEvaluacionDto);
  }

 @Get()
async obtenerTodasLasEvaluaciones() {
  return await this.evaluacionService.obtenerTodasLasEvaluaciones();
}

  @Get('detalles')
async obtenerDetallesEvaluacion() {
  return await this.evaluacionService.obtenerDetallesEvaluacion();
}

// En tu controlador:
@Get('detalles/:idEvaluacion')
async obtenerDetallesPorEvaluacion(
  @Param('idEvaluacion', ParseIntPipe) idEvaluacion: number,
) {
  return await this.evaluacionService.obtenerDetallesEvaluacion(idEvaluacion);
}

  @Patch(':id')
  async actualizarEvaluacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEvaluacionDto,
  ) {
    return await this.evaluacionService.actualizarEvaluacion(id, updateDto);
  }

  @Patch('detalle/:id')
  async actualizarDetalleEvaluacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDetalleEvaluacionDto,
  ) {
    return await this.evaluacionService.actualizarDetalleEvaluacion(id, updateDto);
  }

  @Delete(':id')
  async eliminarEvaluacion(@Param('id', ParseIntPipe) id: number) {
    return await this.evaluacionService.eliminarEvaluacion(id);
  }

  @Delete('detalle/:id')
  async eliminarDetalleEvaluacion(@Param('id', ParseIntPipe) id: number) {
    return await this.evaluacionService.eliminarDetalleEvaluacion(id);
  }
}