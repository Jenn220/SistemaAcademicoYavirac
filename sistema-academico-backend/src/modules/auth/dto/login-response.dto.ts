export class UsuarioSesionDto {
  id: number;
  correo: string;
  roles: string[];
  idDocente: number | null;
  idEstudiante: number | null;
  idEmpresa: number | null;
}

export class LoginResponseDto {
  accessToken: string;
  usuario: UsuarioSesionDto;
  debeCambiarPassword: boolean;
}
