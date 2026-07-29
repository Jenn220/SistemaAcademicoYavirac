import { IsNumber, IsOptional, IsString, Max } from 'class-validator';

export class UpdateItemRubricaDto {
  @IsOptional()
  @IsNumber()
  id_rubrica?: number;

  @IsOptional()
  @IsString()
  descripcion_criterio?: string;

  @IsOptional()
  @IsNumber()
  @Max(10)
  puntaje_maximo?: number;

  @IsOptional()
  @IsNumber()
  @Max(10)
  ponderacion?: number;
}
