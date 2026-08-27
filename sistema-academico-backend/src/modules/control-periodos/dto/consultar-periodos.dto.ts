import {
  IsIn,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ConsultarPeriodosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idPeriodo?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idCarrera?: number;

  @IsOptional()
  @IsIn(['ACTIVO', 'FINALIZADO'])
  estado?: 'ACTIVO' | 'FINALIZADO';
}