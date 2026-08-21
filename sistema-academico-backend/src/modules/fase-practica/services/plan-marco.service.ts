import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PLAN_MARCO_REPOSITORY, IPlanMarcoRepository } from '../ports/plan-marco.repository.port';
import { CreatePlanMarcoDto } from '../dto/create-plan-marco.dto';
import { UpdatePlanMarcoDto } from '../dto/update-plan-marco.dto';
import { PracticaEntity } from '../domain/practica.entity';
import { ITEM_PLAN_MARCO_REPOSITORY, IItemPlanMarcoRepository } from '../ports/item-plan-marco.repository.port';
import { PLAN_ROTACION_REPOSITORY, IPlanRotacionRepository } from '../ports/plan-rotacion.repository.port';
import { PLAN_ROTACION_SEMANA_REPOSITORY, IPlanRotacionSemanaRepository } from '../ports/plan-rotacion-semana.repository.port';
import { PeriodoContextService } from './periodo-context.service';

@Injectable()
export class PlanMarcoService {
  constructor(
    @Inject(PLAN_MARCO_REPOSITORY)
    private readonly planMarcoRepo: IPlanMarcoRepository,
    @InjectRepository(PracticaEntity)
    private readonly practicaRepository: Repository<PracticaEntity>,
    @Inject(ITEM_PLAN_MARCO_REPOSITORY)
    private readonly itemPlanMarcoRepo: IItemPlanMarcoRepository,
    @Inject(PLAN_ROTACION_REPOSITORY)
    private readonly planRotacionRepo: IPlanRotacionRepository,
    @Inject(PLAN_ROTACION_SEMANA_REPOSITORY)
    private readonly planRotacionSemanaRepo: IPlanRotacionSemanaRepository,
    private readonly dataSource: DataSource,
    private readonly periodoContextService: PeriodoContextService,
  ) {}

  /**
   * DOCENTE y TUTOR_EMPRESARIAL solo deben consultar el Plan Marco de sus
   * propios estudiantes/prácticas asignadas; COORDINADOR tiene alcance
   * total. Antes cualquier docente podía ver el Plan Marco de cualquier
   * práctica cambiando el id en la URL (bug detectado en QA: PMF-07).
   */
  private async verificarVinculo(usuario: any, idPractica: number): Promise<void> {
    const roles: string[] = usuario?.roles ?? [];
    if (roles.includes('COORDINADOR')) return;

    const esDocente = roles.includes('DOCENTE');
    const esTutor = roles.includes('TUTOR_EMPRESARIAL');
    if (!esDocente && !esTutor) return;

    const practica = await this.practicaRepository.findOne({ where: { id_practica: idPractica } });
    if (!practica) throw new NotFoundException(`Práctica con id ${idPractica} no encontrada`);

    if (esDocente && practica.id_docente === usuario.idDocente) return;
    if (esTutor && practica.id_empresa === usuario.idEmpresa) return;

    throw new ForbiddenException('No tiene permisos para acceder al Plan Marco de esta práctica.');
  }

  /**
   * Un ESTUDIANTE solo puede crear/editar el Plan Marco de su propia
   * práctica; sin esto podría pasar un id_practica ajeno directamente al
   * endpoint (@Roles solo exige ser ESTUDIANTE, no dueño de la práctica).
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
      throw new NotFoundException('No tienes permiso para modificar este plan marco');
    }
  }

  /**
   * Una práctica solo debe tener un Plan Marco activo. Si ya existe uno
   * (p. ej. el estudiante guarda dos veces sin que el front haya cargado
   * el existente todavía), se devuelve el ya creado en vez de duplicarlo
   * (bug detectado en QA: PMF-01/PMF-12, se creaban registros duplicados).
   */
  async create(usuario: any, dto: CreatePlanMarcoDto) {
    await this.esDuenoDePractica(usuario, dto.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(dto.id_practica);

    const existentes = await this.planMarcoRepo.findByPractica(dto.id_practica);
    if (existentes.length > 0) return existentes[0];

    return this.planMarcoRepo.create(dto);
  }

  async findByPractica(usuario: any, idPractica: number, skip?: number, take?: number) {
    await this.verificarVinculo(usuario, idPractica);
    return this.planMarcoRepo.findByPractica(idPractica, skip, take);
  }

  async findById(usuario: any, id: number) {
    const plan = await this.planMarcoRepo.findById(id);
    if (!plan) throw new NotFoundException(`Plan marco con id ${id} no encontrado`);
    await this.verificarVinculo(usuario, plan.id_practica);
    return plan;
  }

  async update(usuario: any, id: number, dto: UpdatePlanMarcoDto) {
    const plan = await this.planMarcoRepo.findById(id);
    if (!plan) throw new NotFoundException(`Plan marco con id ${id} no encontrado`);
    await this.esDuenoDePractica(usuario, plan.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(plan.id_practica);
    return this.planMarcoRepo.update(id, dto);
  }

  async remove(usuario: any, id: number) {
    const plan = await this.planMarcoRepo.findById(id);
    if (!plan) throw new NotFoundException(`Plan marco con id ${id} no encontrado`);
    await this.esDuenoDePractica(usuario, plan.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(plan.id_practica);
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
