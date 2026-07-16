import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { INFORME_APRENDIZAJE_REPOSITORY, IInformeAprendizajeRepository } from '../ports/informe-aprendizaje.repository.port';
import { CreateInformeAprendizajeDto } from '../dto/create-informe-aprendizaje.dto';
import { UpdateInformeAprendizajeDto } from '../dto/update-informe-aprendizaje.dto';
import { InformeAprendizajeEntity } from '../domain/informe-aprendizaje.entity';

@Injectable()
export class InformeAprendizajeService {
  constructor(
    @Inject(INFORME_APRENDIZAJE_REPOSITORY)
    private readonly informeAprendizajeRepository: IInformeAprendizajeRepository,
  ) {}

  async create(dto: CreateInformeAprendizajeDto): Promise<InformeAprendizajeEntity> {
    return this.informeAprendizajeRepository.create(dto);
  }

  async findByPractica(idPractica: number, skip?: number, take?: number): Promise<InformeAprendizajeEntity[]> {
    return this.informeAprendizajeRepository.findByPractica(idPractica, skip, take);
  }

  async findById(id: number): Promise<InformeAprendizajeEntity> {
    const informe = await this.informeAprendizajeRepository.findById(id);
    if (!informe) throw new NotFoundException(`No se encontró el informe con id ${id}`);
    return informe;
  }

  async update(id: number, dto: UpdateInformeAprendizajeDto): Promise<InformeAprendizajeEntity> {
    await this.findById(id);
    return this.informeAprendizajeRepository.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    return this.informeAprendizajeRepository.remove(id);
  }
}
