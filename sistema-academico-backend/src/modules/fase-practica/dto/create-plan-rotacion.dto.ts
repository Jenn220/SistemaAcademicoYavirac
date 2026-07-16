import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreatePlanRotacionDto {
  @IsNumber()
  id_practica!: number;

  @IsNumber()
  id_item_pm!: number;

  @IsString()
  @MaxLength(200)
  puesto_aprendizaje!: string;
}
