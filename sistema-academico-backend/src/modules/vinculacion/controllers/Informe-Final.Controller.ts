import { Controller, Get, Param, ParseIntPipe, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

import { AuthVinculacionService } from '../services/auth-vinculacion.service';
import { InformeFinalService } from '../services/informe-final.service';

@UseGuards(JwtGuard, RolesGuard)
@Controller('vinculacion/informe-final')
export class InformeFinalController {
  constructor(
    private readonly authService: AuthVinculacionService,
    private readonly informeFinalService: InformeFinalService,
  ) {}

  // 🟢 NUEVO ENDPOINT: Listar informes de los estudiantes a cargo del docente
  @Get()
  @Roles('DOCENTE', 'COORDINADOR')
  async listarInformesDocente(@Req() req: any) {
    // Se obtiene el ID del docente desde el token JWT
    const idDocente = req.user?.id_docente || req.user?.idDocente || req.user?.sub;

    if (!idDocente) {
      throw new UnauthorizedException('No se pudo determinar la identidad del docente autenticado.');
    }

    return await this.informeFinalService.listarInformesPorDocente(Number(idDocente));
  }

  // 📌 Obtener un informe final específico por ID de vinculación
  @Get(':id')
  @Roles('ESTUDIANTE', 'DOCENTE', 'COORDINADOR')
  async obtenerInformeFinal(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const idFinal = await this.authService.resolverIdVinculacionLectura(req, id);
    return await this.informeFinalService.obtenerInformeFinal(idFinal);
  }
}