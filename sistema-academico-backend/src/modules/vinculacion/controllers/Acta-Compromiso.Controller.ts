import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

import { AuthVinculacionService } from '../services/auth-vinculacion.service';
import { ActaCompromisoService } from '../services/acta-compromiso.service';

@UseGuards(JwtGuard, RolesGuard) // 👈 OBLIGATORIO: Activa Passport para popular req.user
@Controller('vinculacion/acta-compromiso')
export class ActaCompromisoController {
  constructor(
    private readonly authService: AuthVinculacionService,
    private readonly actaService: ActaCompromisoService,
  ) {}

  @Get(':id')
  @Roles('ESTUDIANTE', 'COORDINADOR') // 👈 Define qué roles pueden consumir este endpoint
  async obtenerActa(
    @Param('id', ParseIntPipe) id: number, 
    @Req() req: any
  ) {
    const idFinal = await this.authService.resolverIdVinculacionLectura(req, id);
    return await this.actaService.obtenerActaCompromiso(idFinal);
  }
}