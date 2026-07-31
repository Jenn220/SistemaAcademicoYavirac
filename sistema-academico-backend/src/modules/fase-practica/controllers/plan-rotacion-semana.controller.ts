import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PlanRotacionSemanaService } from '../services/plan-rotacion-semana.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreatePlanRotacionSemanaDto } from '../dto/create-plan-rotacion-semana.dto';
import { UpdatePlanRotacionSemanaDto } from '../dto/update-plan-rotacion-semana.dto';

// ESTUDIANTE gestiona las semanas de rotación; el resto solo consulta.
@UseGuards(JwtGuard, RolesGuard)
@Controller('fase-practica')
export class PlanRotacionSemanaController {
  constructor(private readonly service: PlanRotacionSemanaService) {}

  @Post('plan-rotacion/:idPlanRotacion/semanas')
  @Roles('ESTUDIANTE')
  create(@Param('idPlanRotacion') idPlanRotacion: string, @Body() dto: CreatePlanRotacionSemanaDto) {
    return this.service.create({ ...dto, id_plan_rotacion: Number(idPlanRotacion) });
  }

  @Get('plan-rotacion/:idPlanRotacion/semanas')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  findByPlanRotacion(@Param('idPlanRotacion') idPlanRotacion: string) {
    return this.service.findByPlanRotacion(Number(idPlanRotacion));
  }

  @Get('plan-rotacion-semanas/:id')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch('plan-rotacion-semanas/:id')
  @Roles('ESTUDIANTE')
  update(@Param('id') id: string, @Body() dto: UpdatePlanRotacionSemanaDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete('plan-rotacion-semanas/:id')
  @Roles('ESTUDIANTE')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id)).then(() => ({ deleted: true, id_rotacion_semana: Number(id) }));
  }
}
