import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIntegrityConstraintsAndIndexes1784092355952 implements MigrationInterface {
  name = 'AddIntegrityConstraintsAndIndexes1784092355952';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_estudiante
    ADD CONSTRAINT fk_ve_periodo FOREIGN KEY (id_periodo) REFERENCES public.periodo_academico(id_periodo);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_estudiante
    ADD CONSTRAINT fk_ve_matricula_detalle FOREIGN KEY (id_matricula_detalle) REFERENCES public.matricula_detalle(id_matricula_detalle);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_estudiante
    ADD CONSTRAINT fk_ve_empresa FOREIGN KEY (id_empresa) REFERENCES public.empresa(id_empresa);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_estudiante
    ADD CONSTRAINT fk_ve_docente FOREIGN KEY (id_docente) REFERENCES public.docente(id_docente);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_actividad_estudiante
    ADD CONSTRAINT fk_vae_vinculacion FOREIGN KEY (id_vinculacion) REFERENCES public.vinculacion_estudiante(id_vinculacion);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_asistencia_tutor
    ADD CONSTRAINT fk_vat_vinculacion FOREIGN KEY (id_vinculacion) REFERENCES public.vinculacion_estudiante(id_vinculacion);
    `);

    await queryRunner.query(`
ALTER TABLE ONLY public.vinculacion_informe
    ADD CONSTRAINT fk_vi_vinculacion FOREIGN KEY (id_vinculacion) REFERENCES public.vinculacion_estudiante(id_vinculacion);
    `);

    await queryRunner.query(`
CREATE INDEX idx_asignatura_nivel ON public.asignatura USING btree (id_nivel);
    `);

    await queryRunner.query(`
CREATE INDEX idx_detalle_matricula ON public.matricula_detalle USING btree (id_matricula);
    `);

    await queryRunner.query(`
CREATE INDEX idx_matricula_estudiante ON public.matricula USING btree (id_estudiante);
    `);

    await queryRunner.query(`
CREATE INDEX idx_matricula_periodo ON public.matricula USING btree (id_periodo);
    `);

    await queryRunner.query(`
CREATE INDEX idx_nivel_carrera ON public.nivel USING btree (id_carrera);
    `);

    await queryRunner.query(`
CREATE INDEX idx_oferta_docente ON public.oferta_asignatura USING btree (id_docente);
    `);

    await queryRunner.query(`
CREATE INDEX idx_oferta_periodo_carrera ON public.oferta_asignatura USING btree (id_periodo_carrera);
    `);

    await queryRunner.query(`
CREATE INDEX idx_matricula_carrera ON public.matricula USING btree (id_carrera);
    `);

    await queryRunner.query(`
CREATE INDEX idx_detalle_oferta ON public.matricula_detalle USING btree (id_oferta_asignatura);
    `);

    await queryRunner.query(`
CREATE INDEX idx_oferta_asignatura ON public.oferta_asignatura USING btree (id_asignatura);
    `);

    await queryRunner.query(`
CREATE INDEX idx_oferta_jornada ON public.oferta_asignatura USING btree (id_jornada);
    `);

    await queryRunner.query(`
CREATE INDEX idx_oferta_paralelo ON public.oferta_asignatura USING btree (id_paralelo);
    `);

    await queryRunner.query(`
CREATE INDEX idx_practica_periodo ON public.practica_estudiante USING btree (id_periodo);
    `);

    await queryRunner.query(`
CREATE INDEX idx_practica_empresa ON public.practica_estudiante USING btree (id_empresa);
    `);

    await queryRunner.query(`
CREATE INDEX idx_practica_tutor ON public.practica_estudiante USING btree (id_tutor_empresarial);
    `);

    await queryRunner.query(`
CREATE INDEX idx_practica_docente ON public.practica_estudiante USING btree (id_docente);
    `);

    await queryRunner.query(`
CREATE INDEX idx_registro_practica ON public.registro_diario_practica USING btree (id_practica);
    `);

    await queryRunner.query(`
CREATE INDEX idx_informe_practica ON public.informe_aprendizaje USING btree (id_practica);
    `);

    await queryRunner.query(`
CREATE INDEX idx_bitacora_informe ON public.bitacora_semanal USING btree (id_informe);
    `);

    await queryRunner.query(`
CREATE INDEX idx_plan_rotacion_practica ON public.plan_rotacion USING btree (id_practica);
    `);

    await queryRunner.query(`
CREATE INDEX idx_prn_periodo ON public.portafolio_reporte_notas USING btree (id_periodo);
    `);

    await queryRunner.query(`
CREATE INDEX idx_pae_matricula_detalle ON public.portafolio_aceptacion_estudiante USING btree (id_matricula_detalle);
    `);

    await queryRunner.query(`
CREATE INDEX idx_ve_periodo ON public.vinculacion_estudiante USING btree (id_periodo);
    `);

    await queryRunner.query(`
CREATE INDEX idx_ve_empresa ON public.vinculacion_estudiante USING btree (id_empresa);
    `);

    await queryRunner.query(`
CREATE INDEX idx_ve_docente ON public.vinculacion_estudiante USING btree (id_docente);
    `);

    await queryRunner.query(`
CREATE INDEX idx_vae_vinculacion ON public.vinculacion_actividad_estudiante USING btree (id_vinculacion);
    `);

    await queryRunner.query(`
CREATE INDEX idx_vat_vinculacion ON public.vinculacion_asistencia_tutor USING btree (id_vinculacion);
    `);

    await queryRunner.query(`
CREATE INDEX idx_vi_vinculacion ON public.vinculacion_informe USING btree (id_vinculacion);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX public.idx_vi_vinculacion`);
    await queryRunner.query(`DROP INDEX public.idx_vat_vinculacion`);
    await queryRunner.query(`DROP INDEX public.idx_vae_vinculacion`);
    await queryRunner.query(`DROP INDEX public.idx_ve_docente`);
    await queryRunner.query(`DROP INDEX public.idx_ve_empresa`);
    await queryRunner.query(`DROP INDEX public.idx_ve_periodo`);
    await queryRunner.query(`DROP INDEX public.idx_pae_matricula_detalle`);
    await queryRunner.query(`DROP INDEX public.idx_prn_periodo`);
    await queryRunner.query(`DROP INDEX public.idx_plan_rotacion_practica`);
    await queryRunner.query(`DROP INDEX public.idx_bitacora_informe`);
    await queryRunner.query(`DROP INDEX public.idx_informe_practica`);
    await queryRunner.query(`DROP INDEX public.idx_registro_practica`);
    await queryRunner.query(`DROP INDEX public.idx_practica_docente`);
    await queryRunner.query(`DROP INDEX public.idx_practica_tutor`);
    await queryRunner.query(`DROP INDEX public.idx_practica_empresa`);
    await queryRunner.query(`DROP INDEX public.idx_practica_periodo`);
    await queryRunner.query(`DROP INDEX public.idx_oferta_paralelo`);
    await queryRunner.query(`DROP INDEX public.idx_oferta_jornada`);
    await queryRunner.query(`DROP INDEX public.idx_oferta_asignatura`);
    await queryRunner.query(`DROP INDEX public.idx_detalle_oferta`);
    await queryRunner.query(`DROP INDEX public.idx_matricula_carrera`);
    await queryRunner.query(`DROP INDEX public.idx_oferta_periodo_carrera`);
    await queryRunner.query(`DROP INDEX public.idx_oferta_docente`);
    await queryRunner.query(`DROP INDEX public.idx_nivel_carrera`);
    await queryRunner.query(`DROP INDEX public.idx_matricula_periodo`);
    await queryRunner.query(`DROP INDEX public.idx_matricula_estudiante`);
    await queryRunner.query(`DROP INDEX public.idx_detalle_matricula`);
    await queryRunner.query(`DROP INDEX public.idx_asignatura_nivel`);
    await queryRunner.query(`ALTER TABLE public.vinculacion_informe DROP CONSTRAINT fk_vi_vinculacion`);
    await queryRunner.query(`ALTER TABLE public.vinculacion_asistencia_tutor DROP CONSTRAINT fk_vat_vinculacion`);
    await queryRunner.query(`ALTER TABLE public.vinculacion_actividad_estudiante DROP CONSTRAINT fk_vae_vinculacion`);
    await queryRunner.query(`ALTER TABLE public.vinculacion_estudiante DROP CONSTRAINT fk_ve_docente`);
    await queryRunner.query(`ALTER TABLE public.vinculacion_estudiante DROP CONSTRAINT fk_ve_empresa`);
    await queryRunner.query(`ALTER TABLE public.vinculacion_estudiante DROP CONSTRAINT fk_ve_matricula_detalle`);
    await queryRunner.query(`ALTER TABLE public.vinculacion_estudiante DROP CONSTRAINT fk_ve_periodo`);
  }
}
