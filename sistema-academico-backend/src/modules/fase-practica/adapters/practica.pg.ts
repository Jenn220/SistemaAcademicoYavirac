import { Injectable, NotFoundException } from '@nestjs/common';
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
import { PRACTICA_REPOSITORY, IPracticaRepository } from '../ports/practica.repository.port';

@Injectable()
export class PracticaPg implements IPracticaRepository {
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

  async createPractica(dto: CreatePracticaDto): Promise<PracticaEntity> {
    const practica = this.practicaRepository.create(dto);
    return this.practicaRepository.save(practica);
  }

  async findAllPracticas(skip?: number, take?: number): Promise<PracticaEntity[]> {
    return this.practicaRepository.find({ skip, take });
  }

  async findPracticaById(id: number): Promise<PracticaEntity | null> {
    return this.practicaRepository.findOne({ where: { id_practica: id } });
  }

  async updatePractica(id: number, dto: UpdatePracticaDto): Promise<PracticaEntity> {
    const practica = await this.findPracticaById(id);
    if (!practica) throw new NotFoundException(`No se encontró la práctica con id ${id}`);
    Object.assign(practica, dto);
    return this.practicaRepository.save(practica);
  }

  async removePractica(id: number): Promise<void> {
    const practica = await this.findPracticaById(id);
    if (!practica) throw new NotFoundException(`No se encontró la práctica con id ${id}`);
    await this.practicaRepository.remove(practica);
  }

  async createRegistroDiario(dto: CreateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    const registro = this.registroDiarioRepository.create(dto);
    return this.registroDiarioRepository.save(registro);
  }

  async findRegistrosByPractica(idPractica: number): Promise<RegistroDiarioEntity[]> {
    return this.registroDiarioRepository.find({ where: { id_practica: idPractica } });
  }

  async findRegistroDiarioById(id: number): Promise<RegistroDiarioEntity | null> {
    return this.registroDiarioRepository.findOne({ where: { id_registro_diario: id } });
  }

  async updateRegistroDiario(id: number, dto: UpdateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    const registro = await this.findRegistroDiarioById(id);
    if (!registro) throw new NotFoundException(`No se encontró el registro diario con id ${id}`);
    Object.assign(registro, dto);
    return this.registroDiarioRepository.save(registro);
  }

  async removeRegistroDiario(id: number): Promise<void> {
    const registro = await this.findRegistroDiarioById(id);
    if (!registro) throw new NotFoundException(`No se encontró el registro diario con id ${id}`);
    await this.registroDiarioRepository.remove(registro);
  }

  async createPlanRotacion(dto: CreatePlanRotacionDto): Promise<PlanRotacionEntity> {
    const plan = this.planRotacionRepository.create(dto);
    return this.planRotacionRepository.save(plan);
  }

  async findPlanRotacionByPractica(idPractica: number): Promise<PlanRotacionEntity[]> {
    return this.planRotacionRepository.find({ where: { id_practica: idPractica } });
  }

  async findPlanRotacionById(id: number): Promise<PlanRotacionEntity | null> {
    return this.planRotacionRepository.findOne({ where: { id_plan_rotacion: id } });
  }

  async updatePlanRotacion(id: number, dto: UpdatePlanRotacionDto): Promise<PlanRotacionEntity> {
    const plan = await this.findPlanRotacionById(id);
    if (!plan) throw new NotFoundException(`No se encontró el plan de rotación con id ${id}`);
    Object.assign(plan, dto);
    return this.planRotacionRepository.save(plan);
  }

  async removePlanRotacion(id: number): Promise<void> {
    const plan = await this.findPlanRotacionById(id);
    if (!plan) throw new NotFoundException(`No se encontró el plan de rotación con id ${id}`);
    await this.planRotacionRepository.remove(plan);
  }

  async createInformeAprendizaje(dto: CreateInformeAprendizajeDto): Promise<InformeAprendizajeEntity> {
    const informe = this.informeAprendizajeRepository.create(dto);
    return this.informeAprendizajeRepository.save(informe);
  }

  async findInformesByPractica(idPractica: number): Promise<InformeAprendizajeEntity[]> {
    return this.informeAprendizajeRepository.find({ where: { id_practica: idPractica } });
  }

  async findInformeAprendizajeById(id: number): Promise<InformeAprendizajeEntity | null> {
    return this.informeAprendizajeRepository.findOne({ where: { id_informe: id } });
  }

  async updateInformeAprendizaje(id: number, dto: UpdateInformeAprendizajeDto): Promise<InformeAprendizajeEntity> {
    const informe = await this.findInformeAprendizajeById(id);
    if (!informe) throw new NotFoundException(`No se encontró el informe con id ${id}`);
    Object.assign(informe, dto);
    return this.informeAprendizajeRepository.save(informe);
  }

  async removeInformeAprendizaje(id: number): Promise<void> {
    const informe = await this.findInformeAprendizajeById(id);
    if (!informe) throw new NotFoundException(`No se encontró el informe con id ${id}`);
    await this.informeAprendizajeRepository.remove(informe);
  }

  async createEvaluacionPractica(dto: CreateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity> {
    const evaluacion = this.evaluacionPracticaRepository.create(dto);
    return this.evaluacionPracticaRepository.save(evaluacion);
  }

  async findEvaluacionesByPractica(idPractica: number): Promise<EvaluacionPracticaEntity[]> {
    return this.evaluacionPracticaRepository.find({ where: { id_practica: idPractica } });
  }

  async findEvaluacionPracticaById(id: number): Promise<EvaluacionPracticaEntity | null> {
    return this.evaluacionPracticaRepository.findOne({ where: { id_evaluacion: id } });
  }

  async updateEvaluacionPractica(id: number, dto: UpdateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity> {
    const evaluacion = await this.findEvaluacionPracticaById(id);
    if (!evaluacion) throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    Object.assign(evaluacion, dto);
    return this.evaluacionPracticaRepository.save(evaluacion);
  }

  async removeEvaluacionPractica(id: number): Promise<void> {
    const evaluacion = await this.findEvaluacionPracticaById(id);
    if (!evaluacion) throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    await this.evaluacionPracticaRepository.remove(evaluacion);
  }

  async createBitacoraSemanal(dto: CreateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
    const bitacora = this.bitacoraSemanalRepository.create(dto);
    return this.bitacoraSemanalRepository.save(bitacora);
  }

  async findBitacorasByInforme(idInforme: number): Promise<BitacoraSemanalEntity[]> {
    return this.bitacoraSemanalRepository.find({ where: { id_informe: idInforme } });
  }

  async findBitacoraSemanalById(id: number): Promise<BitacoraSemanalEntity | null> {
    return this.bitacoraSemanalRepository.findOne({ where: { id_bitacora: id } });
  }

  async updateBitacoraSemanal(id: number, dto: UpdateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
    const bitacora = await this.findBitacoraSemanalById(id);
    if (!bitacora) throw new NotFoundException(`No se encontró la bitácora con id ${id}`);
    Object.assign(bitacora, dto);
    return this.bitacoraSemanalRepository.save(bitacora);
  }

  async removeBitacoraSemanal(id: number): Promise<void> {
    const bitacora = await this.findBitacoraSemanalById(id);
    if (!bitacora) throw new NotFoundException(`No se encontró la bitácora con id ${id}`);
    await this.bitacoraSemanalRepository.remove(bitacora);
  }

  async createRubrica(dto: CreateRubricaDto): Promise<RubricaEntity> {
    const rubrica = this.rubricaRepository.create(dto);
    return this.rubricaRepository.save(rubrica);
  }

  async findAllRubricas(): Promise<RubricaEntity[]> {
    return this.rubricaRepository.find();
  }

  async findRubricaById(id: number): Promise<RubricaEntity | null> {
    return this.rubricaRepository.findOne({ where: { id_rubrica: id } });
  }

  async updateRubrica(id: number, dto: UpdateRubricaDto): Promise<RubricaEntity> {
    const rubrica = await this.findRubricaById(id);
    if (!rubrica) throw new NotFoundException(`No se encontró la rúbrica con id ${id}`);
    Object.assign(rubrica, dto);
    return this.rubricaRepository.save(rubrica);
  }

  async removeRubrica(id: number): Promise<void> {
    const rubrica = await this.findRubricaById(id);
    if (!rubrica) throw new NotFoundException(`No se encontró la rúbrica con id ${id}`);
    await this.rubricaRepository.remove(rubrica);
  }
}
