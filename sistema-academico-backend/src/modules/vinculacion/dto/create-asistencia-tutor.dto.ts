import { IsInt, IsString, IsDateString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateAsistenciaTutorDto {
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
  @IsOptional() // 🟢 Opcional: el servicio recalcula automáticamente las horas
  horas_total?: number;

  @IsString()
  @IsNotEmpty()
  actividad_realizada: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}