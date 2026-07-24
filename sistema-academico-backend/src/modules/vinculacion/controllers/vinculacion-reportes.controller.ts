import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { VinculacionReportesService } from '../services/vinculacion-reportes.service';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
@Controller('vinculacion/reportes')
export class VinculacionReportesController {
  constructor(private readonly reportesService: VinculacionReportesService) {}

  @Get(':id')
  async obtenerReporteConsolidado(@Param('id', ParseIntPipe) id: number) {
    return await this.reportesService.obtenerReporteConsolidado(id);
  }

  @Get('acta-compromiso/:id')
  async obtenerActaCompromiso(@Param('id', ParseIntPipe) id: number) {
    return await this.reportesService.obtenerActaCompromiso(id);
  }

  @Get('asistencia-tutor/:id')
  async obtenerReporteAsistenciaTutor(@Param('id', ParseIntPipe) id: number) {
    return await this.reportesService.obtenerReporteAsistenciaTutor(id);
  }

  @Get('informe-actividades/:id')
  async obtenerInformeActividades(@Param('id', ParseIntPipe) id: number) {
    return await this.reportesService.obtenerInformeActividades(id);
  }

  @Get('certificado/:id')
  async obtenerCertificadoVinculacion(@Param('id', ParseIntPipe) id: number) {
    return await this.reportesService.obtenerCertificadoVinculacion(id);
  }

  @Get('inicio-tutor/:id')
  async obtenerInicioActividadesTutor(@Param('id', ParseIntPipe) id: number) {
    return await this.reportesService.obtenerInicioActividadesTutor(id);
  }

  @Get('informe-final/:id')
  async obtenerInformeFinal(@Param('id', ParseIntPipe) id: number) {
    return await this.reportesService.obtenerInformeFinal(id);
  }
}