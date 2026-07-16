import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitacoraSemanalEntity } from '../domain/bitacora-semanal.entity';
import { EvaluacionPracticaEntity } from '../domain/evaluacion-practica.entity';
import { InformeAprendizajeEntity } from '../domain/informe-aprendizaje.entity';
import { PlanRotacionEntity } from '../domain/plan-rotacion.entity';
import { PracticaEntity } from '../domain/practica.entity';
import { RegistroDiarioEntity } from '../domain/registro-diario.entity';
import { RubricaEntity } from '../domain/rubrica.entity';
import { CreateBitacoraSemanalDto } from '../dto/create-bitacora-semanal.dto';
import { CreateEvaluacionPracticaDto } from '../dto/create-evaluacion-practica.dto';
import { CreateInformeAprendizajeDto } from '../dto/create-informe-aprendizaje.dto';
import { CreatePlanRotacionDto } from '../dto/create-plan-rotacion.dto';
import { CreatePracticaDto } from '../dto/create-practica.dto';
import { CreateRegistroDiarioDto } from '../dto/create-registro-diario.dto';
import { CreateRubricaDto } from '../dto/create-rubrica.dto';
import { UpdateBitacoraSemanalDto } from '../dto/update-bitacora-semanal.dto';
import { UpdateEvaluacionPracticaDto } from '../dto/update-evaluacion-practica.dto';
import { UpdateInformeAprendizajeDto } from '../dto/update-informe-aprendizaje.dto';
import { UpdatePlanRotacionDto } from '../dto/update-plan-rotacion.dto';
import { UpdatePracticaDto } from '../dto/update-practica.dto';
import { UpdateRegistroDiarioDto } from '../dto/update-registro-diario.dto';
import { UpdateRubricaDto } from '../dto/update-rubrica.dto';

function toMinutes(hhmm?: string): number | null {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function calcularHoras(dto: {
  hora_ingreso?: string;
  hora_salida_almuerzo?: string;
  hora_regreso_almuerzo?: string;
  hora_salida?: string;
}): number {
  const ingreso = toMinutes(dto.hora_ingreso);
  const salida = toMinutes(dto.hora_salida);
  const almuerzoIn = toMinutes(dto.hora_salida_almuerzo);
  const almuerzoOut = toMinutes(dto.hora_regreso_almuerzo);
  if (ingreso === null || salida === null) return 0;
  let horas = salida - ingreso;
  if (almuerzoIn !== null && almuerzoOut !== null) {
    horas -= almuerzoOut - almuerzoIn;
  }
  return Math.max(0, horas) / 60;
}

@Injectable()
export class PracticaService {
  constructor(
    @InjectRepository(PracticaEntity)
    private readonly practicaRepository: Repository<PracticaEntity>,
    @InjectRepository(RegistroDiarioEntity)
    private readonly registroDiarioRepository: Repository<RegistroDiarioEntity>,
    @InjectRepository(PlanRotacionEntity)
    private readonly planRotacionRepository: Repository<PlanRotacionEntity>,
    @InjectRepository(InformeAprendizajeEntity)
    private readonly informeAprendizajeRepository: Repository<InformeAprendizajeEntity>,
    @InjectRepository(EvaluacionPracticaEntity)
    private readonly evaluacionPracticaRepository: Repository<EvaluacionPracticaEntity>,
    @InjectRepository(BitacoraSemanalEntity)
    private readonly bitacoraSemanalRepository: Repository<BitacoraSemanalEntity>,
    @InjectRepository(RubricaEntity)
    private readonly rubricaRepository: Repository<RubricaEntity>,
  ) {}

  private async recalcularHorasCumplidas(idPractica: number): Promise<void> {
    const registros = await this.registroDiarioRepository.find({ where: { id_practica: idPractica } });
    const total = registros.reduce((acc, r) => {
      const horas = calcularHoras(r);
      return acc + (Number.isFinite(horas) ? horas : 0);
    }, 0);
    const horasEnteras = Math.round(total);
    const practica = await this.practicaRepository.findOneBy({ id_practica: idPractica });
    if (!practica) return;
    practica.total_horas_cumplidas = horasEnteras;
    await this.practicaRepository.save(practica);
  }

  async createPractica(dto: CreatePracticaDto): Promise<PracticaEntity> {
    const practica = this.practicaRepository.create({
      ...dto,
      total_horas_requeridas: dto.total_horas_requeridas ?? 400,
      total_horas_cumplidas: dto.total_horas_cumplidas ?? 0,
      estado: dto.estado ?? 'EN_CURSO',
    });
    return this.practicaRepository.save(practica);
  }

  async findAllPracticas(): Promise<PracticaEntity[]> {
    return this.practicaRepository.find();
  }

  async findPracticaById(id: number): Promise<PracticaEntity> {
    const practica = await this.practicaRepository.findOneBy({ id_practica: id });
    if (!practica) {
      throw new NotFoundException(`No se encontró la práctica con id ${id}`);
    }
    return practica;
  }

  async updatePractica(id: number, dto: UpdatePracticaDto): Promise<PracticaEntity> {
    const practica = await this.findPracticaById(id);
    Object.assign(practica, dto);
    return this.practicaRepository.save(practica);
  }

  async removePractica(id: number): Promise<void> {
    const practica = await this.findPracticaById(id);
    await this.practicaRepository.remove(practica);
  }

  async createRegistroDiario(dto: CreateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    const practica = await this.practicaRepository.findOneBy({ id_practica: dto.id_practica });
    if (!practica) {
      throw new NotFoundException(`No existe la práctica con id ${dto.id_practica} para registrar asistencia`);
    }
    const registro = this.registroDiarioRepository.create(dto);
    const guardado = await this.registroDiarioRepository.save(registro);
    await this.recalcularHorasCumplidas(dto.id_practica);
    return guardado;
  }

  async findRegistrosByPractica(idPractica: number): Promise<RegistroDiarioEntity[]> {
    return this.registroDiarioRepository.find({ where: { id_practica: idPractica } });
  }

  async updateRegistroDiario(id: number, dto: UpdateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    const registro = await this.registroDiarioRepository.findOneBy({ id_registro_diario: id });
    if (!registro) {
      throw new NotFoundException(`No se encontró el registro diario con id ${id}`);
    }
    Object.assign(registro, dto);
    const guardado = await this.registroDiarioRepository.save(registro);
    await this.recalcularHorasCumplidas(registro.id_practica);
    return guardado;
  }

  async removeRegistroDiario(id: number): Promise<void> {
    const registro = await this.registroDiarioRepository.findOneBy({ id_registro_diario: id });
    if (!registro) {
      throw new NotFoundException(`No se encontró el registro diario con id ${id}`);
    }
    const idPractica = registro.id_practica;
    await this.registroDiarioRepository.remove(registro);
    await this.recalcularHorasCumplidas(idPractica);
  }

  async createPlanRotacion(dto: CreatePlanRotacionDto): Promise<PlanRotacionEntity> {
    const practica = await this.practicaRepository.findOneBy({ id_practica: dto.id_practica });
    if (!practica) {
      throw new NotFoundException(`No existe la práctica con id ${dto.id_practica}`);
    }
    const plan = this.planRotacionRepository.create(dto);
    return this.planRotacionRepository.save(plan);
  }

  async findPlanRotacionByPractica(idPractica: number): Promise<PlanRotacionEntity[]> {
    return this.planRotacionRepository.find({ where: { id_practica: idPractica } });
  }

  async updatePlanRotacion(id: number, dto: UpdatePlanRotacionDto): Promise<PlanRotacionEntity> {
    const plan = await this.planRotacionRepository.findOneBy({ id_plan_rotacion: id });
    if (!plan) {
      throw new NotFoundException(`No se encontró el plan de rotación con id ${id}`);
    }
    Object.assign(plan, dto);
    return this.planRotacionRepository.save(plan);
  }

  async removePlanRotacion(id: number): Promise<void> {
    const plan = await this.planRotacionRepository.findOneBy({ id_plan_rotacion: id });
    if (!plan) {
      throw new NotFoundException(`No se encontró el plan de rotación con id ${id}`);
    }
    await this.planRotacionRepository.remove(plan);
  }

  async createInformeAprendizaje(dto: CreateInformeAprendizajeDto): Promise<InformeAprendizajeEntity> {
    const practica = await this.practicaRepository.findOneBy({ id_practica: dto.id_practica });
    if (!practica) {
      throw new NotFoundException(`No existe la práctica con id ${dto.id_practica}`);
    }
    const informe = this.informeAprendizajeRepository.create(dto);
    return this.informeAprendizajeRepository.save(informe);
  }

  async findInformesByPractica(idPractica: number): Promise<InformeAprendizajeEntity[]> {
    return this.informeAprendizajeRepository.find({ where: { id_practica: idPractica } });
  }

  async updateInformeAprendizaje(id: number, dto: UpdateInformeAprendizajeDto): Promise<InformeAprendizajeEntity> {
    const informe = await this.informeAprendizajeRepository.findOneBy({ id_informe: id });
    if (!informe) {
      throw new NotFoundException(`No se encontró el informe con id ${id}`);
    }
    Object.assign(informe, dto);
    return this.informeAprendizajeRepository.save(informe);
  }

  async removeInformeAprendizaje(id: number): Promise<void> {
    const informe = await this.informeAprendizajeRepository.findOneBy({ id_informe: id });
    if (!informe) {
      throw new NotFoundException(`No se encontró el informe con id ${id}`);
    }
    await this.informeAprendizajeRepository.remove(informe);
  }

  async createEvaluacionPractica(dto: CreateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity> {
    const practica = await this.practicaRepository.findOneBy({ id_practica: dto.id_practica });
    if (!practica) {
      throw new NotFoundException(`No existe la práctica con id ${dto.id_practica}`);
    }
    if (dto.nota_final_calculada !== undefined && (dto.nota_final_calculada < 0 || dto.nota_final_calculada > 10)) {
      throw new BadRequestException('La nota final calculada debe estar entre 0 y 10');
    }
    const evaluacion = this.evaluacionPracticaRepository.create(dto);
    return this.evaluacionPracticaRepository.save(evaluacion);
  }

  async findEvaluacionesByPractica(idPractica: number): Promise<EvaluacionPracticaEntity[]> {
    return this.evaluacionPracticaRepository.find({ where: { id_practica: idPractica } });
  }

  async updateEvaluacionPractica(id: number, dto: UpdateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity> {
    const evaluacion = await this.evaluacionPracticaRepository.findOneBy({ id_evaluacion: id });
    if (!evaluacion) {
      throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    }
    Object.assign(evaluacion, dto);
    return this.evaluacionPracticaRepository.save(evaluacion);
  }

  async removeEvaluacionPractica(id: number): Promise<void> {
    const evaluacion = await this.evaluacionPracticaRepository.findOneBy({ id_evaluacion: id });
    if (!evaluacion) {
      throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    }
    await this.evaluacionPracticaRepository.remove(evaluacion);
  }

  async createBitacoraSemanal(dto: CreateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
    const informe = await this.informeAprendizajeRepository.findOneBy({ id_informe: dto.id_informe });
    if (!informe) {
      throw new NotFoundException(`No existe el informe con id ${dto.id_informe} para la bitácora`);
    }
    const bitacora = this.bitacoraSemanalRepository.create(dto);
    return this.bitacoraSemanalRepository.save(bitacora);
  }

  async findBitacorasByInforme(idInforme: number): Promise<BitacoraSemanalEntity[]> {
    return this.bitacoraSemanalRepository.find({ where: { id_informe: idInforme } });
  }

  async updateBitacoraSemanal(id: number, dto: UpdateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
    const bitacora = await this.bitacoraSemanalRepository.findOneBy({ id_bitacora: id });
    if (!bitacora) {
      throw new NotFoundException(`No se encontró la bitácora con id ${id}`);
    }
    Object.assign(bitacora, dto);
    return this.bitacoraSemanalRepository.save(bitacora);
  }

  async removeBitacoraSemanal(id: number): Promise<void> {
    const bitacora = await this.bitacoraSemanalRepository.findOneBy({ id_bitacora: id });
    if (!bitacora) {
      throw new NotFoundException(`No se encontró la bitácora con id ${id}`);
    }
    await this.bitacoraSemanalRepository.remove(bitacora);
  }

  async createRubrica(dto: CreateRubricaDto): Promise<RubricaEntity> {
    const rubrica = this.rubricaRepository.create(dto);
    return this.rubricaRepository.save(rubrica);
  }

  async findAllRubricas(): Promise<RubricaEntity[]> {
    return this.rubricaRepository.find();
  }

  async updateRubrica(id: number, dto: UpdateRubricaDto): Promise<RubricaEntity> {
    const rubrica = await this.rubricaRepository.findOneBy({ id_rubrica: id });
    if (!rubrica) {
      throw new NotFoundException(`No se encontró la rúbrica con id ${id}`);
    }
    Object.assign(rubrica, dto);
    return this.rubricaRepository.save(rubrica);
  }

  async removeRubrica(id: number): Promise<void> {
    const rubrica = await this.rubricaRepository.findOneBy({ id_rubrica: id });
    if (!rubrica) {
      throw new NotFoundException(`No se encontró la rúbrica con id ${id}`);
    }
    await this.rubricaRepository.remove(rubrica);
  }
}
