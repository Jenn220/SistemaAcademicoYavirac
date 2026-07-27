import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmpresaResponseDto {
  id_empresa!: number;
  ruc!: string;
  razon_social!: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  representante_legal?: string;
  estado?: string;
}
