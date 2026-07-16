import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
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
import { UpdateRegistroDiarioDto } from '../dto/update-registro-diario.dto';
import { UpdateRubricaDto } from '../dto/update-rubrica.dto';
import { BitacoraSemanalEntity } from '../domain/bitacora-semanal.entity';
import { EvaluacionPracticaEntity } from '../domain/evaluacion-practica.entity';
import { InformeAprendizajeEntity } from '../domain/informe-aprendizaje.entity';
import { PlanRotacionEntity } from '../domain/plan-rotacion.entity';
import { RegistroDiarioEntity } from '../domain/registro-diario.entity';
import { RubricaEntity } from '../domain/rubrica.entity';

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
  ) {}

  async createPractica(dto: CreatePracticaDto): Promise<PracticaEntity> {
    const data = {
      ...dto,
      total_horas_requeridas: dto.total_horas_requeridas ?? 400,
      total_horas_cumplidas: dto.total_horas_cumplidas ?? 0,
      estado: dto.estado ?? 'EN_CURSO',
    };
    return this.practicaRepository.createPractica(data);
  }

  async findAllPracticas(skip?: number, take?: number): Promise<PracticaEntity[]> {
    return this.practicaRepository.findAllPracticas(skip, take);
  }

  async findPracticaById(id: number): Promise<PracticaEntity> {
    const practica = await this.practicaRepository.findPracticaById(id);
    if (!practica) {
      throw new NotFoundException(`No se encontró la práctica con id ${id}`);
    }
    return practica;
  }

  async updatePractica(id: number, dto: UpdatePracticaDto): Promise<PracticaEntity> {
    await this.findPracticaById(id);
    return this.practicaRepository.updatePractica(id, dto);
  }

  async removePractica(id: number): Promise<void> {
    await this.findPracticaById(id);
    await this.practicaRepository.removePractica(id);
  }

  async createRegistroDiario(dto: CreateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    return this.registroDiarioRepository.create(dto);
  }

  async findRegistrosByPractica(idPractica: number, skip?: number, take?: number): Promise<RegistroDiarioEntity[]> {
    return this.registroDiarioRepository.findByPractica(idPractica, skip, take);
  }

  async updateRegistroDiario(id: number, dto: UpdateRegistroDiarioDto): Promise<RegistroDiarioEntity> {
    return this.registroDiarioRepository.update(id, dto);
  }

  async removeRegistroDiario(id: number): Promise<void> {
    return this.registroDiarioRepository.remove(id);
  }

  async createPlanRotacion(dto: CreatePlanRotacionDto): Promise<PlanRotacionEntity> {
    await this.findPracticaById(dto.id_practica);
    return this.planRotacionRepository.create(dto);
  }

  async findPlanRotacionByPractica(idPractica: number, skip?: number, take?: number): Promise<PlanRotacionEntity[]> {
    return this.planRotacionRepository.findByPractica(idPractica, skip, take);
  }

  async updatePlanRotacion(id: number, dto: UpdatePlanRotacionDto): Promise<PlanRotacionEntity> {
    await this.planRotacionRepository.findById(id).then(plan => {
      if (!plan) throw new NotFoundException(`No se encontró el plan de rotación con id ${id}`);
    });
    return this.planRotacionRepository.update(id, dto);
  }

  async removePlanRotacion(id: number): Promise<void> {
    await this.planRotacionRepository.findById(id).then(plan => {
      if (!plan) throw new NotFoundException(`No se encontró el plan de rotación con id ${id}`);
    });
    return this.planRotacionRepository.remove(id);
  }

  async createInformeAprendizaje(dto: CreateInformeAprendizajeDto): Promise<InformeAprendizajeEntity> {
    await this.findPracticaById(dto.id_practica);
    return this.informeAprendizajeRepository.create(dto);
  }

  async findInformesByPractica(idPractica: number, skip?: number, take?: number): Promise<InformeAprendizajeEntity[]> {
    return this.informeAprendizajeRepository.findByPractica(idPractica, skip, take);
  }

  async updateInformeAprendizaje(id: number, dto: UpdateInformeAprendizajeDto): Promise<InformeAprendizajeEntity> {
    await this.informeAprendizajeRepository.findById(id).then(informe => {
      if (!informe) throw new NotFoundException(`No se encontró el informe con id ${id}`);
    });
    return this.informeAprendizajeRepository.update(id, dto);
  }

  async removeInformeAprendizaje(id: number): Promise<void> {
    await this.informeAprendizajeRepository.findById(id).then(informe => {
      if (!informe) throw new NotFoundException(`No se encontró el informe con id ${id}`);
    });
    return this.informeAprendizajeRepository.remove(id);
  }

  async createEvaluacionPractica(dto: CreateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity> {
    await this.findPracticaById(dto.id_practica);
    return this.evaluacionPracticaRepository.create(dto);
  }

  async findEvaluacionesByPractica(idPractica: number, skip?: number, take?: number): Promise<EvaluacionPracticaEntity[]> {
    return this.evaluacionPracticaRepository.findByPractica(idPractica, skip, take);
  }

  async updateEvaluacionPractica(id: number, dto: UpdateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity> {
    await this.evaluacionPracticaRepository.findById(id).then(evaluacion => {
      if (!evaluacion) throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    });
    return this.evaluacionPracticaRepository.update(id, dto);
  }

  async removeEvaluacionPractica(id: number): Promise<void> {
    await this.evaluacionPracticaRepository.findById(id).then(evaluacion => {
      if (!evaluacion) throw new NotFoundException(`No se encontró la evaluación con id ${id}`);
    });
    return this.evaluacionPracticaRepository.remove(id);
  }

  async createBitacoraSemanal(dto: CreateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
    await this.informeAprendizajeRepository.findById(dto.id_informe).then(informe => {
      if (!informe) throw new NotFoundException(`No existe el informe con id ${dto.id_informe} para la bitácora`);
    });
    return this.bitacoraSemanalRepository.create(dto);
  }

  async findBitacorasByInforme(idInforme: number, skip?: number, take?: number): Promise<BitacoraSemanalEntity[]> {
    return this.bitacoraSemanalRepository.findByInforme(idInforme, skip, take);
  }

  async updateBitacoraSemanal(id: number, dto: UpdateBitacoraSemanalDto): Promise<BitacoraSemanalEntity> {
    await this.bitacoraSemanalRepository.findById(id).then(bitacora => {
      if (!bitacora) throw new NotFoundException(`No se encontró la bitácora con id ${id}`);
    });
    return this.bitacoraSemanalRepository.update(id, dto);
  }

  async removeBitacoraSemanal(id: number): Promise<void> {
    await this.bitacoraSemanalRepository.findById(id).then(bitacora => {
      if (!bitacora) throw new NotFoundException(`No se encontró la bitácora con id ${id}`);
    });
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
