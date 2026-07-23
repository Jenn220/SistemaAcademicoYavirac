import { IsNotEmpty, IsNumber, IsString, IsInt, Min } from 'class-validator';

export class CreateVinculacionObjetivoDto {
  @IsNotEmpty({ message: 'El ID de la vinculación es obligatorio' })
  @IsNumber({}, { message: 'El ID de vinculación debe ser un número entero' })
  id_vinculacion: number;

  @IsNotEmpty({ message: 'La descripción del objetivo es obligatoria' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion: string;

  @IsNotEmpty({ message: 'El orden del objetivo es obligatorio' })
  @IsInt({ message: 'El orden del objetivo debe ser un número entero' })
  @Min(1, { message: 'El orden debe ser como mínimo 1' })
  orden: number;
}