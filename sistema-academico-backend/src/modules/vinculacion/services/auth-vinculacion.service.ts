import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthVinculacionService {
  async resolverIdVinculacionLectura(req: any, idParam: number): Promise<number> {
    const user = req?.user;

    // 🛡️ Protección contra peticiones sin token o req.user undefined
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado o token JWT no proporcionado.');
    }

    // Normalizar lectura de roles (soporta arreglos o string único)
    const roles: string[] = Array.isArray(user.roles)
      ? user.roles
      : user.role
        ? [user.role]
        : [];

    if (roles.includes('ESTUDIANTE')) {
      // Si el Payload del JWT trae el idEstudiante o idVinculacion asociado
      return user.idEstudiante || idParam;
    }

    // Para Docente, Coordinador o Admin se respeta el id de la URL
    return idParam;
  }
}