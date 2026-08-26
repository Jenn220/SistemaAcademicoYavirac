import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';
import { bigintTransformer } from '../../../config/bigint-transformer';

@Entity({ name: 'documento_fase_practica' })
export class DocumentoEntity {
  @PrimaryColumn({ name: 'id_documento', type: 'bigint', transformer: bigintTransformer })
  @Generated('increment')
  id_documento!: number;

  @Column({ name: 'codigo_formato', type: 'varchar', length: 20 })
  codigo_formato!: string;

  @Column({ name: 'titulo', type: 'varchar', length: 200, nullable: true })
  titulo?: string;

  @Column({ name: 'contenido', type: 'jsonb' })
  contenido!: Record<string, any>;

  @Column({ name: 'id_practica', type: 'bigint', nullable: true })
  id_practica?: number;

  @Column({ name: 'id_estudiante', type: 'bigint', nullable: true })
  id_estudiante?: number;

  @Column({ name: 'id_usuario', type: 'bigint', nullable: true })
  id_usuario?: number;

  @Column({ name: 'estado', type: 'varchar', length: 50, default: 'borrador' })
  estado!: string;

  @Column({ name: 'version', type: 'int', default: 1 })
  version!: number;

  @Column({ name: 'comentarios', type: 'text', nullable: true })
  comentarios?: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at?: Date;
}
