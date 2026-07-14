import { IsInt, IsString, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateInformeDto {
  @IsInt()
  @IsNotEmpty()
  id_vinculacion: number;

  @IsDateString()
  @IsNotEmpty()
  fecha_informe: string;

  @IsString()
  @IsNotEmpty()
  actividad_macro: string;

  @IsString()
  @IsNotEmpty()
  resultado_aprendizaje: string;
}