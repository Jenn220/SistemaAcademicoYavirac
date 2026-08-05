import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ITEM_PLAN_MARCO_REPOSITORY, IItemPlanMarcoRepository } from '../ports/item-plan-marco.repository.port';
import { CreateItemPlanMarcoDto } from '../dto/create-item-plan-marco.dto';
import { UpdateItemPlanMarcoDto } from '../dto/update-item-plan-marco.dto';

@Injectable()
export class ItemPlanMarcoService {
  constructor(
    @Inject(ITEM_PLAN_MARCO_REPOSITORY)
    private readonly itemPlanMarcoRepo: IItemPlanMarcoRepository,
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
      throw new NotFoundException('No tienes permiso para modificar este ítem de plan marco');
    }
  }

  private async obtenerIdPracticaDesdePlanMarco(idPlanMarco: number): Promise<number> {
    const rows = await this.dataSource.query(
      `SELECT id_practica FROM plan_marco_formacion WHERE id_plan_marco = $1`,
      [idPlanMarco],
    );
    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Plan marco con id ${idPlanMarco} no encontrado`);
    }
    return rows[0].id_practica;
  }

  async create(usuario: any, dto: CreateItemPlanMarcoDto) {
    try {
      if (!dto.id_plan_marco) {
        throw new BadRequestException('id_plan_marco es requerido para crear el ítem del plan marco');
      }
      const idPractica = await this.obtenerIdPracticaDesdePlanMarco(dto.id_plan_marco);
      await this.esDuenoDePractica(usuario, idPractica);
      return this.itemPlanMarcoRepo.create(dto);
    } catch (error: any) {
      console.error('Error creando item plan marco:', JSON.stringify({ dto, error: error?.message || error }));
      throw error;
    }
  }

  async findByPlanMarco(idPlanMarco: number, skip?: number, take?: number) {
    return this.itemPlanMarcoRepo.findByPlanMarco(idPlanMarco, skip, take);
  }

  async findById(id: number) {
    const item = await this.itemPlanMarcoRepo.findById(id);
    if (!item) throw new NotFoundException(`Item plan marco con id ${id} no encontrado`);
    return item;
  }

  async update(usuario: any, id: number, dto: UpdateItemPlanMarcoDto) {
    const item = await this.itemPlanMarcoRepo.findById(id);
    if (!item) throw new NotFoundException(`Item plan marco con id ${id} no encontrado`);
    const idPractica = await this.obtenerIdPracticaDesdePlanMarco(item.id_plan_marco);
    await this.esDuenoDePractica(usuario, idPractica);
    return this.itemPlanMarcoRepo.update(id, dto);
  }

  async remove(usuario: any, id: number) {
    const item = await this.itemPlanMarcoRepo.findById(id);
    if (!item) throw new NotFoundException(`Item plan marco con id ${id} no encontrado`);
    const idPractica = await this.obtenerIdPracticaDesdePlanMarco(item.id_plan_marco);
    await this.esDuenoDePractica(usuario, idPractica);
    await this.itemPlanMarcoRepo.remove(id);
    return { deleted: true, id_item_pm: id };
  }
}
