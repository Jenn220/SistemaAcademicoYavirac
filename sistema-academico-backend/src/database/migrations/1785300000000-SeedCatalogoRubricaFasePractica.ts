import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * catalogo_rubrica / item_rubrica estaban vacías: los formatos F07
 * (Evaluación Empresarial) y F08 (Evaluación Instituto) se guardaban en un
 * snapshot JSON aislado (documento_fase_practica) usando este mismo texto
 * fijo desde el frontend (rubricas-fase-practica.ts), sin pasar nunca por
 * el sistema real de evaluaciones (EvaluacionCalculoService, detalle_evaluacion).
 * Esta migración siembra las 2 rúbricas y sus criterios para que el
 * frontend pueda consumir el sistema real en vez del snapshot.
 */
export class SeedCatalogoRubricaFasePractica1785300000000 implements MigrationInterface {
  name = 'SeedCatalogoRubricaFasePractica1785300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO public.catalogo_rubrica (nombre, tipo, estado) VALUES
      ('Evaluación Empresarial (F07)', 'EMPRESARIAL', 'ACTIVO'),
      ('Evaluación del Instituto (F08)', 'INSTITUTO', 'ACTIVO')
      ON CONFLICT DO NOTHING;
    `);

    // F07 — 10 criterios de desempeño (0-10, ponderación 0.10 c/u: promedio
    // ponderado 7/10 del total) + 5 criterios de defensa del proyecto
    // (1-4, sin ponderación: se suman y aportan el 3/10 restante — ver
    // EvaluacionCalculoService.calcularEvaluacionEmpresarial).
    await queryRunner.query(`
      INSERT INTO public.item_rubrica (id_rubrica, descripcion_criterio, puntaje_maximo, ponderacion)
      SELECT r.id_rubrica, c.descripcion, c.puntaje_maximo, c.ponderacion
      FROM public.catalogo_rubrica r
      CROSS JOIN (VALUES
        ('Logro de Objetivos de Aprendizaje', 10.00, 0.10),
        ('Desempeño en los puestos de trabajo y actividades asignadas (Plan de rotación)', 10.00, 0.10),
        ('Capacidad de aplicar los conocimientos en la práctica.', 10.00, 0.10),
        ('Capacidad de comunicación oral y escrita.', 10.00, 0.10),
        ('Capacidad de investigación, aprender y actualizarse permanentemente', 10.00, 0.10),
        ('Capacidad creativa.', 10.00, 0.10),
        ('Capacidad para identificar, plantear y resolver problemas.', 10.00, 0.10),
        ('Capacidad de trabajo en equipo y capacidades interpersonales', 10.00, 0.10),
        ('Valoración y respeto por la diversidad y multiculturalidad.', 10.00, 0.10),
        ('Habilidad para trabajar en forma autónoma.', 10.00, 0.10)
      ) AS c(descripcion, puntaje_maximo, ponderacion)
      WHERE r.tipo = 'EMPRESARIAL'
      AND NOT EXISTS (
        SELECT 1 FROM public.item_rubrica ir WHERE ir.id_rubrica = r.id_rubrica AND ir.descripcion_criterio = c.descripcion
      );
    `);

    await queryRunner.query(`
      INSERT INTO public.item_rubrica (id_rubrica, descripcion_criterio, puntaje_maximo, ponderacion)
      SELECT r.id_rubrica, c.descripcion, c.puntaje_maximo, NULL
      FROM public.catalogo_rubrica r
      CROSS JOIN (VALUES
        ('Presentación en tiempo y forma (formato, normas APA, cronograma)', 4.00),
        ('Calidad de la presentación (uso ayudas técnicas y audiovisuales, etc.)', 4.00),
        ('Dominio del contenido', 4.00),
        ('Claridad y precisión en la exposición', 4.00),
        ('Satisfacción de la Empresa Formadora', 4.00)
      ) AS c(descripcion, puntaje_maximo)
      WHERE r.tipo = 'EMPRESARIAL'
      AND NOT EXISTS (
        SELECT 1 FROM public.item_rubrica ir WHERE ir.id_rubrica = r.id_rubrica AND ir.descripcion_criterio = c.descripcion
      );
    `);

    // F08 — mismos 5 criterios de defensa (aportan 3/10) + 7 parámetros del
    // proyecto empresarial escrito (0-10, aportan el 7/10 restante — ver
    // EvaluacionCalculoService.calcularEvaluacionInstituto).
    await queryRunner.query(`
      INSERT INTO public.item_rubrica (id_rubrica, descripcion_criterio, puntaje_maximo, ponderacion)
      SELECT r.id_rubrica, c.descripcion, c.puntaje_maximo, NULL
      FROM public.catalogo_rubrica r
      CROSS JOIN (VALUES
        ('Presentación en tiempo y forma (formato, normas APA, cronograma)', 4.00),
        ('Calidad de la presentación (uso ayudas técnicas y audiovisuales, etc.)', 4.00),
        ('Dominio del contenido', 4.00),
        ('Claridad y precisión en la exposición', 4.00),
        ('Satisfacción de la Empresa Formadora', 4.00)
      ) AS c(descripcion, puntaje_maximo)
      WHERE r.tipo = 'INSTITUTO'
      AND NOT EXISTS (
        SELECT 1 FROM public.item_rubrica ir WHERE ir.id_rubrica = r.id_rubrica AND ir.descripcion_criterio = c.descripcion
      );
    `);

    await queryRunner.query(`
      INSERT INTO public.item_rubrica (id_rubrica, descripcion_criterio, puntaje_maximo, ponderacion)
      SELECT r.id_rubrica, c.descripcion, c.puntaje_maximo, NULL
      FROM public.catalogo_rubrica r
      CROSS JOIN (VALUES
        ('Proactividad, independencia y compromiso demostrado en la elaboración del proyecto', 10.00),
        ('Plazo y calidad en la entrega de documentos', 10.00),
        ('Cumplimiento de parámetros en el proyecto empresarial escrito', 10.00),
        ('Desarrollo del proyecto en profundidad y aporte a la solución del problema', 10.00),
        ('Cumplimiento de requerimientos / objetivos planteados al inicio del proyecto', 10.00),
        ('Uso de metodología científica y aplicación de normas bibliográficas', 10.00),
        ('Aporte al proyecto acorde al nivel académico', 10.00)
      ) AS c(descripcion, puntaje_maximo)
      WHERE r.tipo = 'INSTITUTO'
      AND NOT EXISTS (
        SELECT 1 FROM public.item_rubrica ir WHERE ir.id_rubrica = r.id_rubrica AND ir.descripcion_criterio = c.descripcion
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM public.item_rubrica
      WHERE id_rubrica IN (SELECT id_rubrica FROM public.catalogo_rubrica WHERE tipo IN ('EMPRESARIAL', 'INSTITUTO'));
    `);
    await queryRunner.query(`
      DELETE FROM public.catalogo_rubrica WHERE tipo IN ('EMPRESARIAL', 'INSTITUTO');
    `);
  }
}
