import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InformeFasePracticaService } from '../services/informe-fase-practica.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
@Controller('fase-practica')
export class InformeFasePracticaController {
  constructor(private readonly informeService: InformeFasePracticaService) {}

  @Get('informes/:idPractica')
  getInforme(@Param('idPractica') idPractica: string) {
    return this.informeService.obtenerInforme(Number(idPractica));
  }
}
