import { IsInt, IsString, IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateActividadEstudianteDto {
  @IsInt()
  @IsNotEmpty()
  id_vinculacion: number;

  @IsDateString()
  @IsNotEmpty()
  fecha: string; 

  @IsString()
  @IsNotEmpty()
  hora_inicio: string; 

  @IsString()
  @IsNotEmpty()
  hora_fin: string; 

  @IsNumber()
  @IsNotEmpty()
  horas_total: number; 

  @IsString()
  @IsNotEmpty()
  actividades_realizadas: string;
}