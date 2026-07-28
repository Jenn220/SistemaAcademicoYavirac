import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONTEXTO_FASE_PRACTICA_REPOSITORY, IContextoFasePracticaRepository } from '../ports/contexto-fase-practica.port';

@Injectable()
export class ContextoFasePracticaService {
  constructor(
    @Inject(CONTEXTO_FASE_PRACTICA_REPOSITORY)
    private readonly contextoRepository: IContextoFasePracticaRepository,
  ) {}

  async obtenerContextoPorEstudiante(idEstudiante: number) {
    return this.contextoRepository.obtenerContextoPorEstudiante(idEstudiante);
  }

  async obtenerResumenGeneral(idEstudiante: number) {
    return this.contextoRepository.obtenerResumenGeneral(idEstudiante);
  }
}
