import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { BITACORA_SEMANAL_REPOSITORY, IBitacoraSemanalRepository } from '../ports/bitacora-semanal.repository.port';
import { CreateBitacoraSemanalDto } from '../dto/create-bitacora-semanal.dto';
import { UpdateBitacoraSemanalDto } from '../dto/update-bitacora-semanal.dto';
import { BitacoraSemanalEntity } from '../domain/bitacora-semanal.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class BitacoraSemanalService {
  constructor(
    @Inject(BITACORA_SEMANAL_REPOSITORY)
    private readonly bitacoraSemanalRepository: IBitacoraSemanalRepository,
    private readonly dataSource: DataSource,
  ) {}

  private async verificarAccesoInforme(usuario: any, idInforme: number): Promise<void> {
    const informe = await this.dataSource.query(
      `SELECT i.id_informe, i.id_practica FROM informe_aprendizaje i WHERE i.id_informe = $1 LIMIT 1`,
      [idInforme],
    );
    if (informe.length === 0) {
      throw new NotFoundException(`No se encontró el informe con id ${idInforme}`);
    }

    const idPractica = informe[0].id_practica;
    const roles: string[] = usuario?.roles ?? [];
    if (roles.includes('COORDINADOR')) return;

    if (roles.includes('DOCENTE') || roles.includes('TUTOR_EMPRESARIAL')) {
      const practica = await this.dataSource.query(
        `SELECT id_docente, id_empresa FROM practica_estudiante WHERE id_practica = $1 LIMIT 1`,
        [idPractica],
      );
      if (practica.length === 0) {
        throw new NotFoundException('No tiene permiso para acceder a esta bitácora');
      }
      if (roles.includes('DOCENTE') && Number(practica[0].id_docente) === Number(usuario.idDocente)) return;
      if (roles.includes('TUTOR_EMPRESARIAL') && Number(practica[0].id_empresa) === Number(usuario.idEmpresa)) return;
      throw new ForbiddenException('No tiene permiso para acceder a esta bitácora');
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
        throw new ForbiddenException('No tiene permiso para acceder a esta bitácora');
      }
    }
  }

  async create(usuario: any, dto: CreateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
    await this.verificarAccesoInforme(usuario, dto.id_informe);
    return this.bitacoraSemanalRepository.create(dto);
  }

  async findByInforme(usuario: any, idInforme: number, skip?: number, take?: number): Promise<BitacoraSemanalEntity[]> {
    await this.verificarAccesoInforme(usuario, idInforme);
    return this.bitacoraSemanalRepository.findByInforme(idInforme, skip, take);
  }

  async findById(usuario: any, id: number): Promise<BitacoraSemanalEntity> {
    const bitacora = await this.bitacoraSemanalRepository.findById(id);
    if (!bitacora) throw new NotFoundException(`No se encontró la bitácora con id ${id}`);
    await this.verificarAccesoInforme(usuario, bitacora.id_informe);
    return bitacora;
  }

  async update(usuario: any, id: number, dto: UpdateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
    const bitacora = await this.bitacoraSemanalRepository.findById(id);
    if (!bitacora) throw new NotFoundException(`No se encontró la bitácora con id ${id}`);
    await this.verificarAccesoInforme(usuario, bitacora.id_informe);
    return this.bitacoraSemanalRepository.update(id, dto);
  }

  async remove(usuario: any, id: number): Promise<void> {
    const bitacora = await this.bitacoraSemanalRepository.findById(id);
    if (!bitacora) throw new NotFoundException(`No se encontró la bitácora con id ${id}`);
    await this.verificarAccesoInforme(usuario, bitacora.id_informe);
    return this.bitacoraSemanalRepository.remove(id);
  }
}
