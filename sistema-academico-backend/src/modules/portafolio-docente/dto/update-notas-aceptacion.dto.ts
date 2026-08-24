import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, IsNumber, Max, Min, ValidateNested } from 'class-validator';

export class NotaEstudianteDto {
  @IsInt()
  id_aceptacion: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  nota: number;
}

export class UpdateNotasAceptacionDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => NotaEstudianteDto)
  estudiantes: NotaEstudianteDto[];
}
