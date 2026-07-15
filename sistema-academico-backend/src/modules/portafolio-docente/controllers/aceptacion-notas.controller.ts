import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AceptacionNotasService } from '../services/aceptacion-notas.service';
import { CreateReporteNotasDto } from '../dto/create-reporte-notas.dto';

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
}
