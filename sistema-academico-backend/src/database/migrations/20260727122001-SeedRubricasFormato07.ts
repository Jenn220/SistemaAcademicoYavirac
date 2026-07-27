import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedRubricasFormato07170727122000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO public.catalogo_rubrica (nombre, tipo, categoria, estado) VALUES
            ('Evaluación Empresarial F07', 'EVALUACION', 'DESEMPENO_F07', 'ACTIVO'),
            ('Evaluación Instituto F08', 'EVALUACION', 'DEFENSA_F08_INSTITUTO', 'ACTIVO'),
            ('Proyecto Empresarial F08', 'PROYECTO', 'PROYECTO_EMPRESARIAL_F08', 'ACTIVO')
            ON CONFLICT DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM public.catalogo_rubrica WHERE nombre IN ('Evaluación Empresarial F07', 'Evaluación Instituto F08', 'Proyecto Empresarial F08');`);
    }
}
