import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedItemsRubricaFormato07170727122001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO public.item_rubrica (id_rubrica, descripcion_criterio, puntaje_maximo, ponderacion) VALUES
            (1, 'Logro de Objetivos de Aprendizaje', 10, 0.10),
            (1, 'Desempeño en los puestos de trabajo y actividades asignadas (Plan de rotación)', 10, 0.10),
            (1, 'Capacidad de aplicar los conocimientos en la práctica', 10, 0.10),
            (1, 'Capacidad de comunicación oral y escrita', 10, 0.10),
            (1, 'Capacidad de investigación, aprender y actualizarse permanentemente', 10, 0.10),
            (1, 'Capacidad creativa', 10, 0.10),
            (1, 'Capacidad para identificar, plantear y resolver problemas', 10, 0.10),
            (1, 'Capacidad de trabajo en equipo y capacidades interpersonales', 10, 0.10),
            (1, 'Valoración y respecto por la diversidad y multiculturalidad', 10, 0.10),
            (1, 'Habilidad para trabajar en forma autónoma', 10, 0.10),
            (2, 'Presentación en tiempo y forma (formato, normas APA, cronograma)', 10, 0.20),
            (2, 'Calidad de la presentación (uso ayudas técnicas y audiovisuales, etc.)', 10, 0.20),
            (2, 'Dominio del contenido', 10, 0.20),
            (2, 'Claridad y precisión en la exposición', 10, 0.20),
            (2, 'Satisfacción de la Empresa Formadora', 10, 0.20),
            (3, 'Proactividad, independencia y compromiso demostrado en la elaboración del proyecto', 10, 0.14285714),
            (3, 'Plazo y calidad en la entrega de documentos', 10, 0.14285714),
            (3, 'Cumplimiento de parametros en el proyecto empresarial escrito', 10, 0.14285714),
            (3, 'Desarrollo del proyecto en profundidad y aporte a la solución del problema', 10, 0.14285714),
            (3, 'Cumplimiento de requerimientos / objetivos planteados al inicio del proyecto', 10, 0.14285714),
            (3, 'Uso de metodología científica y aplicación de normas bibliográficas', 10, 0.14285714),
            (3, 'Aporte al proyecto acorde al nivel académico', 10, 0.14285714)
            ON CONFLICT DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.item_rubrica WHERE id_rubrica IN (1,2,3);`);
    }
}
