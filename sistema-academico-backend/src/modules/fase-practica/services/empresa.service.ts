import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpresaEntity } from '../domain/empresa.entity';
import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { UpdateEmpresaDto } from '../dto/update-empresa.dto';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(EmpresaEntity)
    private readonly empresaRepository: Repository<EmpresaEntity>,
  ) {}

  async createEmpresa(dto: CreateEmpresaDto): Promise<EmpresaEntity> {
    const empresa = this.empresaRepository.create(dto);
    return this.empresaRepository.save(empresa);
  }

  async findAllEmpresas(): Promise<EmpresaEntity[]> {
    return this.empresaRepository.find();
  }

  async findEmpresaById(id: number): Promise<EmpresaEntity> {
    const empresa = await this.empresaRepository.findOneBy({ id_empresa: id });
    if (!empresa) {
      throw new NotFoundException(`Empresa con id ${id} no encontrada`);
    }
    return empresa;
  }

  async updateEmpresa(id: number, dto: UpdateEmpresaDto): Promise<EmpresaEntity> {
    const empresa = await this.findEmpresaById(id);
    Object.assign(empresa, dto);
    return this.empresaRepository.save(empresa);
  }

  async removeEmpresa(id: number): Promise<void> {
    const empresa = await this.findEmpresaById(id);
    await this.empresaRepository.remove(empresa);
  }
}
