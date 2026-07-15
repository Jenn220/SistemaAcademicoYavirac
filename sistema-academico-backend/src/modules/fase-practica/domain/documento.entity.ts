import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'documento_fase_practica' })
export class DocumentoEntity {
  @PrimaryGeneratedColumn({ name: 'id_documento' })
  id_documento!: number;

  @Column({ name: 'codigo_formato', type: 'varchar', length: 20 })
  codigo_formato!: string;

  @Column({ name: 'titulo', type: 'varchar', length: 200, nullable: true })
  titulo?: string;

  @Column({ name: 'contenido', type: 'jsonb' })
  contenido!: Record<string, any>;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: Date;
}
