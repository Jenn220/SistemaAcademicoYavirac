import { Controller, Get, Param } from '@nestjs/common';
import { InformeFasePracticaService } from '../services/informe-fase-practica.service';

@Controller('fase-practica')
export class InformeFasePracticaController {
  constructor(private readonly informeService: InformeFasePracticaService) {}

  @Get('informes/:idPractica')
  getInforme(@Param('idPractica') idPractica: string) {
    return this.informeService.obtenerInforme(Number(idPractica));
  }
}
