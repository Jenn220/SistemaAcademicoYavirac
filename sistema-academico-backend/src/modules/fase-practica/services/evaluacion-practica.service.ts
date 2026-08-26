import { ForbiddenException, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { EVALUACION_PRACTICA_REPOSITORY, IEvaluacionPracticaRepository } from '../ports/evaluacion-practica.repository.port';
import { CreateEvaluacionPracticaDto } from '../dto/create-evaluacion-practica.dto';
import { UpdateEvaluacionPracticaDto } from '../dto/update-evaluacion-practica.dto';
import { EvaluacionPracticaEntity } from '../domain/evaluacion-practica.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class EvaluacionPracticaService {
  constructor(
    @Inject(EVALUACION_PRACTICA_REPOSITORY)
    private readonly evaluacionPracticaRepository: IEvaluacionPracticaRepository,
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
        throw new NotFoundException('No tiene permiso para acceder a esta evaluación');
      }
      if (roles.includes('DOCENTE') && Number(practica[0].id_docente) === Number(usuario.idDocente)) return;
      if (roles.includes('TUTOR_EMPRESARIAL') && Number(practica[0].id_empresa) === Number(usuario.idEmpresa)) return;
      throw new ForbiddenException('No tiene permiso para acceder a esta evaluación');
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
        throw new ForbiddenException('No tiene permiso para acceder a esta evaluación');
      }
    }
  }

  async create(usuario: any, dto: CreateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity> {
    await this.verificarAccesoPractica(usuario, dto.id_practica);
    if (dto.nota_final_calculada !== undefined && (dto.nota_final_calculada < 0 || dto.nota_final_calculada > 10)) {
      throw new BadRequestException('La nota final calculada debe estar entre 0 y 10');
    }
    return this.evaluacionPracticaRepository.create(dto);
  }

  async findByPractica(usuario: any, idPractica: number, skip?: number, take?: number): Promise<EvaluacionPracticaEntity[]> {
    await this.verificarAccesoPractica(usuario, idPractica);
    return this.evaluacionPracticaRepository.findByPractica(idPractica, skip, take);
  }

  async findById(usuario: any, id: number): Promise<EvaluacionPracticaEntity> {
    const evaluacion = await this.evaluacionPracticaRepository.findById(id);
    if (!evaluacion) throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    await this.verificarAccesoPractica(usuario, evaluacion.id_practica);
    return evaluacion;
  }

  async update(usuario: any, id: number, dto: UpdateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity> {
    const evaluacion = await this.evaluacionPracticaRepository.findById(id);
    if (!evaluacion) throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    await this.verificarAccesoPractica(usuario, evaluacion.id_practica);
    if (dto.nota_final_calculada !== undefined && (dto.nota_final_calculada < 0 || dto.nota_final_calculada > 10)) {
      throw new BadRequestException('La nota final calculada debe estar entre 0 y 10');
    }
    return this.evaluacionPracticaRepository.update(id, dto);
  }

  async remove(usuario: any, id: number): Promise<void> {
    const evaluacion = await this.evaluacionPracticaRepository.findById(id);
    if (!evaluacion) throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    await this.verificarAccesoPractica(usuario, evaluacion.id_practica);
    return this.evaluacionPracticaRepository.remove(id);
  }
}
