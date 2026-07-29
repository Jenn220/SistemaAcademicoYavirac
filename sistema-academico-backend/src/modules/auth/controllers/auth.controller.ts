import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { CambiarPasswordDto } from '../dto/cambiar-password.dto';
import { GenerarAccesosDto } from '../dto/generar-accesos.dto';
import { DesbloquearDto } from '../dto/desbloquear.dto';
import { JwtGuard } from '../guards/jwt.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtGuard)
  @Post('cambiar-password')
  cambiarPassword(@Req() req: AuthenticatedRequest, @Body() dto: CambiarPasswordDto) {
    return this.authService.cambiarPassword(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.authService.me(req.user.sub);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('COORDINADOR')
  @Post('generar-accesos')
  generarAccesos(@Body() dto: GenerarAccesosDto) {
    return this.authService.generarAccesos(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('COORDINADOR')
  @Post('desbloquear')
  desbloquear(@Body() dto: DesbloquearDto) {
    return this.authService.desbloquear(dto);
  }
}
