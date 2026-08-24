import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCvTables1784950000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.cv_dato_academico (
                id_cv_dato_academico bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
                id_estudiante bigint NOT NULL,
                anio varchar(20) NOT NULL,
                institucion varchar(150) NOT NULL,
                titulo_mencion varchar(150) NOT NULL,
                nota_final numeric(5,2),
                CONSTRAINT cv_dato_academico_pkey PRIMARY KEY (id_cv_dato_academico)
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.cv_experiencia_laboral (
                id_cv_experiencia_laboral bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
                id_estudiante bigint NOT NULL,
                anio varchar(20) NOT NULL,
                institucion varchar(150) NOT NULL,
                cargo varchar(100) NOT NULL,
                actividades text NOT NULL,
                CONSTRAINT cv_experiencia_laboral_pkey PRIMARY KEY (id_cv_experiencia_laboral)
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.cv_practica_dual (
                id_cv_practica_dual bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
                id_estudiante bigint NOT NULL,
                anio_periodo varchar(20) NOT NULL,
                institucion varchar(150) NOT NULL,
                cargo varchar(100) NOT NULL,
                actividades_realizadas text NOT NULL,
                CONSTRAINT cv_practica_dual_pkey PRIMARY KEY (id_cv_practica_dual)
            );
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_cv_dato_academico_estudiante ON public.cv_dato_academico(id_estudiante);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_cv_experiencia_laboral_estudiante ON public.cv_experiencia_laboral(id_estudiante);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_cv_practica_dual_estudiante ON public.cv_practica_dual(id_estudiante);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS public.idx_cv_practica_dual_estudiante;`);
        await queryRunner.query(`DROP INDEX IF EXISTS public.idx_cv_experiencia_laboral_estudiante;`);
        await queryRunner.query(`DROP INDEX IF EXISTS public.idx_cv_dato_academico_estudiante;`);
        await queryRunner.query(`DROP TABLE IF EXISTS public.cv_practica_dual;`);
        await queryRunner.query(`DROP TABLE IF EXISTS public.cv_experiencia_laboral;`);
        await queryRunner.query(`DROP TABLE IF EXISTS public.cv_dato_academico;`);
    }
}
