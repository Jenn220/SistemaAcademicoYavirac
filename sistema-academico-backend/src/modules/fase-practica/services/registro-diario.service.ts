import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { REGISTRO_DIARIO_REPOSITORY, IRegistroDiarioRepository } from '../ports/registro-diario.repository.port';
import { CreateRegistroDiarioDto } from '../dto/create-registro-diario.dto';
import { UpdateRegistroDiarioDto } from '../dto/update-registro-diario.dto';
import { RegistroDiarioEntity } from '../domain/registro-diario.entity';

@Injectable()
export class RegistroDiarioService {
  constructor(
    @Inject(REGISTRO_DIARIO_REPOSITORY)
    private readonly registroDiarioRepository: IRegistroDiarioRepository,
  ) {}

  async create(dto: CreateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    return this.registroDiarioRepository.createWithRecalculoHoras(dto);
  }

  async findByPractica(idPractica: number, skip?: number, take?: number): Promise<RegistroDiarioEntity[]> {
    return this.registroDiarioRepository.findByPractica(idPractica, skip, take);
  }

  async findById(id: number): Promise<RegistroDiarioEntity> {
    const registro = await this.registroDiarioRepository.findById(id);
    if (!registro) throw new NotFoundException(`No se encontró el registro diario con id ${id}`);
    return registro;
  }

  async update(id: number, dto: UpdateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    return this.registroDiarioRepository.updateWithRecalculoHoras(id, dto);
  }

  async remove(id: number): Promise<void> {
    return this.registroDiarioRepository.removeWithRecalculoHoras(id);
  }
}
