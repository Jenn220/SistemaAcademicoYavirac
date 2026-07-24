import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateRepresentanteSeguimientoPeaDto {
  @IsNotEmpty()
  @IsInt()
  id_representante: number;
}
