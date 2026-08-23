import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PLAN_ROTACION_SEMANA_REPOSITORY, IPlanRotacionSemanaRepository } from '../ports/plan-rotacion-semana.repository.port';
import { CreatePlanRotacionSemanaDto } from '../dto/create-plan-rotacion-semana.dto';
import { UpdatePlanRotacionSemanaDto } from '../dto/update-plan-rotacion-semana.dto';
import { PlanRotacionSemanaEntity } from '../domain/plan-rotacion-semana.entity';

@Injectable()
export class PlanRotacionSemanaService {
  constructor(
    @Inject(PLAN_ROTACION_SEMANA_REPOSITORY) private readonly repo: IPlanRotacionSemanaRepository,
    private readonly dataSource: DataSource,
  ) {}

  private async esDuenoDePractica(usuario: any, idPractica: number): Promise<void> {
    if (!Array.isArray(usuario?.roles) || !usuario.roles.includes('ESTUDIANTE')) {
      return;
    }
    const esDueno = await this.dataSource.query(
      `SELECT 1 FROM matricula_detalle md
       JOIN matricula m ON m.id_matricula = md.id_matricula
       JOIN practica_estudiante pe ON pe.id_matricula_detalle = md.id_matricula_detalle
       WHERE pe.id_practica = $1 AND m.id_estudiante = $2`,
      [idPractica, usuario.idEstudiante],
    );
    if (!esDueno || esDueno.length === 0) {
      throw new NotFoundException('No tienes permiso para modificar este plan de rotación');
    }
  }

  private async obtenerIdPracticaDesdePlanRotacion(idPlanRotacion: number): Promise<number> {
    const rows = await this.dataSource.query(
      `SELECT id_practica FROM plan_rotacion WHERE id_plan_rotacion = $1`,
      [idPlanRotacion],
    );
    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Plan de rotación con id ${idPlanRotacion} no encontrado`);
    }
    return rows[0].id_practica;
  }

  async create(usuario: any, dto: CreatePlanRotacionSemanaDto): Promise<PlanRotacionSemanaEntity> {
    const idPractica = await this.obtenerIdPracticaDesdePlanRotacion(dto.id_plan_rotacion!);
    await this.esDuenoDePractica(usuario, idPractica);
    const existentes = await this.repo.findByPlanRotacion(dto.id_plan_rotacion!);
    if (existentes.length >= 8) {
      throw new BadRequestException('El plan de rotación no puede tener más de 8 semanas.');
    }
    const data: any = dto;
    if (dto.es_defensa_proyecto) {
      data.id_item_pm = null;
    }
    return this.repo.create(data);
  }

  async findByPlanRotacion(idPlanRotacion: number): Promise<PlanRotacionSemanaEntity[]> {
    return this.repo.findByPlanRotacion(idPlanRotacion);
  }

  async findOne(id: number): Promise<PlanRotacionSemanaEntity> {
    const entity = await this.repo.findOne(id);
    if (!entity) throw new NotFoundException(`Semana de plan de rotación con id ${id} no encontrada`);
    return entity;
  }

  async update(usuario: any, id: number, dto: UpdatePlanRotacionSemanaDto): Promise<PlanRotacionSemanaEntity> {
    const entity = await this.repo.findOne(id);
    if (!entity) throw new NotFoundException(`Semana de plan de rotación con id ${id} no encontrada`);
    const idPractica = await this.obtenerIdPracticaDesdePlanRotacion(entity.id_plan_rotacion);
    await this.esDuenoDePractica(usuario, idPractica);
    return this.repo.update(id, dto);
  }

  async remove(usuario: any, id: number): Promise<void> {
    const entity = await this.repo.findOne(id);
    if (!entity) throw new NotFoundException(`Semana de plan de rotación con id ${id} no encontrada`);
    const idPractica = await this.obtenerIdPracticaDesdePlanRotacion(entity.id_plan_rotacion);
    await this.esDuenoDePractica(usuario, idPractica);
    return this.repo.remove(id);
  }

  async guardarMatrizSemanas(usuario: any, idPlanRotacion: number, semanas: { id_item_pm?: number; semana: number; es_defensa_proyecto?: boolean }[]): Promise<PlanRotacionSemanaEntity[]> {
    const idPractica = await this.obtenerIdPracticaDesdePlanRotacion(idPlanRotacion);
    await this.esDuenoDePractica(usuario, idPractica);
    await this.repo.deleteByPlanRotacion(idPlanRotacion);
    const resultados: PlanRotacionSemanaEntity[] = [];
    for (const s of semanas) {
      const data: any = {
        id_plan_rotacion: idPlanRotacion,
        semana: s.semana,
        id_item_pm: s.es_defensa_proyecto ? null : s.id_item_pm,
        es_defensa_proyecto: s.es_defensa_proyecto || false,
      };
      const creada = await this.repo.create(data);
      resultados.push(creada);
    }
    return resultados;
  }
}
