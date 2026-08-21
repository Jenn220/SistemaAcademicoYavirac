import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { EvaluacionInstitutoService } from '../services/evaluacion-instituto.service';
import { EvaluacionCalculoService } from '../services/evaluacion-calculo.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateEvaluacionInstitutoDto } from '../dto/create-evaluacion-instituto.dto';
import { UpdateEvaluacionInstitutoDto } from '../dto/update-evaluacion-instituto.dto';

@UseGuards(JwtGuard, RolesGuard)
@Controller('fase-practica')
export class EvaluacionInstitutoController {
  constructor(private readonly service: EvaluacionInstitutoService, private readonly calculoService: EvaluacionCalculoService) {}

  // F08 (Evaluación Instituto) la califica exclusivamente el DOCENTE.
  // COORDINADOR solo puede consultarla (findByPractica/findOne) — nunca
  // crearla, editarla, borrarla ni recalcularla.
  @Post('evaluaciones-instituto')
  @Roles('DOCENTE')
  create(@Req() req: any, @Body() dto: CreateEvaluacionInstitutoDto) {
    return this.service.create(req.user, dto);
  }

  @Get('evaluaciones-instituto/practica/:idPractica')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR')
  findByPractica(@Param('idPractica') idPractica: string) {
    return this.service.findByPractica(Number(idPractica));
  }

  @Get('evaluaciones-instituto/:id')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch('evaluaciones-instituto/:id')
  @Roles('DOCENTE')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateEvaluacionInstitutoDto) {
    return this.service.update(req.user, Number(id), dto);
  }

  @Delete('evaluaciones-instituto/:id')
  @Roles('DOCENTE')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user, Number(id)).then(() => ({ deleted: true, id: Number(id) }));
  }

  @Post('evaluaciones-instituto/:id/calcular')
  @Roles('DOCENTE')
  async calcular(@Param('id') id: string) {
    const resultado = await this.calculoService.calcularEvaluacionInstituto(Number(id));
    return resultado;
  }
}
