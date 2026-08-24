import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCvPracticaDualDto {
  @IsString()
  @IsNotEmpty()
  anio_periodo!: string;

  @IsString()
  @IsNotEmpty()
  institucion!: string;

  @IsString()
  @IsNotEmpty()
  cargo!: string;

  @IsString()
  @IsNotEmpty()
  actividades_realizadas!: string;
}

export class UpdateCvPracticaDualDto {
  @IsOptional()
  @IsString()
  anio_periodo?: string;

  @IsOptional()
  @IsString()
  institucion?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsString()
  actividades_realizadas?: string;
}

export class CvPracticaDualResponseDto {
  id_cv_practica_dual!: number;
  id_estudiante!: number;
  anio_periodo!: string;
  institucion!: string;
  cargo!: string;
  actividades_realizadas!: string;
}
