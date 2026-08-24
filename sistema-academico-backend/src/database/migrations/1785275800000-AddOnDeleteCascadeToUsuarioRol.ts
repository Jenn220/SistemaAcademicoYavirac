import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnDeleteCascadeToUsuarioRol1785275800000 implements MigrationInterface {
  name = 'AddOnDeleteCascadeToUsuarioRol1785275800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.usuario_rol
        DROP CONSTRAINT IF EXISTS fk_usuario_rol_usuario,
        ADD CONSTRAINT fk_usuario_rol_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES public.usuario(id_usuario)
        ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.usuario_rol
        DROP CONSTRAINT IF EXISTS fk_usuario_rol_usuario,
        ADD CONSTRAINT fk_usuario_rol_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES public.usuario(id_usuario);
    `);
  }
}
