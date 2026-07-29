import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnDeleteCascadeToFasePractica1785275600000 implements MigrationInterface {
  name = 'AddOnDeleteCascadeToFasePractica1785275600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.plan_rotacion_semana
        DROP CONSTRAINT IF EXISTS fk_prs_plan_rotacion,
        ADD CONSTRAINT fk_prs_plan_rotacion
        FOREIGN KEY (id_plan_rotacion)
        REFERENCES public.plan_rotacion(id_plan_rotacion)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE public.item_plan_marco
        DROP CONSTRAINT IF EXISTS fk_ipm_plan_marco,
        ADD CONSTRAINT fk_ipm_plan_marco
        FOREIGN KEY (id_plan_marco)
        REFERENCES public.plan_marco_formacion(id_plan_marco)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE public.plan_rotacion
        DROP CONSTRAINT IF EXISTS fk_pr_practica,
        ADD CONSTRAINT fk_pr_practica
        FOREIGN KEY (id_practica)
        REFERENCES public.practica_estudiante(id_practica)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE public.plan_rotacion
        DROP CONSTRAINT IF EXISTS fk_pr_item_pm,
        ADD CONSTRAINT fk_pr_item_pm
        FOREIGN KEY (id_item_pm)
        REFERENCES public.item_plan_marco(id_item_pm)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE public.evaluacion_plan_marco
        DROP CONSTRAINT IF EXISTS fk_epm_practica,
        ADD CONSTRAINT fk_epm_practica
        FOREIGN KEY (id_practica)
        REFERENCES public.practica_estudiante(id_practica)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE public.evaluacion_plan_marco
        DROP CONSTRAINT IF EXISTS fk_epm_item_pm,
        ADD CONSTRAINT fk_epm_item_pm
        FOREIGN KEY (id_item_pm)
        REFERENCES public.item_plan_marco(id_item_pm)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE public.evaluacion_practica
        DROP CONSTRAINT IF EXISTS fk_ep_practica,
        ADD CONSTRAINT fk_ep_practica
        FOREIGN KEY (id_practica)
        REFERENCES public.practica_estudiante(id_practica)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE public.informe_aprendizaje
        DROP CONSTRAINT IF EXISTS fk_ia_practica,
        ADD CONSTRAINT fk_ia_practica
        FOREIGN KEY (id_practica)
        REFERENCES public.practica_estudiante(id_practica)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE public.bitacora_semanal
        DROP CONSTRAINT IF EXISTS fk_bs_informe,
        ADD CONSTRAINT fk_bs_informe
        FOREIGN KEY (id_informe)
        REFERENCES public.informe_aprendizaje(id_informe)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE public.registro_diario_practica
        DROP CONSTRAINT IF EXISTS fk_rdp_practica,
        ADD CONSTRAINT fk_rdp_practica
        FOREIGN KEY (id_practica)
        REFERENCES public.practica_estudiante(id_practica)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE public.detalle_evaluacion
        DROP CONSTRAINT IF EXISTS fk_de_evaluacion,
        ADD CONSTRAINT fk_de_evaluacion
        FOREIGN KEY (id_evaluacion)
        REFERENCES public.evaluacion_practica(id_evaluacion)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE public.practica_estudiante
        DROP CONSTRAINT IF EXISTS fk_pe_empresa,
        ADD CONSTRAINT fk_pe_empresa
        FOREIGN KEY (id_empresa)
        REFERENCES public.empresa(id_empresa)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE public.tutor_empresarial
        DROP CONSTRAINT IF EXISTS fk_te_empresa,
        ADD CONSTRAINT fk_te_empresa
        FOREIGN KEY (id_empresa)
        REFERENCES public.empresa(id_empresa)
        ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.tutor_empresarial
        DROP CONSTRAINT IF EXISTS fk_te_empresa,
        ADD CONSTRAINT fk_te_empresa
        FOREIGN KEY (id_empresa)
        REFERENCES public.empresa(id_empresa);
    `);

    await queryRunner.query(`
      ALTER TABLE public.practica_estudiante
        DROP CONSTRAINT IF EXISTS fk_pe_empresa,
        ADD CONSTRAINT fk_pe_empresa
        FOREIGN KEY (id_empresa)
        REFERENCES public.empresa(id_empresa);
    `);

    await queryRunner.query(`
      ALTER TABLE public.detalle_evaluacion
        DROP CONSTRAINT IF EXISTS fk_de_evaluacion,
        ADD CONSTRAINT fk_de_evaluacion
        FOREIGN KEY (id_evaluacion)
        REFERENCES public.evaluacion_practica(id_evaluacion);
    `);

    await queryRunner.query(`
      ALTER TABLE public.registro_diario_practica
        DROP CONSTRAINT IF EXISTS fk_rdp_practica,
        ADD CONSTRAINT fk_rdp_practica
        FOREIGN KEY (id_practica)
        REFERENCES public.practica_estudiante(id_practica);
    `);

    await queryRunner.query(`
      ALTER TABLE public.bitacora_semanal
        DROP CONSTRAINT IF EXISTS fk_bs_informe,
        ADD CONSTRAINT fk_bs_informe
        FOREIGN KEY (id_informe)
        REFERENCES public.informe_aprendizaje(id_informe);
    `);

    await queryRunner.query(`
      ALTER TABLE public.informe_aprendizaje
        DROP CONSTRAINT IF EXISTS fk_ia_practica,
        ADD CONSTRAINT fk_ia_practica
        FOREIGN KEY (id_practica)
        REFERENCES public.practica_estudiante(id_practica);
    `);

    await queryRunner.query(`
      ALTER TABLE public.evaluacion_practica
        DROP CONSTRAINT IF EXISTS fk_ep_practica,
        ADD CONSTRAINT fk_ep_practica
        FOREIGN KEY (id_practica)
        REFERENCES public.practica_estudiante(id_practica);
    `);

    await queryRunner.query(`
      ALTER TABLE public.evaluacion_plan_marco
        DROP CONSTRAINT IF EXISTS fk_epm_item_pm,
        ADD CONSTRAINT fk_epm_item_pm
        FOREIGN KEY (id_item_pm)
        REFERENCES public.item_plan_marco(id_item_pm);
    `);

    await queryRunner.query(`
      ALTER TABLE public.evaluacion_plan_marco
        DROP CONSTRAINT IF EXISTS fk_epm_practica,
        ADD CONSTRAINT fk_epm_practica
        FOREIGN KEY (id_practica)
        REFERENCES public.practica_estudiante(id_practica);
    `);

    await queryRunner.query(`
      ALTER TABLE public.plan_rotacion
        DROP CONSTRAINT IF EXISTS fk_pr_item_pm,
        ADD CONSTRAINT fk_pr_item_pm
        FOREIGN KEY (id_item_pm)
        REFERENCES public.item_plan_marco(id_item_pm);
    `);

    await queryRunner.query(`
      ALTER TABLE public.plan_rotacion
        DROP CONSTRAINT IF EXISTS fk_pr_practica,
        ADD CONSTRAINT fk_pr_practica
        FOREIGN KEY (id_practica)
        REFERENCES public.practica_estudiante(id_practica);
    `);

    await queryRunner.query(`
      ALTER TABLE public.item_plan_marco
        DROP CONSTRAINT IF EXISTS fk_ipm_plan_marco,
        ADD CONSTRAINT fk_ipm_plan_marco
        FOREIGN KEY (id_plan_marco)
        REFERENCES public.plan_marco_formacion(id_plan_marco);
    `);

    await queryRunner.query(`
      ALTER TABLE public.plan_rotacion_semana
        DROP CONSTRAINT IF EXISTS fk_prs_plan_rotacion,
        ADD CONSTRAINT fk_prs_plan_rotacion
        FOREIGN KEY (id_plan_rotacion)
        REFERENCES public.plan_rotacion(id_plan_rotacion);
    `);
  }
}
