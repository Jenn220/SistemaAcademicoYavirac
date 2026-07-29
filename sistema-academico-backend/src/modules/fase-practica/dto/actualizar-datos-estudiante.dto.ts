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
}
