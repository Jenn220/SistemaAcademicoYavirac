export interface JwtPayload {
  sub: number;
  correo: string;
  roles: string[];
  idDocente: number | null;
  idEstudiante: number | null;
  idEmpresa: number | null;
}
