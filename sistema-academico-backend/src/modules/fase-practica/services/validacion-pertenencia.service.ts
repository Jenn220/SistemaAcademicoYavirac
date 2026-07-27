import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticaEntity } from '../domain/practica.entity';
import { EstudianteEntity } from '../domain/estudiante.entity';

@Injectable()
export class ValidacionPertenenciaService {
  constructor(
    @InjectRepository(PracticaEntity)
    private readonly practicaRepository: Repository<PracticaEntity>,
    @InjectRepository(EstudianteEntity)
    private readonly estudianteRepository: Repository<EstudianteEntity>,
  ) {}

  async validarEstudianteExiste(idEstudiante: number): Promise<EstudianteEntity> {
    const estudiante = await this.estudianteRepository.findOne({ where: { id_estudiante: idEstudiante } });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con id ${idEstudiante} no encontrado`);
    }
    return estudiante;
  }

  async validarPracticaPerteneceAEstudiante(idPractica: number, idEstudiante: number): Promise<PracticaEntity> {
    const practica = await this.practicaRepository.findOne({ where: { id_practica: idPractica } });
    if (!practica) {
      throw new NotFoundException(`Practica con id ${idPractica} no encontrada`);
    }

    const estudiante = await this.validarEstudianteExiste(idEstudiante);

    if (practica.id_practica !== idPractica) {
      throw new ForbiddenException(`La practica ${idPractica} no pertenece al estudiante ${idEstudiante}`);
    }

    return practica;
  }
}
