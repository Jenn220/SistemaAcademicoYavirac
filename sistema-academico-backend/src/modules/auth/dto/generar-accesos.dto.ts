import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

export type TipoGenerarAccesos = 'ESTUDIANTE' | 'DOCENTE' | 'EMPRESA';

export class GenerarAccesosDto {
  @IsIn(['ESTUDIANTE', 'DOCENTE', 'EMPRESA'])
  tipo: TipoGenerarAccesos;

  @IsNotEmpty({ message: 'El período académico es obligatorio' })
  @IsNumber({}, { message: 'El ID del período académico debe ser un número' })
  id_periodo: number;
}