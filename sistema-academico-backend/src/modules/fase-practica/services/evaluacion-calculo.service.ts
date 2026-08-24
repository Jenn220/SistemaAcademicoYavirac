import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluacionPracticaEntity } from '../domain/evaluacion-practica.entity';
import { DetalleEvaluacionEntity } from '../domain/detalle-evaluacion.entity';
import { ItemRubricaEntity } from '../domain/item-rubrica.entity';

@Injectable()
export class EvaluacionCalculoService {
  constructor(
    @InjectRepository(EvaluacionPracticaEntity)
    private readonly evaluacionRepository: Repository<EvaluacionPracticaEntity>,
    @InjectRepository(DetalleEvaluacionEntity)
    private readonly detalleRepository: Repository<DetalleEvaluacionEntity>,
    @InjectRepository(ItemRubricaEntity)
    private readonly itemRubricaRepository: Repository<ItemRubricaEntity>,
  ) {}

  async calcularPromedioPorPractica(idPractica: number): Promise<number> {
    const evaluaciones = await this.evaluacionRepository.find({ where: { id_practica: idPractica } });
    if (evaluaciones.length === 0) return 0;

    const suma = evaluaciones.reduce((acc, e) => acc + (e.nota_final_calculada ?? 0), 0);
    return Number((suma / evaluaciones.length).toFixed(2));
  }

  async calcularPromedioPorItem(idEvaluacion: number): Promise<number> {
    const detalles = await this.detalleRepository.find({ where: { id_evaluacion: idEvaluacion } });
    if (detalles.length === 0) return 0;

    const suma = detalles.reduce((acc, d) => acc + (d.puntaje_asignado ?? 0), 0);
    return Number((suma / detalles.length).toFixed(2));
  }

  async calcularEvaluacionEmpresarial(idEvaluacion: number) {
    const evaluacion = await this.evaluacionRepository.findOne({ where: { id_evaluacion: idEvaluacion } });
    if (!evaluacion) throw new NotFoundException(`Evaluación con id ${idEvaluacion} no encontrada`);

    let items = [];
    if (evaluacion.id_rubrica) {
      items = await this.itemRubricaRepository.find({ where: { id_rubrica: evaluacion.id_rubrica } });
    } else {
      items = await this.itemRubricaRepository.find({});
    }

    const detalles = await this.detalleRepository.find({ where: { id_evaluacion: idEvaluacion } });

    const desempenoItems = items.filter(i => i.ponderacion && i.ponderacion < 1 && !i.descripcion_criterio.toLowerCase().includes('defensa'));
    const defensaItems = items.filter(i => i.descripcion_criterio.toLowerCase().includes('defensa') || i.descripcion_criterio.toLowerCase().includes('presentación') || i.descripcion_criterio.toLowerCase().includes('dominio') || i.descripcion_criterio.toLowerCase().includes('claridad') || i.descripcion_criterio.toLowerCase().includes('satisfacción'));

    const desempenoDetalles = detalles.filter(d => {
      const item = items.find(i => i.id_item === d.id_item);
      return item && desempenoItems.find(di => di.id_item === item.id_item);
    });

    const defensaDetalles = detalles.filter(d => {
      const item = items.find(i => i.id_item === d.id_item);
      return item && defensaItems.find(di => di.id_item === item.id_item);
    });

    const promedioDesempeno = desempenoDetalles.length > 0
      ? Number((desempenoDetalles.reduce((a, b) => a + Number(b.puntaje_asignado ?? 0), 0) / desempenoDetalles.length).toFixed(2))
      : 0;

    // notaParcialDefensa es la SUMA (no el promedio) de los 5 criterios de
    // defensa, cada uno calificado 1-4 (Deficiente..Excelente): máximo 20,
    // que al dividir entre 2 da la "nota final de defensa" sobre 10. Usar
    // un promedio aquí (como antes) topaba la nota máxima posible en 5/10
    // en vez de 10/10, porque cada puntaje_asignado individual nunca pasa
    // de 4 aunque el campo acepte hasta 10.
    const notaParcialDefensa = defensaDetalles.reduce((a, b) => a + Number(b.puntaje_asignado ?? 0), 0);

    // notaPonderadaDesempeno pesa 7/10: usar promedioDesempeno sin ponderar
    // (como antes) permitía notas finales por encima de 10/10 (verificado:
    // 8 de desempeño + 2.7 ponderado de defensa = 10.7/10).
    const notaPonderadaDesempeno = Number((promedioDesempeno * 7 / 10).toFixed(2));

    const notaFinalDefensa = Number((notaParcialDefensa / 2).toFixed(2));
    const notaPonderadaDefensa = Number((notaFinalDefensa * 3 / 10).toFixed(2));
    const notaFinalEmpresa = Number((notaPonderadaDesempeno + notaPonderadaDefensa).toFixed(2));

    const saved = await this.evaluacionRepository.save({
      ...evaluacion,
      promedio_desempeno: promedioDesempeno,
      nota_ponderada_desempeno: notaPonderadaDesempeno,
      nota_parcial_defensa: notaParcialDefensa,
      nota_final_defensa: notaFinalDefensa,
      nota_ponderada_defensa: notaPonderadaDefensa,
      nota_final_empresa: notaFinalEmpresa,
      nota_final_calculada: notaFinalEmpresa,
    });

    return {
      evaluacion: saved,
      promedioDesempeno,
      notaPonderadaDesempeno,
      notaParcialDefensa,
      notaFinalDefensa,
      notaPonderadaDefensa,
      notaFinalEmpresa,
    };
  }

  async calcularEvaluacionInstituto(idEvaluacion: number) {
    const evaluacion = await this.evaluacionRepository.findOne({ where: { id_evaluacion: idEvaluacion } });
    if (!evaluacion) throw new NotFoundException(`Evaluación con id ${idEvaluacion} no encontrada`);

    let items = [];
    if (evaluacion.id_rubrica) {
      items = await this.itemRubricaRepository.find({ where: { id_rubrica: evaluacion.id_rubrica } });
    } else {
      items = await this.itemRubricaRepository.find({});
    }

    const detalles = await this.detalleRepository.find({ where: { id_evaluacion: idEvaluacion } });

    const defensaItems = items.filter(i => i.descripcion_criterio.toLowerCase().includes('defensa') || i.descripcion_criterio.toLowerCase().includes('presentación') || i.descripcion_criterio.toLowerCase().includes('dominio') || i.descripcion_criterio.toLowerCase().includes('claridad') || i.descripcion_criterio.toLowerCase().includes('satisfacción'));
    const proyectoItems = items.filter(i => !defensaItems.find(d => d.id_item === i.id_item));

    const defensaDetalles = detalles.filter(d => {
      const item = items.find(i => i.id_item === d.id_item);
      return item && defensaItems.find(di => di.id_item === item.id_item);
    });

    const proyectoDetalles = detalles.filter(d => {
      const item = items.find(i => i.id_item === d.id_item);
      return item && proyectoItems.find(pi => pi.id_item === item.id_item);
    });

    // Ver comentario equivalente en calcularEvaluacionEmpresarial: suma,
    // no promedio, de los 5 criterios de defensa (1-4 c/u, máximo 20).
    const notaParcialDefensa = defensaDetalles.reduce((a, b) => a + Number(b.puntaje_asignado ?? 0), 0);

    const notaFinalDefensa = Number((notaParcialDefensa / 2).toFixed(2));
    const notaPonderadaDefensa = Number((notaFinalDefensa * 3 / 10).toFixed(2));

    const promedioProyecto = proyectoDetalles.length > 0
      ? Number((proyectoDetalles.reduce((a, b) => a + Number(b.puntaje_asignado ?? 0), 0) / proyectoDetalles.length).toFixed(2))
      : 0;

    const notaPonderadaProyecto = Number((promedioProyecto * 7 / 10).toFixed(2));
    const notaFinalInstituto = Number((notaPonderadaDefensa + notaPonderadaProyecto).toFixed(2));

    const saved = await this.evaluacionRepository.save({
      ...evaluacion,
      nota_parcial_defensa: notaParcialDefensa,
      nota_final_defensa: notaFinalDefensa,
      nota_ponderada_defensa: notaPonderadaDefensa,
      promedio_proyecto_empresarial: promedioProyecto,
      nota_ponderada_proyecto: notaPonderadaProyecto,
      nota_final_instituto: notaFinalInstituto,
      nota_final_calculada: notaFinalInstituto,
    });

    return {
      evaluacion: saved,
      notaParcialDefensa,
      notaFinalDefensa,
      notaPonderadaDefensa,
      promedioProyecto,
      notaPonderadaProyecto,
      notaFinalInstituto,
    };
  }
}
