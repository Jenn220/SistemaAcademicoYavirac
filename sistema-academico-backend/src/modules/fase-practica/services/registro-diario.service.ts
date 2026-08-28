import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { REGISTRO_DIARIO_REPOSITORY, IRegistroDiarioRepository } from '../ports/registro-diario.repository.port';
import { CreateRegistroDiarioDto } from '../dto/create-registro-diario.dto';
import { UpdateRegistroDiarioDto } from '../dto/update-registro-diario.dto';
import { RegistroDiarioEntity } from '../domain/registro-diario.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class RegistroDiarioService {
  constructor(
    @Inject(REGISTRO_DIARIO_REPOSITORY)
    private readonly registroDiarioRepository: IRegistroDiarioRepository,
    private readonly dataSource: DataSource,
  ) {}

  private async verificarAccesoPractica(usuario: any, idPractica: number): Promise<void> {
    const roles: string[] = usuario?.roles ?? [];
    if (roles.includes('COORDINADOR')) return;

    if (roles.includes('DOCENTE') || roles.includes('TUTOR_EMPRESARIAL')) {
      const practica = await this.dataSource.query(
        `SELECT id_docente, id_empresa FROM practica_estudiante WHERE id_practica = $1 LIMIT 1`,
        [idPractica],
      );
      if (practica.length === 0) {
        throw new NotFoundException('No tiene permiso para acceder a este registro diario');
      }
      if (roles.includes('DOCENTE') && Number(practica[0].id_docente) === Number(usuario.idDocente)) return;
      if (roles.includes('TUTOR_EMPRESARIAL') && Number(practica[0].id_empresa) === Number(usuario.idEmpresa)) return;
      throw new ForbiddenException('No tiene permiso para acceder a este registro diario');
    }

    if (roles.includes('ESTUDIANTE')) {
      const esDueno = await this.dataSource.query(
        `SELECT 1 FROM matricula_detalle md
         JOIN matricula m ON m.id_matricula = md.id_matricula
         JOIN practica_estudiante pe ON pe.id_matricula_detalle = md.id_matricula_detalle
         WHERE pe.id_practica = $1 AND m.id_estudiante = $2`,
        [idPractica, usuario.idEstudiante],
      );
      if (!esDueno || esDueno.length === 0) {
        throw new ForbiddenException('No tiene permiso para acceder a este registro diario');
      }
    }
  }

  async create(usuario: any, dto: CreateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    await this.verificarAccesoPractica(usuario, dto.id_practica);
    return this.registroDiarioRepository.createWithRecalculoHoras(dto);
  }

  async findByPractica(usuario: any, idPractica: number, skip?: number, take?: number): Promise<RegistroDiarioEntity[]> {
    await this.verificarAccesoPractica(usuario, idPractica);
    return this.registroDiarioRepository.findByPractica(idPractica, skip, take);
  }

  async findById(usuario: any, id: number): Promise<RegistroDiarioEntity> {
    const registro = await this.registroDiarioRepository.findById(id);
    if (!registro) throw new NotFoundException(`No se encontró el registro diario con id ${id}`);
    await this.verificarAccesoPractica(usuario, registro.id_practica);
    return registro;
  }

  async update(usuario: any, id: number, dto: UpdateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    const registro = await this.registroDiarioRepository.findById(id);
    if (!registro) throw new NotFoundException(`No se encontró el registro diario con id ${id}`);
    await this.verificarAccesoPractica(usuario, registro.id_practica);
    return this.registroDiarioRepository.updateWithRecalculoHoras(id, dto);
  }

  async remove(usuario: any, id: number): Promise<void> {
    const registro = await this.registroDiarioRepository.findById(id);
    if (!registro) throw new NotFoundException(`No se encontró el registro diario con id ${id}`);
    await this.verificarAccesoPractica(usuario, registro.id_practica);
    return this.registroDiarioRepository.removeWithRecalculoHoras(id);
  }
}
