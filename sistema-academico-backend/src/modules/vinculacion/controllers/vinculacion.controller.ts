// 📁 src/modules/vinculacion/controllers/vinculacion.controller.ts

import { Controller, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { VinculacionService } from '../services/vinculacion.service';

@UseGuards(JwtGuard, RolesGuard)
@Controller('vinculacion')
export class VinculacionController {
  constructor(private readonly vinculacionService: VinculacionService) {}

  /**
   * ✅ Obtener vinculación activa del estudiante autenticado
   * GET /api/vinculacion/estudiante/vinculacion-activa
   */
  @Get('estudiante/vinculacion-activa')
  @Roles('ESTUDIANTE')
  async obtenerVinculacionActiva(@Req() req: any) {
    const idEstudiante = req.user?.idEstudiante || req.user?.sub || req.user?.id_estudiante;
    
    if (!idEstudiante) {
      throw new UnauthorizedException('No se pudo identificar al estudiante.');
    }

    return await this.vinculacionService.obtenerVinculacionActivaPorEstudiante(Number(idEstudiante));
  }
}