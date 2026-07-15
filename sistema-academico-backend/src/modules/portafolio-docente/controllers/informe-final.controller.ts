import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { InformeFinalService } from '../services/informe-final.service';
import { CreateInformeFinalDto } from '../dto/create-informe-final.dto';

@Controller('portafolio/informe-final')
export class InformeFinalController {
  constructor(private readonly informeFinalService: InformeFinalService) {}

  @Get(':id_docente/:id_periodo')
  getInformeFinal(
    @Param('id_docente', ParseIntPipe) idDocente: number,
    @Param('id_periodo', ParseIntPipe) idPeriodo: number,
  ) {
    return this.informeFinalService.getInformeFinal(idDocente, idPeriodo);
  }

  @Post()
  createInformeFinal(@Body() dto: CreateInformeFinalDto) {
    return this.informeFinalService.createInformeFinal(dto);
  }
}
