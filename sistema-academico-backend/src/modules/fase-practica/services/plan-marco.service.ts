import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PLAN_MARCO_REPOSITORY, IPlanMarcoRepository } from '../ports/plan-marco.repository.port';
import { CreatePlanMarcoDto } from '../dto/create-plan-marco.dto';
import { UpdatePlanMarcoDto } from '../dto/update-plan-marco.dto';

@Injectable()
export class PlanMarcoService {
  constructor(
    @Inject(PLAN_MARCO_REPOSITORY)
    private readonly planMarcoRepo: IPlanMarcoRepository,
    private readonly dataSource: DataSource,
  ) {}

  private async esDuenoDePractica(usuario: any, idPractica: number): Promise<void> {
    if (usuario.rol !== 'ESTUDIANTE') {
      return;
    }
    const esDueno = await this.dataSource.query(
      `SELECT 1 FROM matricula_detalle md
       JOIN matricula m ON m.id_matricula = md.id_matricula
       JOIN practica_estudiante pe ON pe.id_matricula_detalle = md.id_matricula_detalle
       WHERE pe.id_practica = $1 AND m.id_estudiante = $2`,
      [idPractica, usuario.id_usuario],
    );
    if (!esDueno || esDueno.length === 0) {
      throw new NotFoundException('No tienes permiso para modificar este plan marco');
    }
  }

  async create(usuario: any, dto: CreatePlanMarcoDto) {
    await this.esDuenoDePractica(usuario, dto.id_practica);
    return this.planMarcoRepo.create(dto);
  }

  async findByPractica(idPractica: number, skip?: number, take?: number) {
    return this.planMarcoRepo.findByPractica(idPractica, skip, take);
  }

  async findById(id: number) {
    const plan = await this.planMarcoRepo.findById(id);
    if (!plan) throw new NotFoundException(`Plan marco con id ${id} no encontrado`);
    return plan;
  }

  async update(usuario: any, id: number, dto: UpdatePlanMarcoDto) {
    const plan = await this.planMarcoRepo.findById(id);
    if (!plan) throw new NotFoundException(`Plan marco con id ${id} no encontrado`);
    await this.esDuenoDePractica(usuario, plan.id_practica);
    return this.planMarcoRepo.update(id, dto);
  }

  async remove(usuario: any, id: number) {
    const plan = await this.planMarcoRepo.findById(id);
    if (!plan) throw new NotFoundException(`Plan marco con id ${id} no encontrado`);
    await this.esDuenoDePractica(usuario, plan.id_practica);
    await this.planMarcoRepo.remove(id);
    return { deleted: true, id_plan_marco: id };
  }
}
