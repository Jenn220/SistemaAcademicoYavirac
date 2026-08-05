import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VinculacionEstudianteEntity } from '../domain/vinculacion-estudiante.entity';

@Injectable()
export class AuthVinculacionService {
  constructor(
    @InjectRepository(VinculacionEstudianteEntity)
    private readonly vinculacionRepo: Repository<VinculacionEstudianteEntity>,
  ) {}

  async resolverIdVinculacionLectura(req: any, idParam: number): Promise<number> {
    const user = req?.user;
    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado o token JWT no proporcionado.');
    }

    const roles: string[] = Array.isArray(user.roles)
      ? user.roles
      : user.role
        ? [user.role]
        : [];

    // Si es estudiante, obtener su id_vinculacion desde la BD
    if (roles.includes('ESTUDIANTE')) {
      const idEstudiante = user.idEstudiante || user.sub;
      if (!idEstudiante) {
        throw new UnauthorizedException('No se pudo identificar al estudiante.');
      }

      // Buscar la vinculación activa del estudiante
      const vinculacion = await this.vinculacionRepo
        .createQueryBuilder('vinc')
        .innerJoin('matricula_detalle', 'mat', 'vinc.id_matricula_detalle = mat.id_matricula_detalle')
        .innerJoin('matricula', 'm', 'mat.id_matricula = m.id_matricula')
        .where('m.id_estudiante = :idEstudiante', { idEstudiante: Number(idEstudiante) })
        .orderBy('vinc.id_vinculacion', 'DESC')
        .getOne();

      if (!vinculacion) {
        throw new NotFoundException('No se encontró un proceso de vinculación activo para este estudiante.');
      }

      // Si el parámetro de URL es 0 o no coincide, usar el ID de la BD
      if (idParam === 0) {
        return Number(vinculacion.id_vinculacion);
      }

      // Verificar que el estudiante tenga acceso a esta vinculación
      if (Number(vinculacion.id_vinculacion) !== idParam) {
        throw new UnauthorizedException('No tienes acceso a esta vinculación.');
      }

      return idParam;
    }

    // Para Docente, Coordinador o Admin se respeta el id de la URL
    return idParam;
  }
}