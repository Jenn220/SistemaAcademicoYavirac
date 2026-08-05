import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateHorarioInformeFinalDto {
  @IsNotEmpty()
  @IsString()
  horario: string;
}
