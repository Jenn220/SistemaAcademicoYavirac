import { CreateEmpresaDto } from '../dto/create-empresa.dto';
import { UpdateEmpresaDto } from '../dto/update-empresa.dto';
import { EmpresaEntity } from '../domain/empresa.entity';

export const EMPRESA_REPOSITORY = 'EmpresaRepository';

export interface IEmpresaRepository {
  createEmpresa(dto: CreateEmpresaDto): Promise<EmpresaEntity>;
  findAllEmpresas(skip?: number, take?: number): Promise<EmpresaEntity[]>;
  findEmpresaById(id: number): Promise<EmpresaEntity | null>;
  updateEmpresa(id: number, dto: UpdateEmpresaDto): Promise<EmpresaEntity>;
  removeEmpresa(id: number): Promise<void>;
}
