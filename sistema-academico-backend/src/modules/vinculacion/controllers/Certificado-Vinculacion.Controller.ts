import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

// Importa los dos servicios necesarios
import { CertificadoVinculacionService } from '../services/certificado-vinculacion.service';
import { AuthVinculacionService } from '../services/auth-vinculacion.service';

@UseGuards(JwtGuard, RolesGuard)
@Controller('vinculacion/certificado')
export class CertificadoVinculacionController {
  constructor(
    // 1. Servicio de autenticación y resolución de IDs por rol
    private readonly authService: AuthVinculacionService,
    // 2. Servicio de negocio para la generación del certificado
    private readonly certificadoService: CertificadoVinculacionService,
  ) {}

  @Get(':id')
  @Roles('ESTUDIANTE', 'COORDINADOR')
  async obtenerCertificado(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    // ✅ Resuelve el ID usando authService
    const idFinal = await this.authService.resolverIdVinculacionLectura(req, id);
    
    // ✅ Obtiene la data del certificado usando certificadoService
    return await this.certificadoService.obtenerCertificadoVinculacion(idFinal);
  }
}