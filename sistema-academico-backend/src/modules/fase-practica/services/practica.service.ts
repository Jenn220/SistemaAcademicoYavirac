import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PRACTICA_REPOSITORY, IPracticaRepository } from '../ports/practica.repository.port';
import { CreatePracticaDto } from '../dto/create-practica.dto';
import { UpdatePracticaDto } from '../dto/update-practica.dto';
import { PracticaEntity } from '../domain/practica.entity';
import { REGISTRO_DIARIO_REPOSITORY } from '../ports/registro-diario.repository.port';
import { IRegistroDiarioRepository } from '../ports/registro-diario.repository.port';
import { PLAN_ROTACION_REPOSITORY } from '../ports/plan-rotacion.repository.port';
import { IPlanRotacionRepository } from '../ports/plan-rotacion.repository.port';
import { INFORME_APRENDIZAJE_REPOSITORY } from '../ports/informe-aprendizaje.repository.port';
import { IInformeAprendizajeRepository } from '../ports/informe-aprendizaje.repository.port';
import { EVALUACION_PRACTICA_REPOSITORY } from '../ports/evaluacion-practica.repository.port';
import { IEvaluacionPracticaRepository } from '../ports/evaluacion-practica.repository.port';
import { BITACORA_SEMANAL_REPOSITORY } from '../ports/bitacora-semanal.repository.port';
import { IBitacoraSemanalRepository } from '../ports/bitacora-semanal.repository.port';
import { RUBRICA_REPOSITORY } from '../ports/rubrica.repository.port';
import { IRubricaRepository } from '../ports/rubrica.repository.port';
import { ITEM_PLAN_MARCO_REPOSITORY, IItemPlanMarcoRepository } from '../ports/item-plan-marco.repository.port';
import { CreateBitacoraSemanalDto } from '../dto/create-bitacora-semanal.dto';
import { CreateEvaluacionPracticaDto } from '../dto/create-evaluacion-practica.dto';
import { CreateInformeAprendizajeDto } from '../dto/create-informe-aprendizaje.dto';
import { CreatePlanRotacionDto } from '../dto/create-plan-rotacion.dto';
import { CreateRegistroDiarioDto } from '../dto/create-registro-diario.dto';
import { CreateRubricaDto } from '../dto/create-rubrica.dto';
import { UpdateBitacoraSemanalDto } from '../dto/update-bitacora-semanal.dto';
import { UpdateEvaluacionPracticaDto } from '../dto/update-evaluacion-practica.dto';
import { UpdateInformeAprendizajeDto } from '../dto/update-informe-aprendizaje.dto';
import { UpdatePlanRotacionDto } from '../dto/update-plan-rotacion.dto';
import { UpdatePlanRotacionCompetenciasDto } from '../dto/update-plan-rotacion-competencias.dto';
import { UpdateRegistroDiarioDto } from '../dto/update-registro-diario.dto';
import { UpdateRubricaDto } from '../dto/update-rubrica.dto';
import { BitacoraSemanalEntity } from '../domain/bitacora-semanal.entity';
import { EvaluacionPracticaEntity } from '../domain/evaluacion-practica.entity';
import { InformeAprendizajeEntity } from '../domain/informe-aprendizaje.entity';
import { PlanRotacionEntity } from '../domain/plan-rotacion.entity';
import { RegistroDiarioEntity } from '../domain/registro-diario.entity';
import { RubricaEntity } from '../domain/rubrica.entity';
import { PlanRotacionService } from './plan-rotacion.service';
import { PeriodoContextService } from './periodo-context.service';

@Injectable()
export class PracticaService {
  constructor(
    @Inject(PRACTICA_REPOSITORY)
    private readonly practicaRepository: IPracticaRepository,
    @Inject(REGISTRO_DIARIO_REPOSITORY)
    private readonly registroDiarioRepository: IRegistroDiarioRepository,
    @Inject(PLAN_ROTACION_REPOSITORY)
    private readonly planRotacionRepository: IPlanRotacionRepository,
    @Inject(INFORME_APRENDIZAJE_REPOSITORY)
    private readonly informeAprendizajeRepository: IInformeAprendizajeRepository,
    @Inject(EVALUACION_PRACTICA_REPOSITORY)
    private readonly evaluacionPracticaRepository: IEvaluacionPracticaRepository,
    @Inject(BITACORA_SEMANAL_REPOSITORY)
    private readonly bitacoraSemanalRepository: IBitacoraSemanalRepository,
    @Inject(RUBRICA_REPOSITORY)
    private readonly rubricaRepository: IRubricaRepository,
    @Inject(ITEM_PLAN_MARCO_REPOSITORY)
    private readonly itemPlanMarcoRepository: IItemPlanMarcoRepository,
    private readonly dataSource: DataSource,
    private readonly periodoContextService: PeriodoContextService,
  ) {}

  async createPractica(dto: CreatePracticaDto): Promise<PracticaEntity> {
    const contexto = await this.periodoContextService.validarPeriodoActivo(dto.id_matricula_detalle);

    const data: any = {
      ...dto,
      id_periodo: contexto.id_periodo,
      total_horas_requeridas: dto.total_horas_requeridas ?? 400,
      total_horas_cumplidas: dto.total_horas_cumplidas ?? 0,
      estado: dto.estado ?? 'EN_CURSO',
    };

    return this.practicaRepository.createPractica(data);
  }

  /**
   * El selector de práctica (fase-practica/plan-formacion) necesita saber
   * DE QUÉ ESTUDIANTE es cada práctica para que DOCENTE/COORDINADOR/
   * TUTOR_EMPRESARIAL puedan buscarlo por nombre o cédula — PracticaEntity
   * no tiene relación directa a estudiante (solo a matricula_detalle), así
   * que se resuelve aparte con un solo query batch.
   *
   * Además se filtra por rol: DOCENTE solo ve sus propios asignados
   * (id_docente), TUTOR_EMPRESARIAL solo los de su empresa (id_empresa),
   * ESTUDIANTE solo el suyo. COORDINADOR ve todos (es quien asigna).
   */
  async findAllPracticas(usuario: any, skip?: number, take?: number, idPeriodoCarrera?: number): Promise<any[]> {
    const where: any = {};
    if (idPeriodoCarrera) {
      const rows = await this.dataSource.query(
        `SELECT 1 FROM periodo_carrera pc
         JOIN oferta_asignatura oa ON oa.id_periodo_carrera = pc.id_periodo_carrera
         JOIN matricula_detalle md ON md.id_oferta_asignatura = oa.id_oferta_asignatura
         JOIN practica_estudiante p ON p.id_matricula_detalle = md.id_matricula_detalle
         WHERE pc.id_periodo_carrera = $1
         LIMIT 1`,
        [idPeriodoCarrera],
      );
      if (rows.length === 0) {
        return [];
      }
      where.id_periodo_carrera = idPeriodoCarrera;
    } else {
      where.estado_periodo_carrera = 'ACTIVO';
    }

    const practicas = await this.practicaRepository.findAllPracticasConContexto(skip, take, where);
    if (practicas.length === 0) return practicas;

    const idsMatriculaDetalle = practicas.map((p) => p.id_matricula_detalle);

    const filas = await this.dataSource.query(
      `SELECT md.id_matricula_detalle, e.id_estudiante, e.nombres, e.apellidos, e.cedula,
       j.nombre AS nombre_jornada,
       pa.nombre AS nombre_paralelo,
       per.nombre AS nombre_periodo
        FROM matricula_detalle md
        JOIN matricula m ON m.id_matricula = md.id_matricula
        JOIN estudiante e ON e.id_estudiante = m.id_estudiante
        LEFT JOIN oferta_asignatura oa ON oa.id_oferta_asignatura = md.id_oferta_asignatura
        LEFT JOIN jornada j ON j.id_jornada = oa.id_jornada
        LEFT JOIN paralelo pa ON pa.id_paralelo = oa.id_paralelo
        LEFT JOIN periodo_academico per ON per.id_periodo = m.id_periodo
        WHERE md.id_matricula_detalle = ANY($1)`,
      [idsMatriculaDetalle],
    );

    const porMatriculaDetalle = new Map<number, any>(filas.map((f: any) => [Number(f.id_matricula_detalle), f]));

    const enriquecidas = practicas.map((p) => {
      const fila = porMatriculaDetalle.get(Number(p.id_matricula_detalle));
      return {
        ...p,
        estudiante: fila
          ? { id_estudiante: Number(fila.id_estudiante), nombre: `${fila.nombres} ${fila.apellidos}`, cedula: fila.cedula }
          : null,
        semestre: fila?.nombre_periodo ?? p.nombre_periodo ?? '',
        paralelo: fila?.nombre_paralelo ?? p.paralelo ?? '',
        jornada: fila?.nombre_jornada ?? '',
      };
    });

    const roles: string[] = usuario?.roles ?? [];

    if (roles.includes('COORDINADOR')) {
      return enriquecidas;
    }

    return enriquecidas.filter((p) => {
      if (roles.includes('DOCENTE') && Number(p.id_docente) === Number(usuario.idDocente)) return true;
      if (roles.includes('TUTOR_EMPRESARIAL') && Number(p.id_empresa) === Number(usuario.idEmpresa)) return true;
      if (roles.includes('ESTUDIANTE') && Number(p.estudiante?.id_estudiante) === Number(usuario.idEstudiante)) return true;
      return false;
    });
  }

  async findPracticaById(id: number): Promise<PracticaEntity> {
    const practica = await this.practicaRepository.findPracticaById(id);
    if (!practica) {
      throw new NotFoundException(`No se encontró la práctica con id ${id}`);
    }
    return practica;
  }

  async updatePractica(id: number, dto: UpdatePracticaDto): Promise<PracticaEntity> {
    const practica = await this.findPracticaById(id);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(id);

    const data: any = { ...dto };
    if (Object.keys(data).length === 0) {
      return practica;
    }

    return this.practicaRepository.updatePractica(id, data);
  }

  /** Catálogo para el select de "docente académico" en la pantalla de Asignaciones. */
  async findAllDocentes(): Promise<any[]> {
    return this.dataSource.query(
      `SELECT id_docente, nombres, apellidos, cedula
       FROM docente
       WHERE estado = 'ACTIVO'
       ORDER BY nombres, apellidos`,
    );
  }

  /** Catálogo para el select de "tutor empresarial" en la pantalla de Asignaciones. */
  async findAllTutoresEmpresariales(): Promise<any[]> {
    return this.dataSource.query(
      `SELECT te.id_tutor_empresarial, te.nombres, te.apellidos, te.id_empresa, e.razon_social
       FROM tutor_empresarial te
       JOIN empresa e ON e.id_empresa = te.id_empresa
       WHERE te.estado = 'ACTIVO'
       ORDER BY te.nombres, te.apellidos`,
    );
  }

  async removePractica(id: number): Promise<void> {
    await this.findPracticaById(id);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(id);
    await this.practicaRepository.removePractica(id);
  }

  private async esDuenoDePractica(usuario: any, idPractica: number): Promise<void> {
    const practica = await this.practicaRepository.findPracticaById(idPractica);
    if (!practica) {
      throw new NotFoundException(`Práctica con id ${idPractica} no encontrada`);
    }
    if (!Array.isArray(usuario?.roles) || !usuario.roles.includes('ESTUDIANTE')) {
      return;
    }
    const esDueno = await this.dataSource.query(
      `SELECT 1 FROM matricula_detalle md
       JOIN matricula m ON m.id_matricula = md.id_matricula
       WHERE md.id_matricula_detalle = $1 AND m.id_estudiante = $2`,
      [practica.id_matricula_detalle, usuario.idEstudiante],
    );
    if (!esDueno || esDueno.length === 0) {
      throw new BadRequestException('No tienes permiso para modificar esta práctica');
    }
  }

  async createRegistroDiario(usuario: any, dto: CreateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    await this.esDuenoDePractica(usuario, dto.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(dto.id_practica);
    return this.registroDiarioRepository.create(dto);
  }

  async findRegistrosByPractica(idPractica: number, skip?: number, take?: number): Promise<RegistroDiarioEntity[]> {
    return this.registroDiarioRepository.findByPractica(idPractica, skip, take);
  }

  async updateRegistroDiario(usuario: any, id: number, dto: UpdateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    const registro = await this.registroDiarioRepository.findById(id);
    if (!registro) {
      throw new NotFoundException(`No se encontró el registro diario con id ${id}`);
    }
    await this.esDuenoDePractica(usuario, registro.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(registro.id_practica);
    return this.registroDiarioRepository.update(id, dto);
  }

  async removeRegistroDiario(usuario: any, id: number): Promise<void> {
    const registro = await this.registroDiarioRepository.findById(id);
    if (!registro) {
      throw new NotFoundException(`No se encontró el registro diario con id ${id}`);
    }
    await this.esDuenoDePractica(usuario, registro.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(registro.id_practica);
    return this.registroDiarioRepository.remove(id);
  }

  async createPlanRotacion(usuario: any, dto: CreatePlanRotacionDto): Promise<PlanRotacionEntity> {
    await this.esDuenoDePractica(usuario, dto.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(dto.id_practica);
    const itemPlanMarco = await this.itemPlanMarcoRepository.findById(dto.id_item_pm);
    if (!itemPlanMarco) {
      throw new NotFoundException(`Item plan marco con id ${dto.id_item_pm} no encontrado`);
    }

    const data = {
      ...dto,
      puesto_aprendizaje: dto.puesto_aprendizaje != null ? dto.puesto_aprendizaje : itemPlanMarco.puesto_aprendizaje,
    };

    return this.planRotacionRepository.create(data);
  }

  async findPlanRotacionByPractica(idPractica: number, skip?: number, take?: number): Promise<PlanRotacionEntity[]> {
    return this.planRotacionRepository.findByPractica(idPractica, skip, take);
  }

  async updatePlanRotacion(usuario: any, id: number, dto: UpdatePlanRotacionDto): Promise<PlanRotacionEntity> {
    const plan = await this.planRotacionRepository.findById(id);
    if (!plan) {
      throw new NotFoundException(`No se encontró el plan de rotación con id ${id}`);
    }
    await this.esDuenoDePractica(usuario, plan.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(plan.id_practica);
    return this.planRotacionRepository.update(id, dto);
  }

  async removePlanRotacion(usuario: any, id: number): Promise<void> {
    const plan = await this.planRotacionRepository.findById(id);
    if (!plan) {
      throw new NotFoundException(`No se encontró el plan de rotación con id ${id}`);
    }
    await this.esDuenoDePractica(usuario, plan.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(plan.id_practica);
    return this.planRotacionRepository.remove(id);
  }

  /**
   * "Competencias Necesarias" es un único bloque de texto por práctica
   * (no por fila/id_item_pm como el resto del Plan de Rotación), así que
   * vive en su propia tabla 1:1 con practica_estudiante en vez de en
   * plan_rotacion. Antes este campo solo existía en memoria del
   * navegador (viajaba al Word exportado pero nunca se guardaba).
   */
  async findCompetenciasRotacion(idPractica: number): Promise<{
    conocimientos_teoricos: string;
    procedimentales: string;
    actitudinales: string;
  }> {
    const rows = await this.dataSource.query(
      `SELECT conocimientos_teoricos, procedimentales, actitudinales
       FROM plan_rotacion_competencias
       WHERE id_practica = $1`,
      [idPractica],
    );

    return {
      conocimientos_teoricos: rows[0]?.conocimientos_teoricos ?? '',
      procedimentales: rows[0]?.procedimentales ?? '',
      actitudinales: rows[0]?.actitudinales ?? '',
    };
  }

  async upsertCompetenciasRotacion(usuario: any, idPractica: number, dto: UpdatePlanRotacionCompetenciasDto): Promise<{
    conocimientos_teoricos: string;
    procedimentales: string;
    actitudinales: string;
  }> {
    await this.esDuenoDePractica(usuario, idPractica);

    const rows = await this.dataSource.query(
      `INSERT INTO plan_rotacion_competencias (id_practica, conocimientos_teoricos, procedimentales, actitudinales, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (id_practica) DO UPDATE SET
         conocimientos_teoricos = EXCLUDED.conocimientos_teoricos,
         procedimentales = EXCLUDED.procedimentales,
         actitudinales = EXCLUDED.actitudinales,
         updated_at = CURRENT_TIMESTAMP
       RETURNING conocimientos_teoricos, procedimentales, actitudinales`,
      [idPractica, dto.conocimientos_teoricos ?? '', dto.procedimentales ?? '', dto.actitudinales ?? ''],
    );

    return rows[0];
  }

  async createInformeAprendizaje(usuario: any, dto: CreateInformeAprendizajeDto): Promise<InformeAprendizajeEntity> {
    await this.esDuenoDePractica(usuario, dto.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(dto.id_practica);
    return this.informeAprendizajeRepository.create(dto);
  }

  async findInformesByPractica(idPractica: number, skip?: number, take?: number): Promise<InformeAprendizajeEntity[]> {
    return this.informeAprendizajeRepository.findByPractica(idPractica, skip, take);
  }

  async updateInformeAprendizaje(usuario: any, id: number, dto: UpdateInformeAprendizajeDto): Promise<InformeAprendizajeEntity> {
    const informe = await this.informeAprendizajeRepository.findById(id);
    if (!informe) {
      throw new NotFoundException(`No se encontró el informe con id ${id}`);
    }
    await this.esDuenoDePractica(usuario, informe.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(informe.id_practica);
    return this.informeAprendizajeRepository.update(id, dto);
  }

  async removeInformeAprendizaje(usuario: any, id: number): Promise<void> {
    const informe = await this.informeAprendizajeRepository.findById(id);
    if (!informe) {
      throw new NotFoundException(`No se encontró el informe con id ${id}`);
    }
    await this.esDuenoDePractica(usuario, informe.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(informe.id_practica);
    return this.informeAprendizajeRepository.remove(id);
  }

  async createEvaluacionPractica(usuario: any, dto: CreateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity> {
    await this.esDuenoDePractica(usuario, dto.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(dto.id_practica);
    return this.evaluacionPracticaRepository.create(dto);
  }

  async findEvaluacionesByPractica(idPractica: number, skip?: number, take?: number): Promise<EvaluacionPracticaEntity[]> {
    return this.evaluacionPracticaRepository.findByPractica(idPractica, skip, take);
  }

  async findEvaluacionById(id: number): Promise<EvaluacionPracticaEntity> {
    const evaluacion = await this.evaluacionPracticaRepository.findById(id);
    if (!evaluacion) throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    return evaluacion;
  }

  async updateEvaluacionPractica(usuario: any, id: number, dto: UpdateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity> {
    const evaluacion = await this.evaluacionPracticaRepository.findById(id);
    if (!evaluacion) {
      throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    }
    await this.esDuenoDePractica(usuario, evaluacion.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(evaluacion.id_practica);
    return this.evaluacionPracticaRepository.update(id, dto);
  }

  async removeEvaluacionPractica(usuario: any, id: number): Promise<void> {
    const evaluacion = await this.evaluacionPracticaRepository.findById(id);
    if (!evaluacion) {
      throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    }
    await this.esDuenoDePractica(usuario, evaluacion.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(evaluacion.id_practica);
    return this.evaluacionPracticaRepository.remove(id);
  }

  async createBitacoraSemanal(usuario: any, dto: CreateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
    const informe = await this.informeAprendizajeRepository.findById(dto.id_informe);
    if (!informe) {
      throw new NotFoundException(`No existe el informe con id ${dto.id_informe} para la bitácora`);
    }
    await this.esDuenoDePractica(usuario, informe.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(informe.id_practica);
    return this.bitacoraSemanalRepository.create(dto);
  }

  async findBitacorasByInforme(idInforme: number, skip?: number, take?: number): Promise<BitacoraSemanalEntity[]> {
    return this.bitacoraSemanalRepository.findByInforme(idInforme, skip, take);
  }

  async updateBitacoraSemanal(usuario: any, id: number, dto: UpdateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
    const bitacora = await this.bitacoraSemanalRepository.findById(id);
    if (!bitacora) {
      throw new NotFoundException(`No se encontró la bitácora con id ${id}`);
    }
    const informe = await this.informeAprendizajeRepository.findById(bitacora.id_informe);
    if (!informe) {
      throw new NotFoundException(`No se encontró el informe asociado a la bitácora con id ${id}`);
    }
    await this.esDuenoDePractica(usuario, informe.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(informe.id_practica);
    return this.bitacoraSemanalRepository.update(id, dto);
  }

  async removeBitacoraSemanal(usuario: any, id: number): Promise<void> {
    const bitacora = await this.bitacoraSemanalRepository.findById(id);
    if (!bitacora) {
      throw new NotFoundException(`No se encontró la bitácora con id ${id}`);
    }
    const informe = await this.informeAprendizajeRepository.findById(bitacora.id_informe);
    if (!informe) {
      throw new NotFoundException(`No se encontró el informe asociado a la bitácora con id ${id}`);
    }
    await this.esDuenoDePractica(usuario, informe.id_practica);
    await this.periodoContextService.validarPeriodoActivoDesdePractica(informe.id_practica);
    return this.bitacoraSemanalRepository.remove(id);
  }

  async createRubrica(dto: CreateRubricaDto): Promise<RubricaEntity> {
    return this.rubricaRepository.create(dto);
  }

  async findAllRubricas(skip?: number, take?: number): Promise<RubricaEntity[]> {
    return this.rubricaRepository.findAll(skip, take);
  }

  async updateRubrica(id: number, dto: UpdateRubricaDto): Promise<RubricaEntity> {
    await this.rubricaRepository.findById(id).then(rubrica => {
      if (!rubrica) throw new NotFoundException(`No se encontró la rúbrica con id ${id}`);
    });
    return this.rubricaRepository.update(id, dto);
  }

  async removeRubrica(id: number): Promise<void> {
    await this.rubricaRepository.findById(id).then(rubrica => {
      if (!rubrica) throw new NotFoundException(`No se encontró la rúbrica con id ${id}`);
    });
    return this.rubricaRepository.remove(id);
  }
}
