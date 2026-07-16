import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePracticaDto {
  @IsOptional()
  @IsNumber()
  id_matricula_detalle?: number;

  @IsOptional()
  @IsNumber()
  id_periodo_empresa?: number;

  @IsOptional()
  @IsNumber()
  id_periodo_tutor_empresarial?: number;

  @IsOptional()
  @IsNumber()
  id_periodo_docente?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total_horas_requeridas?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total_horas_cumplidas?: number;

  @IsOptional()
  @IsString()
  estado?: string;
}
