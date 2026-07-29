import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEmail } from 'class-validator';

export class CreateEntidadReceptoraDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la entidad es obligatorio' })
  @MaxLength(255)
  nombre_entidad: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  direccion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  telefono?: string;

  @IsEmail({}, { message: 'El correo debe ser válido' })
  @IsOptional()
  @MaxLength(150)
  correo?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del tutor de la entidad es obligatorio' })
  @MaxLength(200)
  tutor_entidad_receptora: string;
}