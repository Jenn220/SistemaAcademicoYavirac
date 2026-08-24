export const INFORME_FASE_PRACTICA_REPOSITORY = 'InformeFasePracticaRepository';

export interface InformeFasePracticaRepository {
  obtenerInformePorIdPractica(idPractica: number): Promise<Record<string, any> | null>;
}
