import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReasignarCoordinadorDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idNuevoCoordinador!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}