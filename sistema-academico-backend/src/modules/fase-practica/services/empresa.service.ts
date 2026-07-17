import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { EMPRESA_REPOSITORY, IEmpresaRepository } from '../ports/empresa.repository.port';
import { EmpresaEntity } from '../domain/empresa.entity';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { UpdateEmpresaDto } from '../dto/update-empresa.dto';

@Injectable()
export class EmpresaService {
  constructor(
    @Inject(EMPRESA_REPOSITORY)
    private readonly empresaRepository: IEmpresaRepository,
  ) {}

  async createEmpresa(dto: CreateEmpresaDto): Promise<EmpresaEntity> {
    return this.empresaRepository.createEmpresa(dto);
  }

  async findAllEmpresas(skip?: number, take?: number): Promise<EmpresaEntity[]> {
    return this.empresaRepository.findAllEmpresas(skip, take);
  }

  async findEmpresaById(id: number): Promise<EmpresaEntity> {
    const empresa = await this.empresaRepository.findEmpresaById(id);
    if (!empresa) {
      throw new NotFoundException(`Empresa con id ${id} no encontrada`);
    }
    return empresa;
  }

  async updateEmpresa(id: number, dto: UpdateEmpresaDto): Promise<EmpresaEntity> {
    await this.findEmpresaById(id);
    return this.empresaRepository.updateEmpresa(id, dto);
  }

  async removeEmpresa(id: number): Promise<void> {
    await this.findEmpresaById(id);
    await this.empresaRepository.removeEmpresa(id);
  }
}
