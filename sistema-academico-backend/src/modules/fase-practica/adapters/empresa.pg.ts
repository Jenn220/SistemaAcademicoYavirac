import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpresaEntity } from '../domain/empresa.entity';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { UpdateEmpresaDto } from '../dto/update-empresa.dto';
import { EMPRESA_REPOSITORY, IEmpresaRepository } from '../ports/empresa.repository.port';

@Injectable()
export class EmpresaPg implements IEmpresaRepository {
  constructor(
    @InjectRepository(EmpresaEntity)
    private readonly empresaRepository: Repository<EmpresaEntity>,
  ) {}

  async createEmpresa(dto: CreateEmpresaDto): Promise<EmpresaEntity> {
    const empresa = this.empresaRepository.create(dto);
    return this.empresaRepository.save(empresa);
  }

  async findAllEmpresas(skip?: number, take?: number): Promise<EmpresaEntity[]> {
    return this.empresaRepository.find({ skip, take });
  }

  async findEmpresaById(id: number): Promise<EmpresaEntity | null> {
    return this.empresaRepository.findOne({ where: { id_empresa: id } });
  }

  async updateEmpresa(id: number, dto: UpdateEmpresaDto): Promise<EmpresaEntity> {
    const empresa = await this.findEmpresaById(id);
    if (!empresa) throw new NotFoundException(`Empresa con id ${id} no encontrada`);
    Object.assign(empresa, dto);
    return this.empresaRepository.save(empresa);
  }

  async removeEmpresa(id: number): Promise<void> {
    const empresa = await this.findEmpresaById(id);
    if (!empresa) throw new NotFoundException(`Empresa con id ${id} no encontrada`);
    await this.empresaRepository.remove(empresa);
  }
}
