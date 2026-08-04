import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { EvaluacionEmpresaService } from '../services/evaluacion-empresa.service';
import { EvaluacionCalculoService } from '../services/evaluacion-calculo.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateEvaluacionEmpresaDto } from '../dto/create-evaluacion-empresa.dto';
import { UpdateEvaluacionEmpresaDto } from '../dto/update-evaluacion-empresa.dto';

@UseGuards(JwtGuard, RolesGuard)
@Controller('fase-practica')
export class EvaluacionEmpresaController {
  constructor(private readonly service: EvaluacionEmpresaService, private readonly calculoService: EvaluacionCalculoService) {}

  @Post('evaluaciones-empresa')
  @Roles('DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  create(@Req() req: any, @Body() dto: CreateEvaluacionEmpresaDto) {
    return this.service.create(req.user, dto);
  }

  @Get('evaluaciones-empresa/practica/:idPractica')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  findByPractica(@Param('idPractica') idPractica: string) {
    return this.service.findByPractica(Number(idPractica));
  }

  @Get('evaluaciones-empresa/:id')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch('evaluaciones-empresa/:id')
  @Roles('DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateEvaluacionEmpresaDto) {
    return this.service.update(req.user, Number(id), dto);
  }

  @Delete('evaluaciones-empresa/:id')
  @Roles('DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user, Number(id)).then(() => ({ deleted: true, id: Number(id) }));
  }

  @Post('evaluaciones-empresa/:id/calcular')
  @Roles('DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  async calcular(@Param('id') id: string) {
    const resultado = await this.calculoService.calcularEvaluacionEmpresarial(Number(id));
    return resultado;
  }
}
