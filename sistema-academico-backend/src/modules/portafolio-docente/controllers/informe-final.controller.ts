import { Controller, Get, Post, Body, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { InformeFinalService } from '../services/informe-final.service';
import { CreateInformeFinalDto } from '../dto/create-informe-final.dto';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE')
@Controller('portafolio/informe-final')
export class InformeFinalController {
  constructor(private readonly informeFinalService: InformeFinalService) {}

  @Get(':id_oferta_asignatura')
  getInformeFinal(
    @Req() req: AuthenticatedRequest,
    @Param('id_oferta_asignatura', ParseIntPipe) idOfertaAsignatura: number,
  ) {
    return this.informeFinalService.getInformeFinal(req.user.idDocente!, idOfertaAsignatura);
  }

  @Post()
  createInformeFinal(@Body() dto: CreateInformeFinalDto) {
    return this.informeFinalService.createInformeFinal(dto);
  }
}
