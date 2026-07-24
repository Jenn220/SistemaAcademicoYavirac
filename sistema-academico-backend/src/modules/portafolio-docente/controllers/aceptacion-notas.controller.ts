import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AceptacionNotasService } from '../services/aceptacion-notas.service';
import { CreateReporteNotasDto } from '../dto/create-reporte-notas.dto';
import { UpdateNotasAceptacionDto } from '../dto/update-notas-aceptacion.dto';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE')
@Controller('portafolio/aceptacion-notas')
export class AceptacionNotasController {
  constructor(private readonly aceptacionNotasService: AceptacionNotasService) {}

  @Post()
  generarReporte(@Body() dto: CreateReporteNotasDto) {
    return this.aceptacionNotasService.generarReporte(dto);
  }

  @Get(':id_oferta_asignatura/:tipo_reporte')
  getReporte(
    @Param('id_oferta_asignatura', ParseIntPipe) idOfertaAsignatura: number,
    @Param('tipo_reporte') tipoReporte: string,
  ) {
    return this.aceptacionNotasService.getReporte(idOfertaAsignatura, tipoReporte);
  }

  @Patch(':id_reporte_notas/notas')
  actualizarNotas(
    @Param('id_reporte_notas', ParseIntPipe) idReporteNotas: number,
    @Body() dto: UpdateNotasAceptacionDto,
  ) {
    return this.aceptacionNotasService.actualizarNotas(idReporteNotas, dto);
  }
}
