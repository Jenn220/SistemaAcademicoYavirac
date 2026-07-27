import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCvExperienciaLaboralDto {
  @IsString()
  @IsNotEmpty()
  anio!: string;

  @IsString()
  @IsNotEmpty()
  institucion!: string;

  @IsString()
  @IsNotEmpty()
  cargo!: string;

  @IsString()
  @IsNotEmpty()
  actividades!: string;
}

export class UpdateCvExperienciaLaboralDto {
  @IsOptional()
  @IsString()
  anio?: string;

  @IsOptional()
  @IsString()
  institucion?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsString()
  actividades?: string;
}

export class CvExperienciaLaboralResponseDto {
  id_cv_experiencia_laboral!: number;
  id_estudiante!: number;
  anio!: string;
  institucion!: string;
  cargo!: string;
  actividades!: string;
}
