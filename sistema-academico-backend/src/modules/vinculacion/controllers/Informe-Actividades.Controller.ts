import { 
  Controller, 
  Get, 
  Patch,
  Body,
  Param, 
  ParseIntPipe, 
  Req, 
  UseGuards,
  NotFoundException
} from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

import { AuthVinculacionService } from '../services/auth-vinculacion.service';
import { InformeActividadesService } from '../services/informe-actividades.service';
import { UpdateResultadoAprendizajeDto } from '../dto/update-resultado-aprendizaje.dto';

@UseGuards(JwtGuard, RolesGuard)
@Controller('vinculacion/informe-actividades')
export class InformeActividadesController {
  constructor(
    private readonly authService: AuthVinculacionService,
    private readonly informeActividadesService: InformeActividadesService,
  ) {}

  @Get(':id')
  @Roles('ESTUDIANTE', 'COORDINADOR')
  async obtenerInformeActividades(
    @Param('id', ParseIntPipe) id: number, 
    @Req() req: any
  ) {
    const idFinal = await this.authService.resolverIdVinculacionLectura(req, id);
    return await this.informeActividadesService.obtenerInformeActividades(idFinal);
  }

  @Patch('actividad/:idActividad')
  @Roles('ESTUDIANTE', 'COORDINADOR')
  async actualizarResultadoAprendizaje(
    @Param('idActividad', ParseIntPipe) idActividad: number,
    @Body() dto: UpdateResultadoAprendizajeDto,
    @Req() req: any,
  ) {
    // ✅ Obtener la actividad para saber su id_vinculacion
    const actividad = await this.informeActividadesService.obtenerActividadPorId(idActividad);
    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${idActividad} no encontrada`);
    }

    // Resolver la vinculación del usuario autenticado
    const idVinculacionReal = await this.authService.resolverIdVinculacionLectura(req, Number(actividad.id_vinculacion));

    return await this.informeActividadesService.actualizarResultadoAprendizaje(
      idActividad,
      dto,
      req.user,
      idVinculacionReal,
    );
  }
}