import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ITEM_PLAN_MARCO_REPOSITORY, IItemPlanMarcoRepository } from '../ports/item-plan-marco.repository.port';
import { CreateItemPlanMarcoDto } from '../dto/create-item-plan-marco.dto';
import { UpdateItemPlanMarcoDto } from '../dto/update-item-plan-marco.dto';
import { PlanMarcoFormacionEntity } from '../domain/plan-marco-formacion.entity';
import { PracticaEntity } from '../domain/practica.entity';
import { PeriodoContextService } from './periodo-context.service';

@Injectable()
export class ItemPlanMarcoService {
  constructor(
    @Inject(ITEM_PLAN_MARCO_REPOSITORY)
    private readonly itemPlanMarcoRepo: IItemPlanMarcoRepository,
    @InjectRepository(PlanMarcoFormacionEntity)
    private readonly planMarcoRepository: Repository<PlanMarcoFormacionEntity>,
    @InjectRepository(PracticaEntity)
    private readonly practicaRepository: Repository<PracticaEntity>,
    private readonly dataSource: DataSource,
    private readonly periodoContextService: PeriodoContextService,
  ) {}

  /**
   * Mismo hallazgo QA que PlanMarcoService (PMF-07), pero un nivel más
   * abajo: sin este chequeo, un docente/tutor sin vinculación podía
   * saltarse la restricción del plan_marco adivinando directamente el
   * id_plan_marco en /plan-marco/:idPlanMarco/items.
   */
  private async verificarVinculo(usuario: any, idPlanMarco: number): Promise<void> {
    const roles: string[] = usuario?.roles ?? [];
    if (roles.includes('COORDINADOR')) return;

    const esDocente = roles.includes('DOCENTE');
    const esTutor = roles.includes('TUTOR_EMPRESARIAL');
    if (!esDocente && !esTutor) return;

    const plan = await this.planMarcoRepository.findOne({ where: { id_plan_marco: idPlanMarco } });
    if (!plan) throw new NotFoundException(`Plan marco con id ${idPlanMarco} no encontrado`);

    const practica = await this.practicaRepository.findOne({ where: { id_practica: plan.id_practica } });
    if (!practica) throw new NotFoundException(`Práctica con id ${plan.id_practica} no encontrada`);

    if (esDocente && practica.id_docente === usuario.idDocente) return;
    if (esTutor && practica.id_empresa === usuario.idEmpresa) return;

    throw new ForbiddenException('No tiene permisos para acceder a los resultados de aprendizaje de este Plan Marco.');
  }

  /**
   * Un ESTUDIANTE solo puede crear/editar ítems de su propio Plan Marco;
   * sin esto podría pasar un id_plan_marco ajeno directamente al endpoint.
   */
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
      await this.periodoContextService.validarPeriodoActivoDesdePractica(idPractica);
      return this.itemPlanMarcoRepo.create(dto);
    } catch (error: any) {
      console.error('Error creando item plan marco:', JSON.stringify({ dto, error: error?.message || error }));
      throw error;
    }
  }

  async findByPlanMarco(usuario: any, idPlanMarco: number, skip?: number, take?: number) {
    await this.verificarVinculo(usuario, idPlanMarco);
    return this.itemPlanMarcoRepo.findByPlanMarco(idPlanMarco, skip, take);
  }

  async findById(usuario: any, id: number) {
    const item = await this.itemPlanMarcoRepo.findById(id);
    if (!item) throw new NotFoundException(`Item plan marco con id ${id} no encontrado`);
    await this.verificarVinculo(usuario, item.id_plan_marco);
    return item;
  }

  async update(usuario: any, id: number, dto: UpdateItemPlanMarcoDto) {
    const item = await this.itemPlanMarcoRepo.findById(id);
    if (!item) throw new NotFoundException(`Item plan marco con id ${id} no encontrado`);
    const idPractica = await this.obtenerIdPracticaDesdePlanMarco(item.id_plan_marco);
    await this.esDuenoDePractica(usuario, idPractica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(idPractica);
    return this.itemPlanMarcoRepo.update(id, dto);
  }

  async remove(usuario: any, id: number) {
    const item = await this.itemPlanMarcoRepo.findById(id);
    if (!item) throw new NotFoundException(`Item plan marco con id ${id} no encontrado`);
    const idPractica = await this.obtenerIdPracticaDesdePlanMarco(item.id_plan_marco);
    await this.esDuenoDePractica(usuario, idPractica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(idPractica);
    await this.itemPlanMarcoRepo.remove(id);
    return { deleted: true, id_item_pm: id };
  }
}
