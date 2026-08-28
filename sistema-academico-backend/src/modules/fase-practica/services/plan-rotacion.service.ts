import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PLAN_ROTACION_REPOSITORY, IPlanRotacionRepository } from '../ports/plan-rotacion.repository.port';
import { CreatePlanRotacionDto } from '../dto/create-plan-rotacion.dto';
import { UpdatePlanRotacionDto } from '../dto/update-plan-rotacion.dto';
import { PlanRotacionEntity } from '../domain/plan-rotacion.entity';
import { ITEM_PLAN_MARCO_REPOSITORY, IItemPlanMarcoRepository } from '../ports/item-plan-marco.repository.port';
import { DataSource } from 'typeorm';

@Injectable()
export class PlanRotacionService {
  constructor(
    @Inject(PLAN_ROTACION_REPOSITORY)
    private readonly planRotacionRepository: IPlanRotacionRepository,
    @Inject(ITEM_PLAN_MARCO_REPOSITORY)
    private readonly itemPlanMarcoRepository: IItemPlanMarcoRepository,
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
        throw new NotFoundException('No tiene permiso para acceder a este plan de rotación');
      }
      if (roles.includes('DOCENTE') && Number(practica[0].id_docente) === Number(usuario.idDocente)) return;
      if (roles.includes('TUTOR_EMPRESARIAL') && Number(practica[0].id_empresa) === Number(usuario.idEmpresa)) return;
      throw new ForbiddenException('No tiene permiso para acceder a este plan de rotación');
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
        throw new ForbiddenException('No tiene permiso para acceder a este plan de rotación');
      }
    }
  }

  async create(usuario: any, dto: CreatePlanRotacionDto): Promise<PlanRotacionEntity> {
    await this.verificarAccesoPractica(usuario, dto.id_practica);
    const itemPlanMarco = await this.itemPlanMarcoRepository.findById(dto.id_item_pm);
    if (!itemPlanMarco) {
      throw new NotFoundException(`Item plan marco con id ${dto.id_item_pm} no encontrado`);
    }

    const data = {
      id_practica: dto.id_practica,
      id_item_pm: dto.id_item_pm,
      puesto_aprendizaje: dto.puesto_aprendizaje != null ? dto.puesto_aprendizaje : itemPlanMarco.puesto_aprendizaje,
    };

    return this.planRotacionRepository.create(data);
  }

  async findByPractica(usuario: any, idPractica: number, skip?: number, take?: number): Promise<PlanRotacionEntity[]> {
    await this.verificarAccesoPractica(usuario, idPractica);
    return this.planRotacionRepository.findByPractica(idPractica, skip, take);
  }

  async findById(usuario: any, id: number): Promise<PlanRotacionEntity> {
    const plan = await this.planRotacionRepository.findById(id);
    if (!plan) throw new NotFoundException(`No se encontró el plan de rotación con id ${id}`);
    await this.verificarAccesoPractica(usuario, plan.id_practica);
    return plan;
  }

  async update(usuario: any, id: number, dto: UpdatePlanRotacionDto): Promise<PlanRotacionEntity> {
    const plan = await this.planRotacionRepository.findById(id);
    if (!plan) throw new NotFoundException(`No se encontró el plan de rotación con id ${id}`);
    await this.verificarAccesoPractica(usuario, plan.id_practica);
    return this.planRotacionRepository.update(id, dto);
  }

  async remove(usuario: any, id: number): Promise<void> {
    const plan = await this.planRotacionRepository.findById(id);
    if (!plan) throw new NotFoundException(`No se encontró el plan de rotación con id ${id}`);
    await this.verificarAccesoPractica(usuario, plan.id_practica);
    return this.planRotacionRepository.remove(id);
  }
}
