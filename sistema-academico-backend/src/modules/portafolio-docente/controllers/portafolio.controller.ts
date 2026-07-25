import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PortafolioService } from '../services/portafolio.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';

@UseGuards(JwtGuard, RolesGuard)
@Roles('DOCENTE')
@Controller('portafolio')
export class PortafolioController {
  constructor(private readonly portafolioService: PortafolioService) {}

  @Get('mis-ofertas')
  getMisOfertas(@Req() req: AuthenticatedRequest) {
    return this.portafolioService.getMisOfertas(req.user.idDocente!);
  }
}
