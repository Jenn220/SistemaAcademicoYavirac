import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PLAN_MARCO_REPOSITORY, IPlanMarcoRepository } from '../ports/plan-marco.repository.port';
import { CreatePlanMarcoDto } from '../dto/create-plan-marco.dto';
import { UpdatePlanMarcoDto } from '../dto/update-plan-marco.dto';
import { ITEM_PLAN_MARCO_REPOSITORY, IItemPlanMarcoRepository } from '../ports/item-plan-marco.repository.port';
import { PLAN_ROTACION_REPOSITORY, IPlanRotacionRepository } from '../ports/plan-rotacion.repository.port';
import { PLAN_ROTACION_SEMANA_REPOSITORY, IPlanRotacionSemanaRepository } from '../ports/plan-rotacion-semana.repository.port';

@Injectable()
export class PlanMarcoService {
  constructor(
    @Inject(PLAN_MARCO_REPOSITORY)
    private readonly planMarcoRepo: IPlanMarcoRepository,
    @Inject(ITEM_PLAN_MARCO_REPOSITORY)
    private readonly itemPlanMarcoRepo: IItemPlanMarcoRepository,
    @Inject(PLAN_ROTACION_REPOSITORY)
    private readonly planRotacionRepo: IPlanRotacionRepository,
    @Inject(PLAN_ROTACION_SEMANA_REPOSITORY)
    private readonly planRotacionSemanaRepo: IPlanRotacionSemanaRepository,
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

  async sincronizarPlanRotacion(idPlanMarco: number): Promise<void> {
    const planMarco = await this.planMarcoRepo.findById(idPlanMarco);
    if (!planMarco) {
      throw new NotFoundException(`Plan marco con id ${idPlanMarco} no encontrado`);
    }

    const items = await this.itemPlanMarcoRepo.findByPlanMarco(idPlanMarco);
    const planesRotacion = await this.planRotacionRepo.findByPractica(planMarco.id_practica);

    let planRotacion = planesRotacion[0] || null;
    if (!planRotacion) {
      planRotacion = await this.planRotacionRepo.create({
        id_practica: planMarco.id_practica,
        id_item_pm: items[0]?.id_item_pm || 0,
        puesto_aprendizaje: items[0]?.puesto_aprendizaje || '',
      });
    }

    const existentes = await this.planRotacionSemanaRepo.findByPlanRotacion(planRotacion.id_plan_rotacion);
    if (existentes.length > 0) {
      await this.planRotacionSemanaRepo.deleteByPlanRotacion(planRotacion.id_plan_rotacion);
    }

    for (const item of items) {
      const planRotacionItem = await this.planRotacionRepo.create({
        id_practica: planMarco.id_practica,
        id_item_pm: item.id_item_pm,
        puesto_aprendizaje: item.puesto_aprendizaje || '',
      });

      for (let semana = 1; semana <= 8; semana++) {
        await this.planRotacionSemanaRepo.create({
          id_plan_rotacion: planRotacionItem.id_plan_rotacion,
          semana,
          id_item_pm: item.id_item_pm,
          es_defensa_proyecto: false,
        });
      }
    }
  }
}
