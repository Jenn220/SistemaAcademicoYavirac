import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstudianteEntity } from '../domain/estudiante.entity';
import { EmpresaEntity } from '../domain/empresa.entity';
import { FichaGeneralDto } from '../dto/ficha-general.dto';
import { UpdateFichaGeneralDto } from '../dto/update-ficha-general.dto';

@Injectable()
export class FichaGeneralService {
  constructor(
    @InjectRepository(EstudianteEntity)
    private readonly estudianteRepository: Repository<EstudianteEntity>,
    @InjectRepository(EmpresaEntity)
    private readonly empresaRepository: Repository<EmpresaEntity>,
  ) {}

  async findByIdEstudiante(idEstudiante: number) {
    const estudiante = await this.estudianteRepository.findOne({ where: { id_estudiante: idEstudiante } });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con id ${idEstudiante} no encontrado`);
    }
    return estudiante;
  }

  async actualizarFicha(idEstudiante: number, dto: UpdateFichaGeneralDto) {
    const estudiante = await this.findByIdEstudiante(idEstudiante);
    Object.assign(estudiante, dto);
    return this.estudianteRepository.save(estudiante);
  }

  async findEmpresasRelacionadas(idEstudiante: number) {
    return this.empresaRepository.find();
  }
}
