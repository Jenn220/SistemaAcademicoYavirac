import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PlanMarcoService } from '../services/plan-marco.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreatePlanMarcoDto } from '../dto/create-plan-marco.dto';
import { UpdatePlanMarcoDto } from '../dto/update-plan-marco.dto';

// El ESTUDIANTE es quien crea/edita/elimina su Plan Marco; el resto de
// roles (DOCENTE, COORDINADOR, TUTOR_EMPRESARIAL) solo consulta.
@UseGuards(JwtGuard, RolesGuard)
@Controller('fase-practica')
export class PlanMarcoController {
  constructor(private readonly planMarcoService: PlanMarcoService) {}

  @Post('plan-marco')
  @Roles('ESTUDIANTE')
  create(@Req() req: any, @Body() dto: CreatePlanMarcoDto) {
    return this.planMarcoService.create(req.user, dto);
  }

  @Get('plan-marco/practica/:idPractica')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  findByPractica(@Param('idPractica') idPractica: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.planMarcoService.findByPractica(Number(idPractica), skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Get('plan-marco/:id')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  findById(@Param('id') id: string) {
    return this.planMarcoService.findById(Number(id));
  }

  @Patch('plan-marco/:id')
  @Roles('ESTUDIANTE')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePlanMarcoDto) {
    return this.planMarcoService.update(req.user, Number(id), dto);
  }

  @Delete('plan-marco/:id')
  @Roles('ESTUDIANTE')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.planMarcoService.remove(req.user, Number(id)).then(() => ({ deleted: true, id_plan_marco: Number(id) }));
  }

  @Post('plan-marco/:id/sincronizar-rotacion')
  @Roles('ESTUDIANTE')
  sincronizarPlanRotacion(@Req() req: any, @Param('id') id: string) {
    return this.planMarcoService.sincronizarPlanRotacion(Number(id));
  }
}
