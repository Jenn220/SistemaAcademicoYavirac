import { Controller, Get, Patch, Param, Body, ParseIntPipe, Req, UseGuards, Post } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

import { AuthVinculacionService } from '../services/auth-vinculacion.service';
import { InicioActividadesTutorService } from '../services/inicio-actividades-tutor.service';
import { UpdateInicioActividadesDto } from '../dto/update-inicio-actividades.dto';
import { CreateInicioActividadesDto } from '../dto/create-inicio-actividades.dto';

@UseGuards(JwtGuard, RolesGuard)
@Controller('vinculacion/inicio-actividades')
export class InicioActividadesTutorController {
  constructor(
    private readonly authService: AuthVinculacionService,
    private readonly inicioActividadesService: InicioActividadesTutorService,
  ) {}

  @Get()
  @Roles('DOCENTE', 'COORDINADOR')
  async obtenerTodasPorDocente(@Req() req: any) {
    return await this.inicioActividadesService.obtenerIniciosActividadesPorDocente(req.user.idDocente);
  }

  @Get(':id')
  @Roles('ESTUDIANTE', 'COORDINADOR', 'DOCENTE')
  async obtenerInicioActividades(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const idFinal = await this.authService.resolverIdVinculacionLectura(req, id);
    return await this.inicioActividadesService.obtenerInicioActividadesTutor(idFinal);
  }

  @Patch(':id')
  @Roles('DOCENTE', 'COORDINADOR')
  async actualizarInicioActividades(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInicioActividadesDto,
    @Req() req: any,
  ) {
    const idFinal = await this.authService.resolverIdVinculacionLectura(req, id);
    return await this.inicioActividadesService.actualizarInicioActividadesTutor(idFinal, dto);
  }

  @Post(':id')
  @Roles('DOCENTE', 'COORDINADOR')
  async crearInicioActividades(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateInicioActividadesDto,
    @Req() req: any,
  ) {
    const idFinal = await this.authService.resolverIdVinculacionLectura(req, id);
    return await this.inicioActividadesService.actualizarInicioActividadesTutor(idFinal, dto);
  }
}