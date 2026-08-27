import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('evaluacion_parametros_tutor')
@Unique(['idVinculacion'])
export class EvaluacionParametrosTutorEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id_parametro' })
  idParametro: string;

  @Column({ type: 'bigint', name: 'id_vinculacion' })
  idVinculacion: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'puntualidad', default: 0 })
  puntualidad: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'trabajo_autonomo', default: 0 })
  trabajoAutonomo: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'asistencia', default: 0 })
  asistencia: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'etica_profesional', default: 0 })
  eticaProfesional: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'cumple_tareas', default: 0 })
  cumpleTareas: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'actitud_proactiva', default: 0 })
  actitudProactiva: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'coopera_permanentemente', default: 0 })
  cooperaPermanentemente: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'respeto_autoridad', default: 0 })
  respetoAutoridad: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'constancia_predisposicion', default: 0 })
  constanciaPredisposicion: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'responsabilidad_esmero', default: 0 })
  responsabilidadEsmero: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, name: 'habilidad_practica', default: 0 })
  habilidadPractica: number;
}