import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateSeguimientoPeaDto {
  @IsNotEmpty()
  @IsInt()
  id_oferta_asignatura: number;

  @IsNotEmpty()
  @IsInt()
  id_representante: number;
}
