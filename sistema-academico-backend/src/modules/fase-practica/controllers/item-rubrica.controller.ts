import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ItemRubricaService } from '../services/item-rubrica.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateItemRubricaDto } from '../dto/create-item-rubrica.dto';
import { UpdateItemRubricaDto } from '../dto/update-item-rubrica.dto';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE', 'COORDINADOR')
@Controller('fase-practica')
export class ItemRubricaController {
  constructor(private readonly service: ItemRubricaService) {}

  @Post('rubricas/:idRubrica/items')
  create(@Param('idRubrica') idRubrica: string, @Body() dto: CreateItemRubricaDto) {
    return this.service.create({ ...dto, id_rubrica: Number(idRubrica) });
  }

  @Get('rubricas/:idRubrica/items')
  findByRubrica(@Param('idRubrica') idRubrica: string) {
    return this.service.findByRubrica(Number(idRubrica));
  }

  @Get('items-rubrica/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch('items-rubrica/:id')
  update(@Param('id') id: string, @Body() dto: UpdateItemRubricaDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete('items-rubrica/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id)).then(() => ({ deleted: true, id_item: Number(id) }));
  }
}
