/**
 * Etiquetas oficiales de los criterios de evaluación (formatos F07/F08).
 * No son un mock ni datos de un estudiante: son texto fijo del formato
 * institucional (idéntico en cada evaluación, confirmado contra los PDF
 * finales F07/F08), igual que el encabezado "Niveles de logro esperado"
 * del Plan Marco. Lo que nunca se inventa aquí son las NOTAS: siempre
 * arrancan en 0 y solo se llenan con datos reales guardados en la BD.
 */

export const CRITERIOS_DESEMPENO_EMPRESARIAL: string[] = [
  'Logro de Objetivos de Aprendizaje',
  'Desempeño en los puestos de trabajo y actividades asignadas (Plan de rotación)',
  'Capacidad de aplicar los conocimientos en la práctica.',
  'Capacidad de comunicación oral y escrita.',
  'Capacidad de investigación, aprender y actualizarse permanentemente',
  'Capacidad creativa.',
  'Capacidad para identificar, plantear y resolver problemas.',
  'Capacidad de trabajo en equipo y capacidades interpersonales',
  'Valoración y respeto por la diversidad y multiculturalidad.',
  'Habilidad para trabajar en forma autónoma.'
];

export const CRITERIOS_DEFENSA_PROYECTO: string[] = [
  'Presentación en tiempo y forma (formato, normas APA, cronograma)',
  'Calidad de la presentación (uso ayudas técnicas y audiovisuales, etc.)',
  'Dominio del contenido',
  'Claridad y precisión en la exposición',
  'Satisfacción de la Empresa Formadora'
];

export const CRITERIOS_PARAMETROS_PROYECTO: string[] = [
  'Proactividad, independencia y compromiso demostrado en la elaboración del proyecto',
  'Plazo y calidad en la entrega de documentos',
  'Cumplimiento de parámetros en el proyecto empresarial escrito',
  'Desarrollo del proyecto en profundidad y aporte a la solución del problema',
  'Cumplimiento de requerimientos / objetivos planteados al inicio del proyecto',
  'Uso de metodología científica y aplicación de normas bibliográficas',
  'Aporte al proyecto acorde al nivel académico'
];
