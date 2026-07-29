export class InformeDto {
  nombre_docente: string;
  nombre_asignatura: string;
  paralelo: string;
  horario: string;
  periodo: string;
}

export class FirmasDto {
  docente: string;
  coordinador: string | null;
  fecha_firma_docente: Date | null;
  fecha_firma_coordinador: Date | null;
}

export class InformeFinalResponseDto {
  informe: InformeDto;
  firmas: FirmasDto;
}
