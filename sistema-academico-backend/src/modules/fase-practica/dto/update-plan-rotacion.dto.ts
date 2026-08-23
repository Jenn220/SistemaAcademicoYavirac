import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePlanRotacionDto {
  @IsOptional()
  @IsNumber()
  id_practica?: number;

  @IsOptional()
  @IsNumber()
  id_item_pm?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  puesto_aprendizaje?: string;
}
