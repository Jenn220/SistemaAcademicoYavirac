import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // No se valida como email: para TUTOR_EMPRESARIAL el "correo" es el nombre de la empresa, no un email real.
  @IsNotEmpty()
  @IsString()
  correo: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
