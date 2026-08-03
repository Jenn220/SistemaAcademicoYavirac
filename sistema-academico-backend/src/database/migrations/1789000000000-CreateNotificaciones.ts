import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificaciones1789000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.notificaciones (
                id_notificacion bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                id_usuario_destino bigint NOT NULL,
                id_usuario_origen bigint,
                tipo varchar(50) NOT NULL,
                mensaje text NOT NULL,
                id_practica bigint,
                leida boolean DEFAULT false,
                created_at timestamp DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_notificaciones_destinatario
            ON public.notificaciones (id_usuario_destino, leida, created_at);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS public.idx_notificaciones_destinatario;
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS public.notificaciones;
        `);
    }
}
