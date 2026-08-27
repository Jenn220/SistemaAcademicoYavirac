import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearPeriodoCarreraDto {
  @IsInt()
  @Min(2000)
  @Max(2100)
  anio: number;

  @IsIn(['1P', '2P'])
  numeroPeriodo: '1P' | '2P';

  @IsInt()
  @Min(1)
  idCarrera: number;

  @IsInt()
  @Min(1)
  idCoordinador: number;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaInicio: string;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaFin: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaInicioAporte1?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaFinAporte1?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaInicioAporte2?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaFinAporte2?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaInicioSupletorio?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaFinSupletorio?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaInicioFaseTeorica?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaFinFaseTeorica?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaInicioFasePractica?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaFinFasePractica?: string;

  @IsOptional()
  @MaxLength(150)
  nombrePeriodo?: string;
}