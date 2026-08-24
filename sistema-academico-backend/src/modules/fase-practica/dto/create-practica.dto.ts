import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePracticaDto {
  @IsNumber()
  @Min(1)
  id_periodo!: number;

  @IsNumber()
  @Min(1)
  id_matricula_detalle!: number;

  @IsNumber()
  @Min(1)
  id_empresa!: number;

  @IsNumber()
  @Min(1)
  id_tutor_empresarial!: number;

  @IsNumber()
  @Min(1)
  id_docente!: number;

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
