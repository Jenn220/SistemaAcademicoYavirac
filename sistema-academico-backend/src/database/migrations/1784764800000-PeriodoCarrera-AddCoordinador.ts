import { MigrationInterface, QueryRunner } from "typeorm";

export class PeriodoCarreraAddCoordinador1784764800000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.periodo_carrera
                ADD COLUMN id_coordinador BIGINT NULL REFERENCES public.docente(id_docente);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_periodo_carrera_coordinador
                ON public.periodo_carrera USING btree (id_coordinador);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS public.idx_periodo_carrera_coordinador;`);
        await queryRunner.query(`ALTER TABLE public.periodo_carrera DROP COLUMN IF EXISTS id_coordinador;`);
    }
}
