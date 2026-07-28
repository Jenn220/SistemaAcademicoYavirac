import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNucleoEstructurante1784951000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.nucleo_estructurante (
                id_nucleo bigserial PRIMARY KEY,
                id_carrera bigint NOT NULL,
                nombre varchar(150) NOT NULL,
                objetivo text NOT NULL,
                estado varchar(20) NOT NULL DEFAULT 'ACTIVO'
            );
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_nucleo_carrera ON public.nucleo_estructurante USING btree (id_carrera);
        `);

        await queryRunner.query(`
            ALTER TABLE public.nucleo_estructurante
            ADD CONSTRAINT fk_nucleo_carrera FOREIGN KEY (id_carrera) REFERENCES public.carrera(id_carrera);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE public.nucleo_estructurante DROP CONSTRAINT IF EXISTS fk_nucleo_carrera;`);
        await queryRunner.query(`DROP INDEX IF EXISTS public.idx_nucleo_carrera;`);
        await queryRunner.query(`DROP TABLE IF EXISTS public.nucleo_estructurante;`);
    }
}
