import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { AceptacionNotasService } from '../services/aceptacion-notas.service';
import { CreateReporteNotasDto } from '../dto/create-reporte-notas.dto';
import { UpdateNotasAceptacionDto } from '../dto/update-notas-aceptacion.dto';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE')
@Controller('portafolio/aceptacion-notas')
export class AceptacionNotasController {
  constructor(private readonly aceptacionNotasService: AceptacionNotasService) {}

  @Post()
  generarReporte(@Req() req: AuthenticatedRequest, @Body() dto: CreateReporteNotasDto) {
    return this.aceptacionNotasService.generarReporte(dto, req.user.idDocente!);
  }

  @Get(':id_oferta_asignatura/:tipo_reporte')
  getReporte(
    @Req() req: AuthenticatedRequest,
    @Param('id_oferta_asignatura', ParseIntPipe) idOfertaAsignatura: number,
    @Param('tipo_reporte') tipoReporte: string,
  ) {
    return this.aceptacionNotasService.getReporte(idOfertaAsignatura, tipoReporte, req.user.idDocente!);
  }

  @Patch(':id_reporte_notas/notas')
  actualizarNotas(
    @Req() req: AuthenticatedRequest,
    @Param('id_reporte_notas', ParseIntPipe) idReporteNotas: number,
    @Body() dto: UpdateNotasAceptacionDto,
  ) {
    return this.aceptacionNotasService.actualizarNotas(idReporteNotas, req.user.idDocente!, dto);
  }
}
