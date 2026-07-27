export const CONTEXTO_FASE_PRACTICA_REPOSITORY = 'ContextoFasePracticaRepository';

export interface IContextoFasePracticaRepository {
  obtenerContextoPorEstudiante(idEstudiante: number): Promise<any>;
  obtenerResumenGeneral(idEstudiante: number): Promise<any>;
}
