import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstudianteEntity } from '../domain/estudiante.entity';
import { ActualizarDatosEstudianteDto } from '../dto/actualizar-datos-estudiante.dto';

@Injectable()
export class DatosGeneralesService {
  constructor(
    @InjectRepository(EstudianteEntity)
    private readonly estudianteRepository: Repository<EstudianteEntity>,
  ) {}

  async findById(idEstudiante: number): Promise<EstudianteEntity> {
    const estudiante = await this.estudianteRepository.findOne({ where: { id_estudiante: idEstudiante } });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con id ${idEstudiante} no encontrado`);
    }
    return estudiante;
  }

  async actualizarDatos(idEstudiante: number, dto: ActualizarDatosEstudianteDto): Promise<EstudianteEntity> {
    const estudiante = await this.findById(idEstudiante);
    Object.assign(estudiante, dto);
    return this.estudianteRepository.save(estudiante);
  }
}
