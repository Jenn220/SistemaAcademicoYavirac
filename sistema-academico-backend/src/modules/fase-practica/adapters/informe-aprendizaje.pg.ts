import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformeAprendizajeEntity } from '../domain/informe-aprendizaje.entity';
import { CreateInformeAprendizajeDto } from '../dto/create-informe-aprendizaje.dto';
import { UpdateInformeAprendizajeDto } from '../dto/update-informe-aprendizaje.dto';
import { INFORME_APRENDIZAJE_REPOSITORY, IInformeAprendizajeRepository } from '../ports/informe-aprendizaje.repository.port';

@Injectable()
export class InformeAprendizajePg implements IInformeAprendizajeRepository {
  constructor(
    @InjectRepository(InformeAprendizajeEntity)
    private readonly informeAprendizajeRepository: Repository<InformeAprendizajeEntity>,
  ) {}

  async create(dto: CreateInformeAprendizajeDto): Promise<InformeAprendizajeEntity> {
    const informe = this.informeAprendizajeRepository.create(dto);
    return this.informeAprendizajeRepository.save(informe);
  }

  async findByPractica(idPractica: number, skip?: number, take?: number): Promise<InformeAprendizajeEntity[]> {
    return this.informeAprendizajeRepository.find({ where: { id_practica: idPractica }, skip, take });
  }

  async findById(id: number): Promise<InformeAprendizajeEntity | null> {
    return this.informeAprendizajeRepository.findOne({ where: { id_informe: id } });
  }

  async update(id: number, dto: UpdateInformeAprendizajeDto): Promise<InformeAprendizajeEntity> {
    const informe = await this.findById(id);
    if (!informe) throw new NotFoundException(`No se encontró el informe con id ${id}`);
    Object.assign(informe, dto);
    return this.informeAprendizajeRepository.save(informe);
  }

  async remove(id: number): Promise<void> {
    const informe = await this.findById(id);
    if (!informe) throw new NotFoundException(`No se encontró el informe con id ${id}`);
    await this.informeAprendizajeRepository.remove(informe);
  }
}
