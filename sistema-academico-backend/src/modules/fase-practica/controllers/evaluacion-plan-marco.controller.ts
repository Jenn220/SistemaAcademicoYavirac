import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { EvaluacionPlanMarcoService } from '../services/evaluacion-plan-marco.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateEvaluacionPlanMarcoDto } from '../dto/create-evaluacion-plan-marco.dto';
import { UpdateEvaluacionPlanMarcoDto } from '../dto/update-evaluacion-plan-marco.dto';

// "Nivel real alcanzado" del Plan Marco: lo registra el ESTUDIANTE, igual
// que el resto del Plan Marco; el resto de roles solo consulta.
@UseGuards(JwtGuard, RolesGuard)
@Controller('fase-practica')
export class EvaluacionPlanMarcoController {
  constructor(private readonly service: EvaluacionPlanMarcoService) {}

  @Post('evaluacion-plan-marco')
  @Roles('ESTUDIANTE')
  create(@Req() req: any, @Body() dto: CreateEvaluacionPlanMarcoDto) {
    return this.service.crearOActualizar(req.user, dto);
  }

  @Get('evaluacion-plan-marco/practica/:idPractica')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  findByPractica(@Param('idPractica') idPractica: string) {
    return this.service.findByPractica(Number(idPractica));
  }

  @Get('evaluacion-plan-marco/:id')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  findById(@Param('id') id: string) {
    return this.service.findById(Number(id));
  }

  @Patch('evaluacion-plan-marco/:id')
  @Roles('ESTUDIANTE')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateEvaluacionPlanMarcoDto) {
    return this.service.update(req.user, Number(id), dto);
  }

  @Delete('evaluacion-plan-marco/:id')
  @Roles('ESTUDIANTE')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user, Number(id));
  }
}
