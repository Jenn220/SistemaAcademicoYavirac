import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CerrarPeriodoDto {
  @IsIn(['CERRAR'])
  confirmacion!: 'CERRAR';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}