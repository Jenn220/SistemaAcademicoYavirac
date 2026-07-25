import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVinculacionEntidadReceptora1784937000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tabla nueva e independiente: entidad beneficiaria (ONG, comunidad, institución, etc.)
        // No es lo mismo que "empresa" (usada por fase-práctica), por eso es una tabla aparte.
        await queryRunner.query(`
            CREATE TABLE public.vinculacion_entidad_receptora (
                id_entidad BIGSERIAL PRIMARY KEY,
                nombre_entidad VARCHAR(255) NOT NULL,
                direccion VARCHAR(255) NOT NULL,
                telefono VARCHAR(50) NULL,
                correo VARCHAR(150) NULL,
                tutor_entidad_receptora VARCHAR(200) NOT NULL
            );
        `);

        // Columna opcional (nullable) en vinculacion_estudiante.
        // Se deja id_empresa intacta -- no se toca ni se reemplaza, para no romper nada de fase-práctica.
        await queryRunner.query(`
            ALTER TABLE public.vinculacion_estudiante
                ADD COLUMN id_entidad_receptora BIGINT NULL
                REFERENCES public.vinculacion_entidad_receptora(id_entidad);
        `);

        await queryRunner.query(`
            CREATE INDEX idx_ve_entidad_receptora
                ON public.vinculacion_estudiante USING btree (id_entidad_receptora);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS public.idx_ve_entidad_receptora;`);
        await queryRunner.query(`ALTER TABLE public.vinculacion_estudiante DROP COLUMN IF EXISTS id_entidad_receptora;`);
        await queryRunner.query(`DROP TABLE IF EXISTS public.vinculacion_entidad_receptora;`);
    }
}
