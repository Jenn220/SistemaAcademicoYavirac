import { IsObject, IsOptional } from 'class-validator';

export class CreateDocumentoDto {
  @IsOptional()
  @IsObject()
  contenido?: Record<string, any>;
}
