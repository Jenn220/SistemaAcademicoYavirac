import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SeguimientoPeaService } from '../services/seguimiento-pea.service';
import { CreateSeguimientoPeaDto } from '../dto/create-seguimiento-pea.dto';
import { UpdateRepresentanteSeguimientoPeaDto } from '../dto/update-representante-seguimiento-pea.dto';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE')
@Controller('portafolio/seguimiento-pea')
export class SeguimientoPeaController {
  constructor(private readonly seguimientoPeaService: SeguimientoPeaService) {}

  @Post()
  create(@Body() dto: CreateSeguimientoPeaDto) {
    return this.seguimientoPeaService.create(dto);
  }

  @Get(':id_oferta_asignatura')
  getByOferta(@Param('id_oferta_asignatura', ParseIntPipe) idOfertaAsignatura: number) {
    return this.seguimientoPeaService.getByOferta(idOfertaAsignatura);
  }

  @Patch(':id_seguimiento_pea/representante')
  updateRepresentante(
    @Param('id_seguimiento_pea', ParseIntPipe) idSeguimientoPea: number,
    @Body() dto: UpdateRepresentanteSeguimientoPeaDto,
  ) {
    return this.seguimientoPeaService.updateRepresentante(idSeguimientoPea, dto);
  }
}
