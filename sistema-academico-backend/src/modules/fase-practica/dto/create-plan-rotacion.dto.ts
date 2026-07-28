import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePlanRotacionDto {
  @IsNumber()
  id_practica!: number;

  @IsNumber()
  id_item_pm!: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  puesto_aprendizaje?: string;
}
