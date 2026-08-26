import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentoFasePractica1784092361098 implements MigrationInterface {
  name = 'CreateDocumentoFasePractica1784092361098';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.documento_fase_practica (
        id_documento bigint NOT NULL,
        codigo_formato varchar(20) NOT NULL,
        titulo varchar(200),
        contenido jsonb NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'documento_fase_practica_id_documento_seq') THEN
          CREATE SEQUENCE public.documento_fase_practica_id_documento_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER SEQUENCE IF EXISTS public.documento_fase_practica_id_documento_seq OWNED BY public.documento_fase_practica.id_documento;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'documento_fase_practica_pkey') THEN
          ALTER TABLE ONLY public.documento_fase_practica
            ADD CONSTRAINT documento_fase_practica_pkey PRIMARY KEY (id_documento);
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_documento_codigo
        ON public.documento_fase_practica (codigo_formato);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS public.documento_fase_practica`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS public.documento_fase_practica_id_documento_seq`);
  }
}
