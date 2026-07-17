  import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany } from 'typeorm';


  @Entity('vinculacion_estudiante')
  @Unique(['id_matricula_detalle'])
  export class VinculacionEstudianteEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id_vinculacion: string;

    @Column({ type: 'bigint' })
    id_periodo: string;

    @Column({ type: 'bigint', unique: true })
    id_matricula_detalle: string;

    @Column({ type: 'bigint' })
    id_empresa: string;

    @Column({ type: 'bigint' })
    id_docente: string;

    @Column({ type: 'varchar', length: 255 })
    nombre_proyecto: string;

    @Column({ type: 'date' })
    fecha_inicio: Date;

    @Column({ type: 'date' })
    fecha_fin: Date;

    @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
    total_horas_estudiante: number;

    @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
    total_horas_docente: number;

    @Column({ type: 'varchar', length: 30, default: 'EN_CURSO' })
    estado: string;

  }