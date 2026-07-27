import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EvaluacionInstitutoService } from '../services/evaluacion-instituto.service';
import { EvaluacionCalculoService } from '../services/evaluacion-calculo.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateEvaluacionInstitutoDto } from '../dto/create-evaluacion-instituto.dto';
import { UpdateEvaluacionInstitutoDto } from '../dto/update-evaluacion-instituto.dto';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE', 'COORDINADOR')
@Controller('fase-practica')
export class EvaluacionInstitutoController {
  constructor(private readonly service: EvaluacionInstitutoService, private readonly calculoService: EvaluacionCalculoService) {}

  @Post('evaluaciones-instituto')
  create(@Body() dto: CreateEvaluacionInstitutoDto) {
    return this.service.create(dto);
  }

  @Get('evaluaciones-instituto/practica/:idPractica')
  findByPractica(@Param('idPractica') idPractica: string) {
    return this.service.findByPractica(Number(idPractica));
  }

  @Get('evaluaciones-instituto/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch('evaluaciones-instituto/:id')
  update(@Param('id') id: string, @Body() dto: UpdateEvaluacionInstitutoDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete('evaluaciones-instituto/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id)).then(() => ({ deleted: true, id: Number(id) }));
  }

  @Post('evaluaciones-instituto/:id/calcular')
  async calcular(@Param('id') id: string) {
    const resultado = await this.calculoService.calcularEvaluacionInstituto(Number(id));
    return resultado;
  }
}
