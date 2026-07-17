import { IsNotEmpty, IsString } from 'class-validator';

export class DesbloquearDto {
  // No se valida como email: para TUTOR_EMPRESARIAL el "correo" es el nombre de la empresa.
  @IsNotEmpty()
  @IsString()
  correo: string;
}
