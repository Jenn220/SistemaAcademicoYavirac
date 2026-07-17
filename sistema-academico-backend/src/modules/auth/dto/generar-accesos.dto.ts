import { IsIn, IsNotEmpty, IsNumber, ValidateIf } from 'class-validator';

export type TipoGenerarAccesos = 'ESTUDIANTE' | 'DOCENTE' | 'EMPRESA';

export class GenerarAccesosDto {
  @IsIn(['ESTUDIANTE', 'DOCENTE', 'EMPRESA'])
  tipo: TipoGenerarAccesos;

  @ValidateIf((o: GenerarAccesosDto) => o.tipo === 'ESTUDIANTE')
  @IsNotEmpty()
  @IsNumber()
  id_periodo?: number;
}
