import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePlanRotacionDto {
  @IsNumber()
  @Min(1)
  id_practica!: number;

  @IsNumber()
  @Min(1)
  id_item_pm!: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  puesto_aprendizaje?: string;
}
