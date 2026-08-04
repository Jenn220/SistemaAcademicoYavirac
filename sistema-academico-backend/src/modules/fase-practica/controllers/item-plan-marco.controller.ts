import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ItemPlanMarcoService } from '../services/item-plan-marco.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateItemPlanMarcoDto } from '../dto/create-item-plan-marco.dto';
import { UpdateItemPlanMarcoDto } from '../dto/update-item-plan-marco.dto';

// ESTUDIANTE crea/edita/elimina resultados de aprendizaje; el resto solo consulta.
@UseGuards(JwtGuard, RolesGuard)
@Controller('fase-practica')
export class ItemPlanMarcoController {
  constructor(private readonly itemPlanMarcoService: ItemPlanMarcoService) {}

  @Post('plan-marco/:idPlanMarco/items')
  @Roles('ESTUDIANTE')
  create(@Req() req: any, @Param('idPlanMarco') idPlanMarco: string, @Body() dto: CreateItemPlanMarcoDto) {
    return this.itemPlanMarcoService.create(req.user, { ...dto, id_plan_marco: Number(idPlanMarco) });
  }

  @Get('plan-marco/:idPlanMarco/items')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  findByPlanMarco(@Param('idPlanMarco') idPlanMarco: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.itemPlanMarcoService.findByPlanMarco(Number(idPlanMarco), skip ? Number(skip) : undefined, take ? Number(take) : undefined);
  }

  @Get('items-plan-marco/:id')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'TUTOR_EMPRESARIAL')
  findOne(@Param('id') id: string) {
    return this.itemPlanMarcoService.findById(Number(id));
  }

  @Patch('items-plan-marco/:id')
  @Roles('ESTUDIANTE')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateItemPlanMarcoDto) {
    return this.itemPlanMarcoService.update(req.user, Number(id), dto);
  }

  @Delete('items-plan-marco/:id')
  @Roles('ESTUDIANTE')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.itemPlanMarcoService.remove(req.user, Number(id)).then(() => ({ deleted: true, id_item_pm: Number(id) }));
  }
}
