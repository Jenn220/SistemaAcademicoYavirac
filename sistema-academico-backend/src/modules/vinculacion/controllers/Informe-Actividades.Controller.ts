import { 
  Controller, 
  Get, 
  Patch, // 👈 Se agregó Patch
  Body,  // 👈 Se agregó Body
  Param, 
  ParseIntPipe, 
  Req, 
  UseGuards 
} from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

// Servicios
import { AuthVinculacionService } from '../services/auth-vinculacion.service';
import { InformeActividadesService } from '../services/informe-actividades.service';

// DTO 👈 Importa tu DTO
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

  // 🔴 AQUÍ ESTÁ LO QUE FALTABA: Endpoint para actualizar resultado de aprendizaje
  @Patch('actividad/:idActividad')
  @Roles('ESTUDIANTE', 'COORDINADOR')
  async actualizarResultadoAprendizaje(
    @Param('idActividad', ParseIntPipe) idActividad: number,
    @Body() dto: UpdateResultadoAprendizajeDto,
    @Req() req: any,
  ) {
    // 🔒 Resolvemos el id_vinculacion con el servicio de autenticación
const idVinculacionReal = await this.authService.resolverIdVinculacionLectura(req, 0);

    return await this.informeActividadesService.actualizarResultadoAprendizaje(
      idActividad,
      dto,
      req.user,
      idVinculacionReal,
    );
  }
}