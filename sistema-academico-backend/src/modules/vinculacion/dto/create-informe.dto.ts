import { IsInt, IsString, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInformeDto {
  @IsInt()
  @IsOptional() // Lo ponemos opcional para no romper otros flujos
  id_informe?: number;

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