import { Controller, Get, Post, UseGuards, Body, Param, Query, Req } from '@nestjs/common';
import { NotificacionService } from '../services/notificacion.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE', 'ESTUDIANTE', 'TUTOR_EMPRESARIAL', 'COORDINADOR')
@Controller('fase-practica/notificaciones')
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}

  @Get()
  listar(@Req() req: any, @Query('soloNoLeidas') soloNoLeidas?: string) {
    const idUsuario = Number(req.user.sub);
    return this.notificacionService.listarNotificaciones(idUsuario, soloNoLeidas === 'true');
  }

  @Get('no-leidas/count')
  contar(@Req() req: any) {
    const idUsuario = Number(req.user.sub);
    return this.notificacionService.contarNoLeidas(idUsuario);
  }

  @Post('marcar-leida/:id')
  marcarLeida(@Req() req: any, @Param('id') idNotificacion: string) {
    const idUsuario = Number(req.user.sub);
    return this.notificacionService.marcarComoLeida(Number(idNotificacion), idUsuario);
  }
}
