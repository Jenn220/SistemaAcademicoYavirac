import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { SeguimientoPeaService } from '../services/seguimiento-pea.service';
import { CreateSeguimientoPeaDto } from '../dto/create-seguimiento-pea.dto';
import { UpdateRepresentanteSeguimientoPeaDto } from '../dto/update-representante-seguimiento-pea.dto';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE')
@Controller('portafolio/seguimiento-pea')
export class SeguimientoPeaController {
  constructor(private readonly seguimientoPeaService: SeguimientoPeaService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateSeguimientoPeaDto) {
    return this.seguimientoPeaService.create(dto, req.user.idDocente!);
  }

  @Get(':id_oferta_asignatura')
  getByOferta(@Req() req: AuthenticatedRequest, @Param('id_oferta_asignatura', ParseIntPipe) idOfertaAsignatura: number) {
    return this.seguimientoPeaService.getByOferta(idOfertaAsignatura, req.user.idDocente!);
  }

  @Patch(':id_seguimiento_pea/representante')
  updateRepresentante(
    @Req() req: AuthenticatedRequest,
    @Param('id_seguimiento_pea', ParseIntPipe) idSeguimientoPea: number,
    @Body() dto: UpdateRepresentanteSeguimientoPeaDto,
  ) {
    return this.seguimientoPeaService.updateRepresentante(idSeguimientoPea, req.user.idDocente!, dto);
  }
}
