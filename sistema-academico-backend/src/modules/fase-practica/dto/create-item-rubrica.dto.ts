import { IsNumber, IsOptional, IsString, Max, MaxLength } from 'class-validator';

export class CreateItemRubricaDto {
  @IsNumber()
  id_rubrica!: number;

  @IsString()
  descripcion_criterio!: string;

  @IsNumber()
  @Max(10)
  puntaje_maximo!: number;

  @IsOptional()
  @IsNumber()
  @Max(10)
  ponderacion?: number;
}
