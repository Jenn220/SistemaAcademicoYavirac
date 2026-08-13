import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DETALLE_EVALUACION_REPOSITORY, IDetalleEvaluacionRepository } from '../ports/detalle-evaluacion.repository.port';
import { EVALUACION_PRACTICA_REPOSITORY, IEvaluacionPracticaRepository } from '../ports/evaluacion-practica.repository.port';
import { CreateDetalleEvaluacionDto } from '../dto/create-detalle-evaluacion.dto';
import { UpdateDetalleEvaluacionDto } from '../dto/update-detalle-evaluacion.dto';
import { DetalleEvaluacionEntity } from '../domain/detalle-evaluacion.entity';
import { EvaluacionPracticaEntity } from '../domain/evaluacion-practica.entity';

@Injectable()
export class DetalleEvaluacionService {
  constructor(
    @Inject(DETALLE_EVALUACION_REPOSITORY) private readonly repo: IDetalleEvaluacionRepository,
    @Inject(EVALUACION_PRACTICA_REPOSITORY) private readonly evaluacionRepo: IEvaluacionPracticaRepository,
    @InjectRepository(EvaluacionPracticaEntity)
    private readonly evaluacionRepository: Repository<EvaluacionPracticaEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * TUTOR_EMPRESARIAL solo califica F07 (evaluaciones tipo EMPRESA); las
   * notas de F08 (INSTITUTO) son exclusivas de DOCENTE/COORDINADOR. Este
   * endpoint es compartido por ambos formatos y el @Roles de clase no
   * distingue el tipo de evaluación al que pertenece el detalle, así que
   * hay que validarlo aquí (hallazgo QA EI-09).
   */
  private async verificarPermisoTutor(usuario: any, idEvaluacion: number): Promise<void> {
    const esSoloTutor = Array.isArray(usuario?.roles) && usuario.roles.includes('TUTOR_EMPRESARIAL')
      && !usuario.roles.includes('DOCENTE') && !usuario.roles.includes('COORDINADOR');

    if (!esSoloTutor) return;

    const evaluacion = await this.evaluacionRepository.findOne({ where: { id_evaluacion: idEvaluacion } });

    if (evaluacion?.tipo_evaluador !== 'EMPRESA') {
      throw new ForbiddenException('El tutor empresarial solo puede calificar la Evaluación Empresarial (F07).');
    }
  }

  /**
   * Un ESTUDIANTE solo puede tocar detalles de evaluaciones de su propia
   * práctica; sin esto podría manipular el detalle de otro estudiante
   * pasando un id_evaluacion ajeno directamente al endpoint.
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
      throw new NotFoundException('No tienes permiso para acceder a esta evaluación');
    }
  }

  private async verificarAcceso(usuario: any, idEvaluacion: number): Promise<void> {
    await this.verificarPermisoTutor(usuario, idEvaluacion);

    const evaluacion = await this.evaluacionRepo.findById(idEvaluacion);
    if (!evaluacion) {
      throw new NotFoundException(`No se encontró la evaluación con id ${idEvaluacion}`);
    }
    if (!evaluacion.id_practica) {
      throw new NotFoundException(`La evaluación con id ${idEvaluacion} no tiene práctica asociada`);
    }
    await this.esDuenoDePractica(usuario, evaluacion.id_practica);
  }

  async create(usuario: any, dto: CreateDetalleEvaluacionDto): Promise<DetalleEvaluacionEntity> {
    await this.verificarAcceso(usuario, dto.id_evaluacion!);
    return this.repo.create(dto);
  }

  async findByEvaluacion(idEvaluacion: number): Promise<DetalleEvaluacionEntity[]> {
    return this.repo.findByEvaluacion(idEvaluacion);
  }

  async findOne(id: number): Promise<DetalleEvaluacionEntity> {
    const detalle = await this.repo.findOne(id);
    if (!detalle) throw new NotFoundException(`Detalle de evaluación con id ${id} no encontrado`);
    return detalle;
  }

  async update(usuario: any, id: number, dto: UpdateDetalleEvaluacionDto): Promise<DetalleEvaluacionEntity> {
    const detalle = await this.findOne(id);
    await this.verificarAcceso(usuario, detalle.id_evaluacion);
    return this.repo.update(id, dto);
  }

  async remove(usuario: any, id: number): Promise<void> {
    const detalle = await this.findOne(id);
    await this.verificarAcceso(usuario, detalle.id_evaluacion);
    return this.repo.remove(id);
  }
}
