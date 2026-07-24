import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import { saveAs } from 'file-saver';
import {
  InformeFinalManualData,
  InformeFinalResponseDto,
} from '../../modules/portafolio-docente/models/informe-final.model';
import {
  CamposManualesEstudiante,
  ReporteNotasResponseDto,
} from '../../modules/portafolio-docente/models/aceptacion-notas.model';
import {
  SeguimientoPeaManualData,
  SeguimientoPeaResponseDto,
} from '../../modules/portafolio-docente/models/seguimiento-pea.model';

// ---------------------------------------------------------------------
// Paleta institucional
// ---------------------------------------------------------------------
const COLOR_AZUL_TEXTO = '1E3A8A';
const COLOR_AZUL_FONDO = 'EFF6FF';
const COLOR_AZUL_BANDA = 'BFDBFE';
const COLOR_ROJO_TEXTO = '7F1D1D';
const COLOR_ROJO_BANDA = 'FECACA';
const COLOR_BORDE = 'CBD5E1';
const COLOR_TEXTO = '1E293B';
const COLOR_GRIS_TEXTO = '64748B';
const COLOR_NEGRO = '0F172A';

const BORDE_FINO = { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDE };

/** Bordes completos de celda */
const bordesCelda = () => ({
  top: BORDE_FINO,
  bottom: BORDE_FINO,
  left: BORDE_FINO,
  right: BORDE_FINO,
});

// Márgenes de hoja estrechos (aprox 1cm a los lados) para máximo aprovechamiento del ancho
const MARGENES_PAGINA_ESTRECHOS = {
  top: 720,    // 1.27 cm
  bottom: 720, // 1.27 cm
  left: 567,   // 1 cm
  right: 567,  // 1 cm
};

const MARGENES_CELDA = {
  top: 100,
  bottom: 100,
  left: 140,
  right: 140,
};

@Injectable({ providedIn: 'root' })
export class WordExportService {
  constructor(private readonly http: HttpClient) {}

  // =====================================================================
  // INFORME FINAL (Formato 04)
  // =====================================================================
  async exportarInformeFinal(
    informe: InformeFinalResponseDto,
    datos: InformeFinalManualData,
  ): Promise<void> {
    const logo = await this.obtenerLogo();

    const doc = new Document({
      sections: [
        {
          properties: {
            page: { margin: MARGENES_PAGINA_ESTRECHOS },
          },
          children: [
            this.tablaMembrete(logo, 'FORMATO 04 INFORME FINAL PROCESO DOCENTE', '010104'),
            this.espacio(),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 180 },
              children: [
                new TextRun({
                  text: 'INFORME FINAL DE PROCESO DOCENTE',
                  bold: true,
                  size: 24,
                  color: COLOR_NEGRO,
                }),
              ],
            }),

            this.tituloSeccion('1. Antecedentes'),
            this.bloqueCuadroTexto(datos.antecedentes, 800),
            this.espacio(),

            this.tituloSeccion('2. Datos de la asignatura'),
            this.tablaClaveValor([
              ['Nombre del Docente', informe.informe.nombre_docente],
              ['Nombre de la Asignatura', informe.informe.nombre_asignatura],
              ['Paralelo', informe.informe.paralelo],
              ['Horario', informe.informe.horario],
              ['Periodo', informe.informe.periodo],
            ]),
            this.espacio(),

            this.tituloSeccion('3. Desarrollo general de actividades'),
            this.bloqueCuadroTexto(datos.desarrolloActividades, 800),
            this.espacio(),

            this.tituloSeccion('4. Resultados cualitativos obtenidos'),
            this.subtitulo('a. Infraestructura y ambiente pedagógico'),
            this.bloqueCuadroTexto(datos.infraestructura, 600),
            this.subtituloItalica('Recomendaciones de mejora en la Infraestructura y ambiente pedagógico'),
            this.bloqueCuadroTexto(datos.recomendacionesInfraestructura, 600),

            this.subtitulo('b. Desarrollo del Plan de Estudios de la Asignatura'),
            this.bloqueCuadroTexto(datos.planEstudios, 600),
            this.subtituloItalica(
              'Recomendaciones de mejora o actualización del Plan de Estudios de la Asignatura',
            ),
            this.bloqueCuadroTexto(datos.recomendacionesPlanEstudios, 600),
            this.espacio(),

            this.tablaFirmas(informe.firmas.docente, informe.firmas.coordinador ?? '—'),
          ],
        },
      ],
    });

    await this.descargar(doc, `InformeFinal_${informe.informe.nombre_asignatura}`);
  }

  // =====================================================================
  // ACEPTACIÓN DE NOTAS (Formato 07)
  // =====================================================================
  async exportarAceptacionNotas(
    reporte: ReporteNotasResponseDto,
    camposManuales: Map<number, CamposManualesEstudiante>,
  ): Promise<void> {
    const logo = await this.obtenerLogo();
    const fechaHoy = new Date().toLocaleDateString('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const filasEstudiantes = reporte.estudiantes.map((est, i) => {
      const manual = camposManuales.get(est.id_aceptacion);
      return new TableRow({
        children: [
          this.celdaTexto(String(i + 1), { align: AlignmentType.CENTER }),
          this.celdaTexto(est.estudiante, { align: AlignmentType.LEFT }),
          this.celdaTexto(est.cedula, { align: AlignmentType.CENTER }),
          this.celdaTexto(est.nota_registrada != null ? String(est.nota_registrada) : '', {
            align: AlignmentType.CENTER,
          }),
          this.celdaTexto('', { align: AlignmentType.CENTER }),
          this.celdaTexto(manual?.observacion ?? '', { align: AlignmentType.LEFT }),
        ],
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: { margin: MARGENES_PAGINA_ESTRECHOS },
          },
          children: [
            this.tablaMembrete(logo, 'FORMATO 07 FORMATO DE ACEPTACIÓN DE NOTA', '010107'),
            this.espacio(),

            this.tablaClaveValor([
              ['CARRERA', reporte.reporte.carrera, 'DOCENTE', reporte.reporte.docente],
              ['ASIGNATURA', reporte.reporte.asignatura, 'TIPO DE NOTA', reporte.reporte.tipo_reporte],
              [
                'PARALELO',
                `${reporte.reporte.paralelo} · ${reporte.reporte.jornada}`,
                'PER. ACADÉMICO',
                reporte.reporte.periodo,
              ],
            ]),
            this.espacio(),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  tableHeader: true,
                  children: ['N°', 'ESTUDIANTE', 'CÉDULA', 'NOTA', 'FIRMA', 'OBSERVACIÓN'].map(
                    (texto) => this.celdaEncabezado(texto),
                  ),
                }),
                ...filasEstudiantes,
              ],
            }),
            this.espacio(),

            this.tablaFirmasConFecha(
              reporte.reporte.docente,
              reporte.reporte.coordinador ?? '—',
              fechaHoy,
            ),
          ],
        },
      ],
    });

    await this.descargar(doc, `AceptacionNotas_${reporte.reporte.asignatura}_${reporte.reporte.tipo_reporte}`);
  }

  // =====================================================================
  // SEGUIMIENTO PEA (Formato 02)
  // =====================================================================
  async exportarSeguimientoPea(
    seguimiento: SeguimientoPeaResponseDto,
    datos: SeguimientoPeaManualData,
  ): Promise<void> {
    const logo = await this.obtenerLogo();

    const filasSemanas = datos.semanas.map(
      (sem) =>
        new TableRow({
          children: [
            this.celdaTextoAPA(String(sem.semana), AlignmentType.CENTER, 8),
            this.celdaTextoAPA(sem.fecha, AlignmentType.CENTER, 14),
            this.celdaTextoAPA(sem.temas, AlignmentType.LEFT, 48),
            this.celdaTextoAPA(sem.observaciones, AlignmentType.LEFT, 18),
            this.celdaTextoAPA('', AlignmentType.CENTER, 12),
          ],
        }),
    );

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: 'Times New Roman',
              size: 20,
              color: COLOR_TEXTO,
            },
          },
        },
      },
      sections: [
        {
          properties: {
            page: { margin: MARGENES_PAGINA_ESTRECHOS },
          },
          children: [
            this.tablaMembrete(logo, 'FORMATO 02 FORMATO DE SEGUIMIENTO DE PEA', '010102'),
            this.espacio(),

            this.tablaClaveValor([
              ['CARRERA', seguimiento.informe.carrera, 'REPRESENTANTE', seguimiento.representante.nombre],
              ['ASIGNATURA', seguimiento.informe.asignatura, 'TELÉFONO', seguimiento.representante.telefono ?? ''],
              ['PARALELO', seguimiento.informe.paralelo, 'E-MAIL', seguimiento.representante.email ?? ''],
              ['PER. ACADÉMICO', seguimiento.informe.periodo, 'DOCENTE', seguimiento.informe.docente],
            ]),
            this.espacio(),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  tableHeader: true,
                  children: [
                    this.celdaEncabezadoAPA('SEMANA', 8),
                    this.celdaEncabezadoAPA('FECHA', 14),
                    this.celdaEncabezadoAPA('TEMAS TRATADOS EN CLASE, TRABAJOS, TALLERES, APRENDIZAJE AUTÓNOMO', 48),
                    this.celdaEncabezadoAPA('OBSERVACIONES', 18),
                    this.celdaEncabezadoAPA('FIRMA', 12),
                  ],
                }),
                ...filasSemanas,
              ],
            }),
            this.espacio(),

            this.bloqueObservacionEditable(
              'OBSERVACIONES Y ASPECTOS GENERALES A MEJORAR DE LA ASIGNATURA (REPRESENTANTE ESTUDIANTIL)',
              datos.observacionesRepresentante,
            ),
            this.espacio(),

            this.bloqueObservacionEditable(
              'OBSERVACIONES Y ASPECTOS GENERALES A MEJORAR DE LA ASIGNATURA (DOCENTE)',
              datos.observacionesDocente,
            ),
            this.espacio(),

            this.bloqueObservacionEditable(
              'OBSERVACIONES Y ASPECTOS GENERALES A MEJORAR DE LA ASIGNATURA (COORDINADOR)',
              datos.observacionesCoordinador,
            ),
          ],
        },
      ],
    });

    await this.descargar(doc, `SeguimientoPEA_${seguimiento.informe.asignatura}`);
  }

  // =====================================================================
  // Helpers Auxiliares
  // =====================================================================

  private bloqueCuadroTexto(contenido: string | undefined | null, altoMinimo = 600): Table {
    const val = contenido && contenido.trim() !== '' ? contenido : '—';

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          height: { value: altoMinimo, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              borders: bordesCelda(),
              margins: MARGENES_CELDA,
              verticalAlign: VerticalAlign.TOP,
              children: val.split('\n').map(
                (linea) =>
                  new Paragraph({
                    spacing: { before: 40, after: 40 },
                    children: [
                      new TextRun({
                        text: linea,
                        size: 20,
                        color: COLOR_TEXTO,
                      }),
                    ],
                  }),
              ),
            }),
          ],
        }),
      ],
    });
  }

  private celdaTextoAPA(
    texto: string | undefined | null,
    alineacion: (typeof AlignmentType)[keyof typeof AlignmentType],
    anchoPorcentaje: number,
  ): TableCell {
    const contenido = texto && texto.trim() !== '' ? texto : '';
    return new TableCell({
      borders: bordesCelda(),
      margins: MARGENES_CELDA,
      width: { size: anchoPorcentaje, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: alineacion,
          children: [
            new TextRun({
              text: contenido,
              size: 18,
              font: 'Times New Roman',
              color: COLOR_TEXTO,
            }),
          ],
        }),
      ],
    });
  }

  private celdaEncabezadoAPA(texto: string, width?: number): TableCell {
    return new TableCell({
      borders: bordesCelda(),
      margins: MARGENES_CELDA,
      width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
      shading: { type: ShadingType.CLEAR, fill: COLOR_AZUL_FONDO },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: texto,
              bold: true,
              size: 17,
              font: 'Times New Roman',
              color: COLOR_AZUL_TEXTO,
            }),
          ],
        }),
      ],
    });
  }

  private bloqueObservacionEditable(titulo: string, contenido: string | undefined | null): Table {
    const val = contenido && contenido.trim() !== '' ? contenido : '—';

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: bordesCelda(),
              margins: MARGENES_CELDA,
              shading: { type: ShadingType.CLEAR, fill: COLOR_AZUL_FONDO },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: titulo,
                      bold: true,
                      size: 17,
                      font: 'Times New Roman',
                      color: COLOR_AZUL_TEXTO,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          height: { value: 500, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              borders: bordesCelda(),
              margins: MARGENES_CELDA,
              verticalAlign: VerticalAlign.TOP,
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({
                      text: val,
                      size: 20,
                      font: 'Times New Roman',
                      color: COLOR_TEXTO,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  }

  private async obtenerLogo(): Promise<ArrayBuffer | null> {
    try {
      return await firstValueFrom(
        this.http.get('assets/logo/logo.png', { responseType: 'arraybuffer' }),
      );
    } catch {
      return null;
    }
  }

  private tablaMembrete(logo: ArrayBuffer | null, formato: string, codigo: string): Table {
    const celdaLogo = new TableCell({
      rowSpan: 4,
      verticalAlign: VerticalAlign.CENTER,
      borders: bordesCelda(),
      width: { size: 15, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: logo
            ? [new ImageRun({ data: logo, transformation: { width: 55, height: 55 }, type: 'png' })]
            : [],
        }),
      ],
    });

    const celdaCodigo = new TableCell({
      rowSpan: 4,
      verticalAlign: VerticalAlign.CENTER,
      borders: bordesCelda(),
      width: { size: 15, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'CÓDIGO', bold: true, size: 13, color: COLOR_GRIS_TEXTO })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: codigo, bold: true, size: 17, color: COLOR_NEGRO })],
        }),
      ],
    });

    const celdaInfo = (texto: string, shading?: string, color = COLOR_NEGRO) =>
      new TableCell({
        borders: bordesCelda(),
        shading: shading ? { type: ShadingType.CLEAR, fill: shading } : undefined,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: texto, bold: true, size: 15, color })],
          }),
        ],
      });

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            celdaLogo,
            celdaInfo('INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO YAVIRAC'),
            celdaCodigo,
          ],
        }),
        new TableRow({
          children: [celdaInfo('MACROPROCESO 01 DOCENCIA', COLOR_AZUL_BANDA, COLOR_AZUL_TEXTO)],
        }),
        new TableRow({
          children: [
            celdaInfo(
              'PROCESO 01 SEGUIMIENTO, CONTROL Y EVALUACIÓN DEL PROCESO DOCENTE',
              COLOR_ROJO_BANDA,
              COLOR_ROJO_TEXTO,
            ),
          ],
        }),
        new TableRow({ children: [celdaInfo(formato)] }),
      ],
    });
  }

  private tituloSeccion(texto: string): Paragraph {
    return new Paragraph({
      spacing: { before: 160, after: 80 },
      border: {
        left: { style: BorderStyle.SINGLE, size: 24, color: '2563EB', space: 6 },
      },
      children: [new TextRun({ text: texto, bold: true, size: 20, color: COLOR_AZUL_TEXTO })],
    });
  }

  private subtitulo(texto: string): Paragraph {
    return new Paragraph({
      spacing: { before: 120, after: 40 },
      children: [new TextRun({ text: texto, bold: true, size: 18, color: COLOR_TEXTO })],
    });
  }

  private subtituloItalica(texto: string): Paragraph {
    return new Paragraph({
      spacing: { before: 100, after: 40 },
      children: [new TextRun({ text: texto, italics: true, bold: true, size: 16, color: COLOR_GRIS_TEXTO })],
    });
  }

  private tablaClaveValor(filas: string[][]): Table {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: filas.map(
        (fila) =>
          new TableRow({
            children: fila.map((texto, idx) => {
              const esEtiqueta = idx % 2 === 0;
              return new TableCell({
                borders: bordesCelda(),
                margins: MARGENES_CELDA,
                verticalAlign: VerticalAlign.CENTER,
                width: { size: esEtiqueta ? 20 : 30, type: WidthType.PERCENTAGE },
                shading: esEtiqueta ? { type: ShadingType.CLEAR, fill: COLOR_AZUL_FONDO } : undefined,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: texto,
                        bold: esEtiqueta,
                        size: 17,
                        color: esEtiqueta ? COLOR_AZUL_TEXTO : COLOR_TEXTO,
                      }),
                    ],
                  }),
                ],
              });
            }),
          }),
      ),
    });
  }

  private celdaTexto(texto: string, opts: { align: (typeof AlignmentType)[keyof typeof AlignmentType] }): TableCell {
    return new TableCell({
      borders: bordesCelda(),
      margins: MARGENES_CELDA,
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          alignment: opts.align,
          children: [new TextRun({ text: texto, size: 17, color: COLOR_TEXTO })],
        }),
      ],
    });
  }

  private celdaEncabezado(texto: string): TableCell {
    return new TableCell({
      borders: bordesCelda(),
      margins: MARGENES_CELDA,
      shading: { type: ShadingType.CLEAR, fill: COLOR_AZUL_FONDO },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: texto, bold: true, size: 15, color: COLOR_AZUL_TEXTO })],
        }),
      ],
    });
  }

  private tablaFirmas(docente: string, coordinador: string): Table {
    const fechaHoy = new Date().toLocaleDateString('es-EC');
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            this.celdaEncabezado(`Docente: ${docente}`),
            this.celdaEncabezado(`Coordinador: ${coordinador}`),
          ],
        }),
        new TableRow({
          height: { value: 1000, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              borders: bordesCelda(),
              children: [new Paragraph({ children: [] })],
            }),
            new TableCell({
              borders: bordesCelda(),
              children: [new Paragraph({ children: [] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            this.celdaTexto(`Fecha: ${fechaHoy}`, { align: AlignmentType.LEFT }),
            this.celdaTexto(`Fecha: ${fechaHoy}`, { align: AlignmentType.LEFT }),
          ],
        }),
      ],
    });
  }

  private tablaFirmasConFecha(docente: string, coordinador: string, fecha: string): Table {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            this.celdaEncabezado('DOCENTE:'),
            new TableCell({
              borders: bordesCelda(),
              margins: MARGENES_CELDA,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: docente, size: 17, bold: true, color: COLOR_TEXTO })],
                }),
              ],
            }),
            this.celdaEncabezado('COORDINADOR:'),
            new TableCell({
              borders: bordesCelda(),
              margins: MARGENES_CELDA,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: coordinador, size: 17, bold: true, color: COLOR_TEXTO })],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          height: { value: 1000, rule: HeightRule.ATLEAST },
          children: [
            this.celdaEncabezado('FIRMA:'),
            new TableCell({
              borders: bordesCelda(),
              children: [new Paragraph({ children: [] })],
            }),
            this.celdaEncabezado('FIRMA:'),
            new TableCell({
              borders: bordesCelda(),
              children: [new Paragraph({ children: [] })],
            }),
          ],
        }),
        new TableRow({
          children: [
            this.celdaEncabezado('FECHA:'),
            this.celdaTexto(fecha, { align: AlignmentType.LEFT }),
            this.celdaEncabezado('FECHA:'),
            this.celdaTexto(fecha, { align: AlignmentType.LEFT }),
          ],
        }),
      ],
    });
  }

  private espacio(): Paragraph {
    return new Paragraph({ text: '', spacing: { after: 80 } });
  }

  private async descargar(doc: Document, nombreBase: string): Promise<void> {
    const blob = await Packer.toBlob(doc);
    const nombreLimpio = nombreBase.replace(/[^\w\-]+/g, '_');
    saveAs(blob, `${nombreLimpio}.docx`);
  }
}