import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixDocumentoIdDefault1784092400000 implements MigrationInterface {
  name = 'FixDocumentoIdDefault1784092400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_attrdef
          WHERE adrelid = 'public.documento_fase_practica'::regclass
            AND adnum = 1
        ) THEN
          ALTER TABLE public.documento_fase_practica
            ALTER COLUMN id_documento SET DEFAULT nextval('public.documento_fase_practica_id_documento_seq'::regclass);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.documento_fase_practica
        ALTER COLUMN id_documento DROP DEFAULT;
    `);
  }
}
