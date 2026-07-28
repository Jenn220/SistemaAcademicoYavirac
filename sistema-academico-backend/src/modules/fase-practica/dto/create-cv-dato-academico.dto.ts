import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCvDatoAcademicoDto {
  @IsString()
  @IsNotEmpty()
  anio!: string;

  @IsString()
  @IsNotEmpty()
  institucion!: string;

  @IsString()
  @IsNotEmpty()
  titulo_mencion!: string;

  @IsOptional()
  @IsNumber()
  nota_final?: number;
}

export class UpdateCvDatoAcademicoDto {
  @IsOptional()
  @IsString()
  anio?: string;

  @IsOptional()
  @IsString()
  institucion?: string;

  @IsOptional()
  @IsString()
  titulo_mencion?: string;

  @IsOptional()
  @IsNumber()
  nota_final?: number;
}

export class CvDatoAcademicoResponseDto {
  id_cv_dato_academico!: number;
  id_estudiante!: number;
  anio!: string;
  institucion!: string;
  titulo_mencion!: string;
  nota_final?: number;
}
