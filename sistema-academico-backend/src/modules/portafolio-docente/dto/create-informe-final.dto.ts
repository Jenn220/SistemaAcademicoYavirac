import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateInformeFinalDto {
  @IsNotEmpty()
  @IsNumber()
  id_docente: number;

  @IsNotEmpty()
  @IsNumber()
  id_periodo: number;

  @IsNotEmpty()
  @IsNumber()
  id_asignatura: number;

  @IsNotEmpty()
  @IsNumber()
  id_paralelo: number;

  @IsNotEmpty()
  @IsString()
  horario: string;
}
