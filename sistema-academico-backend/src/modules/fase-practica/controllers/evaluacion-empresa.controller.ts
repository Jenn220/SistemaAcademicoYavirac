import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EvaluacionEmpresaService } from '../services/evaluacion-empresa.service';
import { EvaluacionCalculoService } from '../services/evaluacion-calculo.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateEvaluacionEmpresaDto } from '../dto/create-evaluacion-empresa.dto';
import { UpdateEvaluacionEmpresaDto } from '../dto/update-evaluacion-empresa.dto';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE', 'COORDINADOR')
@Controller('fase-practica')
export class EvaluacionEmpresaController {
  constructor(private readonly service: EvaluacionEmpresaService, private readonly calculoService: EvaluacionCalculoService) {}

  @Post('evaluaciones-empresa')
  create(@Body() dto: CreateEvaluacionEmpresaDto) {
    return this.service.create(dto);
  }

  @Get('evaluaciones-empresa/practica/:idPractica')
  findByPractica(@Param('idPractica') idPractica: string) {
    return this.service.findByPractica(Number(idPractica));
  }

  @Get('evaluaciones-empresa/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch('evaluaciones-empresa/:id')
  update(@Param('id') id: string, @Body() dto: UpdateEvaluacionEmpresaDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete('evaluaciones-empresa/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id)).then(() => ({ deleted: true, id: Number(id) }));
  }

  @Post('evaluaciones-empresa/:id/calcular')
  async calcular(@Param('id') id: string) {
    const resultado = await this.calculoService.calcularEvaluacionEmpresarial(Number(id));
    return resultado;
  }
}
