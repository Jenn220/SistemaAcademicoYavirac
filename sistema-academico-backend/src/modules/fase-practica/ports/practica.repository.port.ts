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

export const PRACTICA_REPOSITORY = 'PracticaRepository';

export interface IPracticaRepository {
  createPractica(dto: CreatePracticaDto): Promise<PracticaEntity>;
  findAllPracticas(skip?: number, take?: number): Promise<PracticaEntity[]>;
  findPracticaById(id: number): Promise<PracticaEntity | null>;
  updatePractica(id: number, dto: UpdatePracticaDto): Promise<PracticaEntity>;
  removePractica(id: number): Promise<void>;

  createRegistroDiario(dto: CreateRegistroDiarioDto): Promise<RegistroDiarioEntity>;
  findRegistrosByPractica(idPractica: number): Promise<RegistroDiarioEntity[]>;
  findRegistroDiarioById(id: number): Promise<RegistroDiarioEntity | null>;
  updateRegistroDiario(id: number, dto: UpdateRegistroDiarioDto): Promise<RegistroDiarioEntity>;
  removeRegistroDiario(id: number): Promise<void>;

  createPlanRotacion(dto: CreatePlanRotacionDto): Promise<PlanRotacionEntity>;
  findPlanRotacionByPractica(idPractica: number): Promise<PlanRotacionEntity[]>;
  findPlanRotacionById(id: number): Promise<PlanRotacionEntity | null>;
  updatePlanRotacion(id: number, dto: UpdatePlanRotacionDto): Promise<PlanRotacionEntity>;
  removePlanRotacion(id: number): Promise<void>;

  createInformeAprendizaje(dto: CreateInformeAprendizajeDto): Promise<InformeAprendizajeEntity>;
  findInformesByPractica(idPractica: number): Promise<InformeAprendizajeEntity[]>;
  findInformeAprendizajeById(id: number): Promise<InformeAprendizajeEntity | null>;
  updateInformeAprendizaje(id: number, dto: UpdateInformeAprendizajeDto): Promise<InformeAprendizajeEntity>;
  removeInformeAprendizaje(id: number): Promise<void>;

  createEvaluacionPractica(dto: CreateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity>;
  findEvaluacionesByPractica(idPractica: number): Promise<EvaluacionPracticaEntity[]>;
  findEvaluacionPracticaById(id: number): Promise<EvaluacionPracticaEntity | null>;
  updateEvaluacionPractica(id: number, dto: UpdateEvaluacionPracticaDto): Promise<EvaluacionPracticaEntity>;
  removeEvaluacionPractica(id: number): Promise<void>;

  createBitacoraSemanal(dto: CreateBitacoraSemanalDto): Promise<BitacoraSemanalEntity>;
  findBitacorasByInforme(idInforme: number): Promise<BitacoraSemanalEntity[]>;
  findBitacoraSemanalById(id: number): Promise<BitacoraSemanalEntity | null>;
  updateBitacoraSemanal(id: number, dto: UpdateBitacoraSemanalDto): Promise<BitacoraSemanalEntity>;
  removeBitacoraSemanal(id: number): Promise<void>;

  createRubrica(dto: CreateRubricaDto): Promise<RubricaEntity>;
  findAllRubricas(): Promise<RubricaEntity[]>;
  findRubricaById(id: number): Promise<RubricaEntity | null>;
  updateRubrica(id: number, dto: UpdateRubricaDto): Promise<RubricaEntity>;
  removeRubrica(id: number): Promise<void>;
}
