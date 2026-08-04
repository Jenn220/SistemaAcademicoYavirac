import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { EvaluacionPracticaEntity } from '../domain/evaluacion-practica.entity';
import { DetalleEvaluacionEntity } from '../domain/detalle-evaluacion.entity';
import { ItemRubricaEntity } from '../domain/item-rubrica.entity';
import { CreateEvaluacionEmpresaDto } from '../dto/create-evaluacion-empresa.dto';
import { UpdateEvaluacionEmpresaDto } from '../dto/update-evaluacion-empresa.dto';
import { EvaluacionEmpresaResponseDto } from '../dto/evaluacion-empresa-response.dto';

@Injectable()
export class EvaluacionEmpresaService {
  constructor(
    @InjectRepository(EvaluacionPracticaEntity)
    private readonly evaluacionRepository: Repository<EvaluacionPracticaEntity>,
    @InjectRepository(DetalleEvaluacionEntity)
    private readonly detalleRepository: Repository<DetalleEvaluacionEntity>,
    @InjectRepository(ItemRubricaEntity)
    private readonly itemRubricaRepository: Repository<ItemRubricaEntity>,
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
      throw new NotFoundException('No tienes permiso para acceder a esta evaluación');
    }
  }

  async create(usuario: any, dto: CreateEvaluacionEmpresaDto): Promise<EvaluacionEmpresaResponseDto> {
    await this.esDuenoDePractica(usuario, dto.id_practica);
    const evaluacion = this.evaluacionRepository.create({
      id_practica: dto.id_practica,
      id_rubrica: dto.id_evaluacion_plan_marco,
      tipo_evaluador: 'EMPRESA',
      nota_final_calculada: dto.calificacion,
    });
    const saved = await this.evaluacionRepository.save(evaluacion);

    const items = await this.itemRubricaRepository.find({
      where: { id_rubrica: dto.id_evaluacion_plan_marco },
    });

    for (const item of items) {
      await this.detalleRepository.save(
        this.detalleRepository.create({
          id_evaluacion: saved.id_evaluacion,
          id_item: item.id_item,
          puntaje_asignado: 0,
        }),
      );
    }

    return {
      id_evaluacion_empresa: saved.id_evaluacion,
      id_practica: saved.id_practica,
      id_evaluacion_plan_marco: saved.id_rubrica,
      calificacion: saved.nota_final_calculada,
      fortalezas: dto.fortalezas,
      oportunidades_mejora: dto.oportunidades_mejora,
      recomendaciones: dto.recomendaciones,
    } as EvaluacionEmpresaResponseDto;
  }

  async findByPractica(idPractica: number): Promise<EvaluacionEmpresaResponseDto[]> {
    const evaluaciones = await this.evaluacionRepository.find({
      where: { id_practica: idPractica },
    });

    return evaluaciones.map((e) => ({
      id_evaluacion_empresa: e.id_evaluacion,
      id_practica: e.id_practica,
      id_evaluacion_plan_marco: e.id_rubrica,
      calificacion: e.nota_final_calculada,
    })) as EvaluacionEmpresaResponseDto[];
  }

  async findOne(id: number): Promise<EvaluacionEmpresaResponseDto | null> {
    const evaluacion = await this.evaluacionRepository.findOne({ where: { id_evaluacion: id } });
    if (!evaluacion) return null;

    return {
      id_evaluacion_empresa: evaluacion.id_evaluacion,
      id_practica: evaluacion.id_practica,
      id_evaluacion_plan_marco: evaluacion.id_rubrica,
      calificacion: evaluacion.nota_final_calculada,
    } as EvaluacionEmpresaResponseDto;
  }

  async update(usuario: any, id: number, dto: UpdateEvaluacionEmpresaDto): Promise<EvaluacionEmpresaResponseDto> {
    const evaluacion = await this.evaluacionRepository.findOne({ where: { id_evaluacion: id } });
    if (!evaluacion) throw new NotFoundException(`Evaluacion con id ${id} no encontrada`);

    await this.esDuenoDePractica(usuario, evaluacion.id_practica);

    Object.assign(evaluacion, {
      nota_final_calculada: dto.calificacion,
    });

    const saved = await this.evaluacionRepository.save(evaluacion);

    return {
      id_evaluacion_empresa: saved.id_evaluacion,
      id_practica: saved.id_practica,
      id_evaluacion_plan_marco: saved.id_rubrica,
      calificacion: saved.nota_final_calculada,
      fortalezas: dto.fortalezas,
      oportunidades_mejora: dto.oportunidades_mejora,
      recomendaciones: dto.recomendaciones,
    } as EvaluacionEmpresaResponseDto;
  }

  async remove(usuario: any, id: number): Promise<void> {
    const evaluacion = await this.evaluacionRepository.findOne({ where: { id_evaluacion: id } });
    if (!evaluacion) throw new NotFoundException(`Evaluacion con id ${id} no encontrada`);
    await this.esDuenoDePractica(usuario, evaluacion.id_practica);
    await this.evaluacionRepository.remove(evaluacion);
  }
}
