import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateAsistenciaTutorDto {
  @IsOptional()
  @IsNumber()
  id_vinculacion?: number;

  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  hora_inicio?: string;

  @IsOptional()
  @IsString()
  hora_fin?: string;

  @IsOptional()
  @IsNumber()
  horas_total?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}