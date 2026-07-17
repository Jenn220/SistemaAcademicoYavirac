import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthFieldsToUsuarioAndSeedRoles1784167600000 implements MigrationInterface {
  name = 'AddAuthFieldsToUsuarioAndSeedRoles1784167600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.usuario
        ADD COLUMN id_docente bigint NULL REFERENCES public.docente(id_docente),
        ADD COLUMN id_estudiante bigint NULL REFERENCES public.estudiante(id_estudiante),
        ADD COLUMN id_empresa bigint NULL REFERENCES public.empresa(id_empresa),
        ADD COLUMN debe_cambiar_password boolean NOT NULL DEFAULT true,
        ADD COLUMN intentos_fallidos integer NOT NULL DEFAULT 0,
        ADD COLUMN bloqueado boolean NOT NULL DEFAULT false;
    `);

    await queryRunner.query(`
      CREATE INDEX idx_usuario_id_docente ON public.usuario USING btree (id_docente);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_usuario_id_estudiante ON public.usuario USING btree (id_estudiante);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_usuario_id_empresa ON public.usuario USING btree (id_empresa);
    `);

    await queryRunner.query(`
      INSERT INTO public.rol (nombre) VALUES
        ('DOCENTE'),
        ('ESTUDIANTE'),
        ('TUTOR_EMPRESARIAL'),
        ('COORDINADOR');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM public.rol WHERE nombre IN ('DOCENTE','ESTUDIANTE','TUTOR_EMPRESARIAL','COORDINADOR');
    `);

    await queryRunner.query(`DROP INDEX IF EXISTS public.idx_usuario_id_empresa;`);
    await queryRunner.query(`DROP INDEX IF EXISTS public.idx_usuario_id_estudiante;`);
    await queryRunner.query(`DROP INDEX IF EXISTS public.idx_usuario_id_docente;`);

    await queryRunner.query(`
      ALTER TABLE public.usuario
        DROP COLUMN bloqueado,
        DROP COLUMN intentos_fallidos,
        DROP COLUMN debe_cambiar_password,
        DROP COLUMN id_empresa,
        DROP COLUMN id_estudiante,
        DROP COLUMN id_docente;
    `);
  }
}
