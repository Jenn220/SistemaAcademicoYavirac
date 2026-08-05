import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarDatosEstudianteDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombres?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  apellidos?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  correo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  estado_civil?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  tipo_sangre?: string;

  @IsOptional()
  @IsString()
  domicilio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  contacto_emergencia_nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  contacto_emergencia_telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  carrera?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nivel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  periodo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nucleo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tutor_academico?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  coordinador?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  empresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tutor_empresarial?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  proyecto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  cobertura?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  plazo?: string;

  @IsOptional()
  @IsString()
  fecha_inicio?: string;

  @IsOptional()
  @IsString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  hornada?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  paralelo?: string;
}
