import { Inject, Injectable } from '@nestjs/common';
import {
  INFORME_FASE_PRACTICA_REPOSITORY,
  InformeFasePracticaRepository,
} from '../ports/informe-fase-practica.repository';

@Injectable()
export class InformeFasePracticaService {
  constructor(
    @Inject(INFORME_FASE_PRACTICA_REPOSITORY)
    private readonly repository: InformeFasePracticaRepository,
  ) {}

  obtenerInforme(idPractica: number): Promise<Record<string, any> | null> {
    return this.repository.obtenerInformePorIdPractica(idPractica);
  }
}
