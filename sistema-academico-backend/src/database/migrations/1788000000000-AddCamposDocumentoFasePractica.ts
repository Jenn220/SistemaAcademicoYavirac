import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCamposDocumentoFasePractica1788000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.documento_fase_practica
            ADD COLUMN IF NOT EXISTS id_practica bigint,
            ADD COLUMN IF NOT EXISTS id_estudiante bigint,
            ADD COLUMN IF NOT EXISTS id_usuario bigint,
            ADD COLUMN IF NOT EXISTS estado varchar(50) DEFAULT 'borrador',
            ADD COLUMN IF NOT EXISTS version int DEFAULT 1,
            ADD COLUMN IF NOT EXISTS comentarios text,
            ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT CURRENT_TIMESTAMP;
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_documento_practica
            ON public.documento_fase_practica (id_practica, codigo_formato);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS public.idx_documento_practica;
        `);

        await queryRunner.query(`
            ALTER TABLE public.documento_fase_practica
            DROP COLUMN IF EXISTS updated_at,
            DROP COLUMN IF EXISTS comentarios,
            DROP COLUMN IF EXISTS version,
            DROP COLUMN IF EXISTS estado,
            DROP COLUMN IF EXISTS id_usuario,
            DROP COLUMN IF EXISTS id_estudiante,
            DROP COLUMN IF EXISTS id_practica;
        `);
    }
}
