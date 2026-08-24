import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnDeleteCascadeToEmpresaFks1785275700000 implements MigrationInterface {
  name = 'AddOnDeleteCascadeToEmpresaFks1785275700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.vinculacion_estudiante
        DROP CONSTRAINT IF EXISTS fk_ve_empresa,
        ADD CONSTRAINT fk_ve_empresa
        FOREIGN KEY (id_empresa)
        REFERENCES public.empresa(id_empresa)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE public.usuario
        DROP CONSTRAINT IF EXISTS usuario_id_empresa_fkey,
        ADD CONSTRAINT usuario_id_empresa_fkey
        FOREIGN KEY (id_empresa)
        REFERENCES public.empresa(id_empresa)
        ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.usuario
        DROP CONSTRAINT IF EXISTS usuario_id_empresa_fkey,
        ADD CONSTRAINT usuario_id_empresa_fkey
        FOREIGN KEY (id_empresa)
        REFERENCES public.empresa(id_empresa);
    `);

    await queryRunner.query(`
      ALTER TABLE public.vinculacion_estudiante
        DROP CONSTRAINT IF EXISTS fk_ve_empresa,
        ADD CONSTRAINT fk_ve_empresa
        FOREIGN KEY (id_empresa)
        REFERENCES public.empresa(id_empresa);
    `);
  }
}
