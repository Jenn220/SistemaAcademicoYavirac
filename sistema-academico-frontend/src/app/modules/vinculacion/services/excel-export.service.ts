import { Injectable, inject } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { InicioActividadesService } from './inicio-actividades.service';
import { CartaCompromisoService } from './carta-compromiso.service';
import { ControlAsistenciaService } from './control-asistencia.service';
import { RegistroAsistenciaTutorService } from './registro-asistencia-tutor.service';
import { PlanAprendizajeService } from './plan-aprendizaje.service';
import { CertificadoService } from './certificado.service';
import { InformeFinalService } from './informe-final.service';
import { firstValueFrom } from 'rxjs';

// ============================================
// ESTILOS — replican EXACTAMENTE los colores y fuentes
// encontrados en la plantilla oficial "PORTAFOLIO VINCULACIÓN"
// ============================================

function allBorders() {
  const thin = { style: 'thin', color: { rgb: '000000' } };
  return { top: thin, bottom: thin, left: thin, right: thin };
}

// Paleta institucional real (tomada de la plantilla original)
const COLOR_AZUL_INST = '0070C0';   // franja "INSTITUTO SUPERIOR TECNOLÓGICO..."
const COLOR_NARANJA_INST = 'ED7D31'; // franja "PROCESO 01 VINCULACIÓN"
const COLOR_GRIS_ENCABEZADO = 'D8D8D8'; // encabezados de tabla
const COLOR_AZUL_SECCION = '1F4E78';    // franjas de sección (jerarquía visual)
const COLOR_FILA_ALTERNA = 'F2F2F2';    // rayado cebra en tablas de datos
const COLOR_BLANCO = 'FFFFFF';

const ESTILO_HEADER_AZUL = {
  font: { bold: true, color: { rgb: COLOR_BLANCO }, sz: 10, name: 'Calibri' },
  fill: { fgColor: { rgb: COLOR_AZUL_INST } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: allBorders()
};

const ESTILO_HEADER_NARANJA = {
  font: { bold: true, color: { rgb: COLOR_BLANCO }, sz: 10, name: 'Calibri' },
  fill: { fgColor: { rgb: COLOR_NARANJA_INST } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: allBorders()
};

const ESTILO_HEADER_BLANCO = {
  font: { bold: true, color: { rgb: '000000' }, sz: 10, name: 'Calibri' },
  fill: { fgColor: { rgb: COLOR_BLANCO } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: allBorders()
};

const ESTILO_CODIGO_LABEL = {
  font: { bold: true, sz: 11, name: 'Calibri' },
  fill: { fgColor: { rgb: COLOR_BLANCO } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: allBorders()
};

const ESTILO_CODIGO_VALOR = {
  font: { sz: 7, name: 'Calibri' },
  fill: { fgColor: { rgb: COLOR_BLANCO } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: allBorders()
};

const ESTILO_TITULO_DOCUMENTO = {
  font: { bold: true, sz: 12, name: 'Calibri' },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
};

const ESTILO_SECCION = {
  font: { bold: true, sz: 10.5, name: 'Calibri', color: { rgb: COLOR_BLANCO } },
  fill: { fgColor: { rgb: COLOR_AZUL_SECCION } },
  alignment: { vertical: 'center', horizontal: 'left', indent: 1 },
  border: allBorders()
};

const ESTILO_FIELD_LABEL = {
  font: { bold: true, sz: 10, name: 'Calibri' },
  fill: { fgColor: { rgb: COLOR_BLANCO } },
  alignment: { vertical: 'center', horizontal: 'left' },
  border: allBorders()
};

const ESTILO_FIELD_VALUE = {
  font: { sz: 10, name: 'Calibri' },
  fill: { fgColor: { rgb: COLOR_BLANCO } },
  alignment: { vertical: 'center', horizontal: 'left', wrapText: true },
  border: allBorders()
};

const ESTILO_TEXTO_LEGAL = {
  font: { sz: 9, name: 'Arial Narrow' },
  alignment: { vertical: 'top', horizontal: 'center', wrapText: true },
  border: allBorders()
};

const ESTILO_HEADER_TABLA = {
  font: { bold: true, sz: 10, name: 'Calibri' },
  fill: { fgColor: { rgb: COLOR_GRIS_ENCABEZADO } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: allBorders()
};

const ESTILO_CELDA_TABLA = {
  font: { sz: 10, name: 'Calibri' },
  alignment: { vertical: 'center', wrapText: true },
  border: allBorders()
};

const ESTILO_CENTRADO = {
  font: { sz: 10, name: 'Calibri' },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: allBorders()
};

const ESTILO_TEXTO_NORMAL = {
  font: { sz: 10, name: 'Calibri' },
  alignment: { vertical: 'center', wrapText: true }
};

const ESTILO_FIRMA = {
  font: { sz: 10, name: 'Calibri' },
  alignment: { horizontal: 'center', vertical: 'top' },
  border: { top: { style: 'thin', color: { rgb: '000000' } } }
};

// ============================================
// TEXTO LEGAL FIJO (Art. 22 y Art. 23 — tal cual la plantilla original)
// ============================================
const TEXTO_ART_22 =
  'Art. 22.- Obligaciones de los estudiantes de prácticas y vinculación con la sociedad. -\n' +
  'a. Cumplir con las horas exigidas de prácticas pre profesionales o formación dual y vinculación con la sociedad, dentro del programa curricular de su carrera y la normativa del instituto.\n' +
  'b. Cumplir de forma eficiente, diligente y con calidez, las acciones encomendadas en el área y modalidad de práctica, y vinculación con la sociedad establecida.\n' +
  'c. Conservar una apropiada presentación personal, y de ser el caso utilizar uniforme o la vestimenta de acuerdo a las políticas internas de la entidad receptora o el ISTY.\n' +
  'd. Mantener absoluta reserva sobre toda información interna de la entidad receptora.\n' +
  'e. Demostrar responsabilidad, disciplina, ética y eficiencia durante el desarrollo de sus prácticas o vinculación con la sociedad.\n' +
  'f. Asistir puntualmente a las jornadas establecidas por la entidad receptoras o el ISTY.\n' +
  'g. Informar en un máximo de 72 horas al tutor académico y empresarial, cuando por enfermedad o fuerza mayor se vea impedido de asistir a cumplir con su jornada de prácticas o vinculación con la sociedad.\n' +
  'h. Cumplir con las disposiciones enmarcadas por el ISTY, y por la entidad receptora de lo concerniente a su práctica o vinculación con la sociedad.\n' +
  'i. Informar de forma escrita al tutor académico del instituto y de la entidad receptora sobre las novedades que se produzcan en el desempeño de sus tareas, a fin de establecer correctivos necesarios con el fin de ayudar el normal desarrollo de sus actividades.\n' +
  'j. Guardar las debidas consideraciones éticas y humanas con todo el personal en las entidades receptoras, tutores académicos, responsables y demás miembros relacionados del área.\n' +
  'k. Presentar al tutor académico, la documentación necesaria para el registro de sus horas cumplidas en actividades de prácticas o vinculación con la sociedad.\n' +
  'l. Permanecer en la entidad receptora el tiempo determinado según el cronograma elaborado entre la entidad receptora y el ISTY.\n' +
  'm. Entregar un informe escrito del proyecto donde se evidencia el trabajo ejecutado en las prácticas pre profesionales o formación dual y vinculación con la sociedad.\n' +
  'n. En caso de existir plazas disponibles para la realización de la vinculación con la sociedad el estudiante deberá aceptar dicha plaza; y,\n' +
  'o. Las demás obligaciones que se encuentren establecidas en los convenios individuales pertinentes.';

const TEXTO_ART_23 =
  'Art 23.- Prohibiciones a los estudiantes. -\n' +
  'a. Crear documentación o circunstancias diferentes a las prácticas o vinculación con la sociedad.\n' +
  'b. Disponer de los servicios, equipos y suministros de la entidad receptora para asuntos personales, salvo en casos de emergencia y previa autorización del responsable.\n' +
  'c. Asistir al lugar de desarrollo de las prácticas o vinculación con la sociedad, bajo influencia de bebidas alcohólicas y sustancias sicotrópicas.\n' +
  'd. Atender o aceptar visitas de tipo particular dentro de la entidad receptora.\n' +
  'e. Cambiar de turno o encargar a otra persona, la realización de su práctica o vinculación con la sociedad.\n' +
  'f. Abandonar las prácticas o vinculación con la sociedad, sin autorización del tutor académico y empresarial.\n' +
  'g. Promover o participar en actos de indisciplina que alteren el normal funcionamiento de la entidad receptora.\n' +
  'h. Cometer actos que alteren las buenas costumbres y que atenten contra la salud y contra la seguridad de la entidad receptora o el ISTY.\n' +
  'i. Abandonar las prácticas o vinculación con la sociedad sin justificación.\n' +
  'j. Incumplir con las tareas asignadas en el área o realizar prácticas ajenas a su función.\n' +
  'k. Sustraer bienes, divulgar o copiar información de la entidad receptora; y,\n' +
  'l. Las demás establecidas en las normativas vigentes.';

const TEXTO_CIERRE_ACTA =
  'El incumplimiento de lo establecido en esta Acta se aplicará el Art. 24 del Reglamento Interno de Prácticas preprofesionales, formación dual y vinculación con la sociedad del ISTY.\n\n' +
  'Una vez que he leído y comprendido las normas a seguir durante el desarrollo de las actividades, en mi calidad de participante, entendiendo que estas son para un beneficio tanto colectivo como individual y procura el bienestar de todos quienes asistimos a estos eventos, me comprometo a seguir dichas recomendaciones y evitar causar cualquier actividad que pusiere en peligro a mi persona como al grupo en general.\n' +
  'Una vez leído y entendido el contenido de la presente Acta, acepto las condiciones del mismo en favor de mi bienestar, para constancia de lo cual lo suscriben en el día';

const PARAMETROS_EVALUACION = [
  { key: 'puntualidad', label: 'Puntualidad (Cumple sus obligaciones en el tiempo y plazo convenido, sin retraso)' },
  { key: 'trabajo_autonomo', label: 'Trabajo autónomo' },
  { key: 'asistencia', label: 'Asistencia (Se encontraba presente en los días y horas acordadas)' },
  { key: 'etica_profesional', label: 'Ética profesional (Demuestra normas y valores que ayudan al desarrollo de las actividades profesionales)' },
  { key: 'cumple_tareas', label: 'Cumple a satisfacción sus tareas' },
  { key: 'actitud_proactiva', label: 'Su actitud es proactiva y facilita la tarea en equipo' },
  { key: 'coopera_permanentemente', label: 'Coopera de manera permanente y espontánea' },
  { key: 'respeto_autoridad', label: 'Demuestra respeto a la autoridad y compañeros' },
  { key: 'constancia_predisposicion', label: 'Constancia y predisposición para desempeñar la labor' },
  { key: 'responsabilidad_esmero', label: 'Cumple con responsabilidad, esmero y orden las planificadas' },
  { key: 'habilidad_practica', label: 'Habilidad para poner en práctica ideas propias o ajenas' }
];

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {
  private inicioService = inject(InicioActividadesService);
  private cartaService = inject(CartaCompromisoService);
  private asistenciaService = inject(ControlAsistenciaService);
  private tutorService = inject(RegistroAsistenciaTutorService);
  private planService = inject(PlanAprendizajeService);
  private certificadoService = inject(CertificadoService);
  private informeService = inject(InformeFinalService);

  private readonly NOMBRES_HOJAS: Record<string, string> = {
    'Inicio Act.': 'Inicio Act.',
    'C.C.': '1 C.C.',
    '1 C.C.': '1 C.C.',
    'C.A.': '2 C.A.',
    '2 C.A.': '2 C.A.',
    'R.A.T': '3 R.A.T',
    '3 R.A.T': '3 R.A.T',
    'P.A.': '4 P.A.',
    '4 P.A.': '4 P.A.',
    'Cert.': '7 Cert.',
    '7 Cert.': '7 Cert.',
    'Informe final': 'Informe final'
  };

  // El Certificado es el único documento que NO lleva el logo institucional
  // (es un formato distinto, sin la franja de cabecera con espacio reservado).
  private readonly LOGO_PATH = 'assets/images/logo-yavirac.png';
  private logoBytesCache: ArrayBuffer | null | undefined = undefined;

  // Cuántas columnas (A o A:B) reserva cada hoja para el logo — debe
  // coincidir con el merge 'A1:A4' / 'A1:B4' que hace cada construirHoja*.
  // El Certificado no aparece aquí a propósito: no lleva logo.
  private readonly COLUMNAS_LOGO_POR_HOJA: Record<string, 1 | 2> = {
    'Inicio Act.': 1,
    '1 C.C.': 2,
    '2 C.A.': 1,
    '3 R.A.T': 1,
    '4 P.A.': 2,
    'Informe final': 1
  };

  /**
   * Descarga el logo institucional una sola vez y lo cachea en memoria para
   * toda la vida del servicio. Si falla (archivo no existe, red, etc.) no
   * rompe la exportación: se sigue generando el Excel, solo que sin el logo
   * incrustado (queda la celda reservada en blanco, como hasta ahora).
   */
  private async obtenerLogoBytes(): Promise<ArrayBuffer | null> {
    if (this.logoBytesCache !== undefined) return this.logoBytesCache;
    try {
      const respuesta = await fetch(this.LOGO_PATH);
      if (!respuesta.ok) throw new Error(`No se pudo cargar ${this.LOGO_PATH} (${respuesta.status})`);
      this.logoBytesCache = await respuesta.arrayBuffer();
    } catch (err) {
      console.warn('⚠️ No se pudo cargar el logo institucional, se exportará sin él:', err);
      this.logoBytesCache = null;
    }
    return this.logoBytesCache;
  }

  // ============================================
  // EXPORTAR HOJA INDIVIDUAL
  // ============================================
  async exportarHojaIndividual(idVinculacion: number, tipoHoja: string, data: any): Promise<void> {
    let ws: XLSX.WorkSheet;
    let nombreArchivo = '';
    const hojaNormalizada = this.NOMBRES_HOJAS[tipoHoja] || tipoHoja;

    switch (hojaNormalizada) {
      case 'Inicio Act.':
        ws = this.construirHojaInicioActividades(data, idVinculacion);
        nombreArchivo = 'INICIO DE ACTIVIDADES DEL TUTOR';
        break;
      case '1 C.C.':
        ws = this.construirHojaCartaCompromiso(data);
        nombreArchivo = 'CARTA DE COMPROMISO';
        break;
      case '2 C.A.':
        ws = this.construirHojaControlAsistencia(data);
        nombreArchivo = 'CONTROL DE ASISTENCIA DEL ESTUDIANTE';
        break;
      case '3 R.A.T':
        ws = this.construirHojaRegistroTutor(data);
        nombreArchivo = 'REGISTRO DE ASISTENCIA DEL TUTOR';
        break;
      case '4 P.A.':
        ws = this.construirHojaPlanAprendizaje(data, idVinculacion);
        nombreArchivo = 'PLAN DE APRENDIZAJE Y SEGUIMIENTO';
        break;
      case '7 Cert.':
        ws = this.construirHojaCertificado(data);
        nombreArchivo = 'CERTIFICADO DE VINCULACIÓN';
        break;
      case 'Informe final':
        ws = this.construirHojaInformeFinal(data, idVinculacion);
        nombreArchivo = 'INFORME FINAL';
        break;
      default:
        console.warn('⚠️ Tipo de hoja no reconocido:', tipoHoja);
        return;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, hojaNormalizada);
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // El logo va en todas las hojas menos el Certificado (formato distinto,
    // sin franja de cabecera con espacio reservado para él).
    const columnasLogo = this.COLUMNAS_LOGO_POR_HOJA[hojaNormalizada];
    const hojasConLogo = columnasLogo ? [{ nombre: hojaNormalizada, columnas: columnasLogo }] : [];
    const logoBytes = hojasConLogo.length ? await this.obtenerLogoBytes() : null;
    const bufferFinal = logoBytes ? await this.incrustarLogos(wbout, logoBytes, hojasConLogo) : wbout;

    const blob = new Blob([bufferFinal], { type: 'application/octet-stream' });
    saveAs(blob, `${nombreArchivo}.xlsx`);
  }

  // ============================================
  // EXPORTAR EXCEL COMPLETO (7 HOJAS)
  // ============================================
  async exportarExcelCompleto(idVinculacion: number): Promise<void> {
    const wb = XLSX.utils.book_new();

    const [inicioData, cartaData, asistenciaData, tutorData, planData, certificadoData, informeData] =
      await Promise.all([
        firstValueFrom(this.inicioService.obtenerInicioActividades(idVinculacion)),
        firstValueFrom(this.cartaService.obtenerCartaCompromiso(idVinculacion)),
        firstValueFrom(this.asistenciaService.obtenerAsistencia(idVinculacion)),
        firstValueFrom(this.tutorService.obtenerReporte(idVinculacion)),
        firstValueFrom(this.planService.obtenerPlan(idVinculacion)),
        firstValueFrom(this.certificadoService.obtenerCertificado(idVinculacion)),
        firstValueFrom(this.informeService.obtenerInformeFinal(idVinculacion))
      ]);

    const hojas: Array<{ nombre: string; ws: XLSX.WorkSheet }> = [
      { nombre: 'Inicio Act.', ws: this.construirHojaInicioActividades(inicioData, idVinculacion) },
      { nombre: '1 C.C.', ws: this.construirHojaCartaCompromiso(cartaData) },
      { nombre: '2 C.A.', ws: this.construirHojaControlAsistencia(asistenciaData) },
      { nombre: '3 R.A.T', ws: this.construirHojaRegistroTutor(tutorData) },
      { nombre: '4 P.A.', ws: this.construirHojaPlanAprendizaje(planData, idVinculacion) },
      { nombre: '7 Cert.', ws: this.construirHojaCertificado(certificadoData) },
      { nombre: 'Informe final', ws: this.construirHojaInformeFinal(informeData, idVinculacion) }
    ];

    for (const hoja of hojas) {
      XLSX.utils.book_append_sheet(wb, hoja.ws, hoja.nombre);
    }

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // El logo va en todas las hojas menos el Certificado.
    const hojasConLogo = hojas
      .map(h => ({ nombre: h.nombre, columnas: this.COLUMNAS_LOGO_POR_HOJA[h.nombre] }))
      .filter((h): h is { nombre: string; columnas: 1 | 2 } => !!h.columnas);
    const logoBytes = await this.obtenerLogoBytes();
    const bufferFinal = logoBytes ? await this.incrustarLogos(wbout, logoBytes, hojasConLogo) : wbout;

    const blob = new Blob([bufferFinal], { type: 'application/octet-stream' });
    saveAs(blob, 'PORTAFOLIO VINCULACIÓN.xlsx');
  }

  // ============================================
  // HELPERS DE ESCRITURA Y FORMATEO
  // ============================================
  /**
   * xlsx-js-style (la edición community de SheetJS) no soporta incrustar
   * imágenes por API — es una limitación conocida de la librería. Este
   * método lo evita manipulando directamente el .xlsx ya generado: es un
   * ZIP con archivos XML adentro (formato OOXML), así que abrimos ese ZIP
   * con JSZip y le inyectamos a mano las piezas que Excel necesita para
   * mostrar una imagen:
   *   1. El archivo de la imagen en xl/media/
   *   2. Un "drawing" (xl/drawings/drawingN.xml) que dice dónde va anclada
   *   3. La relación del drawing hacia la imagen (drawingN.xml.rels)
   *   4. La relación de la hoja hacia su drawing (sheetN.xml.rels)
   *   5. La referencia <drawing/> dentro del XML de la hoja
   *   6. El tipo MIME del drawing registrado en [Content_Types].xml
   *
   * @param buffer        El .xlsx ya generado por XLSX.write(...).
   * @param logoBytes     Los bytes del logo (PNG).
   * @param hojasConLogo  Nombre de hoja (tal como se pasó a
   *                      XLSX.utils.book_append_sheet) + cuántas columnas
   *                      reserva esa hoja para el logo: 1 si solo es la
   *                      columna A (A1:A4) o 2 si es A:B (A1:B4).
   */
  private async incrustarLogos(buffer: ArrayBuffer, logoBytes: ArrayBuffer, hojasConLogo: { nombre: string; columnas: 1 | 2 }[]): Promise<ArrayBuffer> {
    if (!hojasConLogo.length) return buffer;

    const zip = await JSZip.loadAsync(buffer);

    const imagePath = 'xl/media/image_logo.png';
    zip.file(imagePath, logoBytes);

    let contentTypes = await zip.file('[Content_Types].xml')!.async('string');
    if (!contentTypes.includes('Extension="png"')) {
      contentTypes = contentTypes.replace('</Types>', '<Default Extension="png" ContentType="image/png"/></Types>');
    }

    // Mapea nombre de hoja -> r:id (workbook.xml) -> archivo sheetN.xml (workbook.xml.rels)
    const workbookXml = await zip.file('xl/workbook.xml')!.async('string');
    const sheetMatches = [...workbookXml.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="(rId\d+)"/g)];
    const relsXml = await zip.file('xl/_rels/workbook.xml.rels')!.async('string');
    const relMatches = [...relsXml.matchAll(/<Relationship[^>]*Id="(rId\d+)"[^>]*Target="(worksheets\/sheet\d+\.xml)"/g)];
    const ridAFile = new Map(relMatches.map(m => [m[1], m[2]]));
    const configPorHoja = new Map(hojasConLogo.map(h => [h.nombre, h.columnas]));

    let indiceDrawing = 1;
    for (const [, nombreHoja, rid] of sheetMatches) {
      const columnas = configPorHoja.get(nombreHoja);
      if (!columnas) continue;
      const archivoHoja = ridAFile.get(rid);
      if (!archivoHoja) continue;

      const sheetPath = `xl/${archivoHoja}`;
      const sheetFileName = archivoHoja.split('/')[1];
      const drawingName = `drawing${indiceDrawing}.xml`;
      const drawingPath = `xl/drawings/${drawingName}`;
      const drawingRelsPath = `xl/drawings/_rels/${drawingName}.rels`;
      const sheetRelsPath = `xl/worksheets/_rels/${sheetFileName}.rels`;

      // Ancla el logo desde la esquina superior de A1 hasta la esquina
      // inferior de la última columna reservada (B si columnas=2, A si
      // columnas=1) en la fila 4 — con un margen interno mínimo para que
      // no toque los bordes. SIN editAs="oneCell": eso le decía a Excel
      // que NO redimensionara la imagen según el ancla (solo la movía),
      // por eso antes se veía chica en vez de llenar el espacio. Con
      // twoCellAnchor "normal" (por defecto), Excel estira la imagen para
      // llenar exactamente el rectángulo entre "from" y "to".
      const colFin = columnas; // 1 columna reservada -> termina al inicio de la col B (índice 1); 2 -> al inicio de la C (índice 2)
      const drawingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
<xdr:twoCellAnchor>
<xdr:from><xdr:col>0</xdr:col><xdr:colOff>28575</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>28575</xdr:rowOff></xdr:from>
<xdr:to><xdr:col>${colFin}</xdr:col><xdr:colOff>-28575</xdr:colOff><xdr:row>4</xdr:row><xdr:rowOff>-28575</xdr:rowOff></xdr:to>
<xdr:pic>
<xdr:nvPicPr><xdr:cNvPr id="${indiceDrawing + 1}" name="LogoYavirac"/><xdr:cNvPicPr><a:picLocks noChangeAspect="0"/></xdr:cNvPicPr></xdr:nvPicPr>
<xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>
<xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr>
</xdr:pic>
<xdr:clientData/>
</xdr:twoCellAnchor>
</xdr:wsDr>`;

      zip.file(drawingPath, drawingXml);
      zip.file(drawingRelsPath, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image_logo.png"/>
</Relationships>`);

      let sheetXml = await zip.file(sheetPath)!.async('string');
      const drawingRelId = 'rIdLogoDrawing';
      if (sheetXml.includes('</worksheet>')) {
        sheetXml = sheetXml.replace(
          '</worksheet>',
          `<drawing xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="${drawingRelId}"/></worksheet>`
        );
      }
      zip.file(sheetPath, sheetXml);

      const sheetRelsFile = zip.file(sheetRelsPath);
      let sheetRelsXml = sheetRelsFile
        ? await sheetRelsFile.async('string')
        : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
      sheetRelsXml = sheetRelsXml.replace(
        '</Relationships>',
        `<Relationship Id="${drawingRelId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/${drawingName}"/></Relationships>`
      );
      zip.file(sheetRelsPath, sheetRelsXml);

      if (!contentTypes.includes(`/xl/drawings/${drawingName}`)) {
        contentTypes = contentTypes.replace(
          '</Types>',
          `<Override PartName="/xl/drawings/${drawingName}" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>`
        );
      }

      indiceDrawing++;
    }

    zip.file('[Content_Types].xml', contentTypes);
    return await zip.generateAsync({ type: 'arraybuffer' });
  }

  /**
   * Agrupa los registros de Control de Asistencia por descripción de
   * actividad, igual que hace la pantalla (actividadesAgrupadas): todas las
   * fechas que comparten la misma "actividad realizada" quedan juntas en un
   * solo grupo, en el orden en que aparecen por primera vez.
   */
  private agruparPorDescripcion(registros: any[]): { descripcion: string; detalle: any[] }[] {
    const grupos: { descripcion: string; detalle: any[] }[] = [];
    // Misma clave que procesarActividadesAgrupadas() en control-asistencia.component.ts:
    // trim().toLowerCase(), para que "Reunión" y "reunión" caigan en el mismo grupo.
    const mapa = new Map<string, { descripcion: string; detalle: any[] }>();
    (registros || []).forEach((item) => {
      const clave = (item.descripcion || '').trim().toLowerCase();
      let grupo = mapa.get(clave);
      if (!grupo) {
        grupo = { descripcion: item.descripcion || '', detalle: [] };
        mapa.set(clave, grupo);
        grupos.push(grupo);
      }
      grupo.detalle.push(item);
    });
    // Mismo orden que el frontend: cada grupo ordena sus fechas ascendente.
    grupos.forEach(g => g.detalle.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()));
    return grupos;
  }

  /**
   * Agrupa las actividades del Plan de Aprendizaje por texto de actividad,
   * exactamente igual que agruparPorSemanaActividad() en
   * plan-aprendizaje.component.ts: una fila por actividad única (no por
   * fecha), usando la fecha del primer registro y su resultado de
   * aprendizaje. Si el mismo texto de actividad tiene varias fechas, el
   * Word/Excel solo muestra la primera — tal como en el sistema.
   */
  private agruparPorSemanaActividad(actividades: any[]): any[] {
    const agrupadas: any[] = [];
    const mapa = new Map<string, any>();
    (actividades || []).forEach((item) => {
      if (!item.actividad || item.actividad.trim() === '') return;
      const clave = item.actividad.trim();
      if (!mapa.has(clave)) {
        const nuevoGrupo = {
          semana: `Semana ${agrupadas.length + 1}`,
          fecha: item.fecha,
          actividad: item.actividad,
          resultado_aprendizaje: item.resultado_aprendizaje,
          id: item.id
        };
        mapa.set(clave, nuevoGrupo);
        agrupadas.push(nuevoGrupo);
      }
    });
    return agrupadas;
  }

  private nuevaHoja(): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};
    ws['!merges'] = [];
    ws['!rows'] = [];
    ws['!views'] = [{ showGridLines: false }];
    return ws;
  }

  /** Fija la altura (en píxeles) de una fila puntual, para que el texto envuelto se lea completo. */
  private filaAltura(ws: XLSX.WorkSheet, fila: number, alturaPx: number): void {
    if (!ws['!rows']) ws['!rows'] = [];
    const rows = ws['!rows'] as any[];
    const idx = fila - 1;
    while (rows.length <= idx) rows.push({});
    rows[idx] = { hpx: alturaPx };
  }

  /** Fija la misma altura para un rango continuo de filas. */
  private filasAltura(ws: XLSX.WorkSheet, filaInicio: number, filaFin: number, alturaPx: number): void {
    for (let f = filaInicio; f <= filaFin; f++) this.filaAltura(ws, f, alturaPx);
  }

  /** Aplica rayado cebra a un estilo de celda de tabla según el índice de fila (0-based). */
  private filaCebra(base: any, indice: number): any {
    if (indice % 2 === 0) return base;
    return { ...base, fill: { fgColor: { rgb: COLOR_FILA_ALTERNA } } };
  }

  private celda(ws: XLSX.WorkSheet, addr: string, value: any, style?: any): void {
    const isNum = typeof value === 'number';
    ws[addr] = {
      t: isNum ? 'n' : 's',
      v: isNum ? value : (value ?? ''),
      ...(style ? { s: style } : {})
    };
  }

  private formula(ws: XLSX.WorkSheet, addr: string, f: string, style?: any): void {
    ws[addr] = { t: 'n', f, ...(style ? { s: style } : {}) };
  }

  private merge(ws: XLSX.WorkSheet, range: string, styleAplicaCompleto?: any): void {
    const decodedRange = XLSX.utils.decode_range(range);
    if (!ws['!merges']) ws['!merges'] = [];
    (ws['!merges'] as XLSX.Range[]).push(decodedRange);

    if (styleAplicaCompleto) {
      for (let R = decodedRange.s.r; R <= decodedRange.e.r; ++R) {
        for (let C = decodedRange.s.c; C <= decodedRange.e.c; ++C) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[addr]) {
            ws[addr] = { t: 's', v: '', s: styleAplicaCompleto };
          } else {
            ws[addr].s = styleAplicaCompleto;
          }
        }
      }
    }
  }

  private anchoColumnas(ws: XLSX.WorkSheet, widths: number[]): void {
    ws['!cols'] = widths.map(w => ({ wch: w }));
  }

  private actualizarRefHoja(ws: XLSX.WorkSheet, maxFila: number, maxColChar: string): void {
    ws['!ref'] = `A1:${maxColChar}${Math.max(maxFila, 1)}`;
  }

  private fmtFecha(fecha: any): string {
    if (!fecha) return '';
    const f = new Date(fecha);
    if (isNaN(f.getTime())) return String(fecha);
    return f.toLocaleDateString('es-EC');
  }

  private fmtHora(hora: any): string {
    if (!hora) return '';
    if (typeof hora === 'string') return hora.slice(0, 5);
    const f = new Date(hora);
    if (isNaN(f.getTime())) return String(hora);
    return f.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Lee "objetivos_editados_{idVinculacion}" de localStorage, tal como lo hace
   * la pantalla "Informe Final" del frontend cuando el usuario edita
   * manualmente los objetivos del proyecto antes de exportar.
   */
  private leerObjetivosLocalStorage(idVinculacion: number | undefined, fallback: any[]): any[] {
    if (!idVinculacion) return fallback;
    try {
      const key = `objetivos_editados_${idVinculacion}`;
      const guardado = localStorage.getItem(key);
      if (guardado) {
        const parseado = JSON.parse(guardado);
        if (Array.isArray(parseado) && parseado.length > 0) return parseado;
      }
    } catch (e) {
      console.warn('⚠️ No se pudieron leer objetivos de localStorage:', e);
    }
    return fallback;
  }

  /**
   * Cabecera institucional de 4 filas (logo simulado + franja azul + blanca +
   * naranja + blanca) y bloque "CÓDIGO" a la derecha — igual en las 7 hojas.
   */
  private bloqueCabeceraInstitucional(
    ws: XLSX.WorkSheet,
    opts: {
      colTituloInicio: string;
      colTituloFin: string;
      colCodigoLabel: string;
      colCodigoValor: string;
      colCodigoValorFin?: string; // permite que el valor del código ocupe más de una columna
      filaInicio: number;
      formato: string;
      codigo: string;
    }
  ): void {
    const { colTituloInicio, colTituloFin, colCodigoLabel, colCodigoValor, colCodigoValorFin, filaInicio, formato, codigo } = opts;

    this.celda(ws, `${colTituloInicio}${filaInicio}`, 'INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO YAVIRAC', ESTILO_HEADER_AZUL);
    this.merge(ws, `${colTituloInicio}${filaInicio}:${colTituloFin}${filaInicio}`, ESTILO_HEADER_AZUL);

    this.celda(ws, `${colTituloInicio}${filaInicio + 1}`, 'MACROPROCESO 04 VINCULACIÓN', ESTILO_HEADER_BLANCO);
    this.merge(ws, `${colTituloInicio}${filaInicio + 1}:${colTituloFin}${filaInicio + 1}`, ESTILO_HEADER_BLANCO);

    this.celda(ws, `${colTituloInicio}${filaInicio + 2}`, 'PROCESO 01 VINCULACIÓN', ESTILO_HEADER_NARANJA);
    this.merge(ws, `${colTituloInicio}${filaInicio + 2}:${colTituloFin}${filaInicio + 2}`, ESTILO_HEADER_NARANJA);

    this.celda(ws, `${colTituloInicio}${filaInicio + 3}`, formato, ESTILO_HEADER_BLANCO);
    this.merge(ws, `${colTituloInicio}${filaInicio + 3}:${colTituloFin}${filaInicio + 3}`, ESTILO_HEADER_BLANCO);

    this.celda(ws, `${colCodigoLabel}${filaInicio}`, 'CÓDIGO', ESTILO_CODIGO_LABEL);
    this.merge(ws, `${colCodigoLabel}${filaInicio}:${colCodigoLabel}${filaInicio + 3}`, ESTILO_CODIGO_LABEL);

    this.celda(ws, `${colCodigoValor}${filaInicio}`, codigo, ESTILO_CODIGO_VALOR);
    this.merge(ws, `${colCodigoValor}${filaInicio}:${colCodigoValorFin || colCodigoValor}${filaInicio + 3}`, ESTILO_CODIGO_VALOR);

    // Altura generosa para que la franja institucional se lea con holgura
    this.filaAltura(ws, filaInicio, 24);
    this.filasAltura(ws, filaInicio + 1, filaInicio + 3, 20);
  }

  // ============================================
  // 1. HOJA: INICIO DE ACTIVIDADES DEL TUTOR (Formato 05)
  //    Fuente real: InicioActividadesResponse
  //    { coordinador, tutor_nombre, tutor_cedula, proyecto_nombre,
  //      fecha_inicio, fecha_fin, carrera, entidad_beneficiaria,
  //      tutor_entidad, descripcion_actividades }
  // ============================================
  private construirHojaInicioActividades(data: any, idVinculacion?: number): XLSX.WorkSheet {
    const ws = this.nuevaHoja();
    this.anchoColumnas(ws, [17.86, 15.86, 13.86, 13, 13, 13, 13, 13, 13, 13]);

    const d = data || {};

    // Columna A reservada para el logo institucional.
    this.celda(ws, 'A1', '', ESTILO_HEADER_BLANCO);
    this.merge(ws, 'A1:A4', ESTILO_HEADER_BLANCO);

    this.bloqueCabeceraInstitucional(ws, {
      colTituloInicio: 'B', colTituloFin: 'H',
      colCodigoLabel: 'I', colCodigoValor: 'J',
      filaInicio: 1,
      formato: 'FORMATO 05 INICIO DE ACTIVIDADES DEL TUTOR',
      codigo: 'DS-040105'
    });

    this.celda(ws, 'A7', 'INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO "YAVIRAC"', ESTILO_TITULO_DOCUMENTO);
    this.merge(ws, 'A7:I7', ESTILO_TITULO_DOCUMENTO);

    // "A:" -> Coordinador de Carrera
    this.celda(ws, 'A10', 'A:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'A10:B10', ESTILO_FIELD_LABEL);
    this.celda(ws, 'C10', d.coordinador || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'C10:E10', ESTILO_FIELD_VALUE);
    this.celda(ws, 'C11', 'Coordinador de Carrera', { font: { sz: 10, italic: true, name: 'Calibri' } });

    // "De:" -> Tutor del Proyecto (docente)
    this.celda(ws, 'A13', 'De:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'A13:B13', ESTILO_FIELD_LABEL);
    this.celda(ws, 'C13', d.tutor_nombre || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'C13:E13', ESTILO_FIELD_VALUE);
    this.celda(ws, 'C14', 'Tutor del Proyecto', { font: { sz: 10, italic: true, name: 'Calibri' } });

    this.celda(ws, 'A16', 'Asunto:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'A16:B16', ESTILO_FIELD_LABEL);
    this.celda(ws, 'C16', 'Informe de inicio de actividades del Proyecto:', ESTILO_FIELD_VALUE);
    this.merge(ws, 'C16:E16', ESTILO_FIELD_VALUE);
    this.celda(ws, 'B17', d.proyecto_nombre || '', { font: { bold: true, sz: 10, name: 'Calibri' }, alignment: { horizontal: 'center', wrapText: true } });
    this.merge(ws, 'B17:I18', { font: { bold: true, sz: 10, name: 'Calibri' }, alignment: { horizontal: 'center', wrapText: true } });

    // "Fecha:" = fecha de inicio del proyecto (única fecha disponible en la respuesta)
    this.celda(ws, 'A20', 'Fecha:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'A20:B20', ESTILO_FIELD_LABEL);
    this.celda(ws, 'C20', this.fmtFecha(d.fecha_inicio), ESTILO_FIELD_VALUE);

    this.celda(ws, 'A24', 'Yo,', ESTILO_CELDA_TABLA);
    this.merge(ws, 'A24:B24', ESTILO_CELDA_TABLA);
    this.celda(ws, 'C24', d.tutor_nombre || '', { ...ESTILO_CELDA_TABLA, alignment: { horizontal: 'center' } });
    this.merge(ws, 'C24:E24', { ...ESTILO_CELDA_TABLA, alignment: { horizontal: 'center' } });
    this.celda(ws, 'F24', 'con C.I. Nro.', ESTILO_CELDA_TABLA);
    this.celda(ws, 'G24', d.tutor_cedula || '', ESTILO_CELDA_TABLA);
    this.celda(ws, 'H24', 'tengo a bien', ESTILO_CELDA_TABLA);

    this.celda(ws, 'A25', 'informar que siguiendo con el cronograma de actividades establecido en el proyecto de vinculación:', ESTILO_TEXTO_NORMAL);
    this.merge(ws, 'A25:H25', ESTILO_TEXTO_NORMAL);
    this.filaAltura(ws, 25, 24);
    this.celda(ws, 'A26', d.proyecto_nombre || '', { font: { bold: true, sz: 10, name: 'Calibri' }, alignment: { horizontal: 'center', wrapText: true } });
    this.merge(ws, 'A26:I27', { font: { bold: true, sz: 10, name: 'Calibri' }, alignment: { horizontal: 'center', wrapText: true } });

    this.celda(ws, 'A28', 'Informo que el día de hoy', ESTILO_TEXTO_NORMAL);
    this.merge(ws, 'A28:C28', ESTILO_TEXTO_NORMAL);
    this.celda(ws, 'D28', this.fmtFecha(d.fecha_inicio), { font: { bold: true, sz: 10, name: 'Calibri' } });
    this.celda(ws, 'E28', 'del año en curso, se procedió a dar inicio con el desarrollo del mismo.', ESTILO_TEXTO_NORMAL);
    this.merge(ws, 'E28:I28', ESTILO_TEXTO_NORMAL);
    this.filaAltura(ws, 28, 24);

    this.celda(ws, 'B30', 'Explicar cómo se dio el inicio de las actividades y anexar fotografías.', { font: { italic: true, sz: 9, name: 'Calibri' } });

    this.celda(ws, 'A31', d.descripcion_actividades || '', ESTILO_CELDA_TABLA);
    this.merge(ws, 'A31:I38', ESTILO_CELDA_TABLA);
    this.filasAltura(ws, 31, 38, 30);

    this.celda(ws, 'A39', 'Anexo 1: Capturas de pantalla referentes a las actividades de Vinculación con los grupos estudiantiles.', ESTILO_SECCION);
    this.merge(ws, 'A39:H39', ESTILO_SECCION);

    this.celda(ws, 'A41', 'Figura 1: Primera reunión de inducción vinculación.', { font: { italic: true, sz: 9, name: 'Calibri' } });
    this.merge(ws, 'A41:D41', { font: { italic: true, sz: 9, name: 'Calibri' } });
    this.celda(ws, 'F41', 'Figura 2: Socialización de actividades.', { font: { italic: true, sz: 9, name: 'Calibri' } });
    this.merge(ws, 'F41:H41', { font: { italic: true, sz: 9, name: 'Calibri' } });

    // Espacios reservados para las imágenes (celdas combinadas grandes, sin imagen embebida)
    this.merge(ws, 'A42:I50', ESTILO_CELDA_TABLA);
    this.filasAltura(ws, 42, 50, 24);

    this.celda(ws, 'A51', 'Figura 3: Explicación del alcance del proyecto.', { font: { italic: true, sz: 9, name: 'Calibri' } });
    this.celda(ws, 'F51', 'Figura 4: Primer día de actividades en la Fundación', { font: { italic: true, sz: 9, name: 'Calibri' } });

    this.celda(ws, 'B62', 'Atentamente,', ESTILO_TEXTO_NORMAL);
    this.celda(ws, 'B68', d.tutor_nombre || '', ESTILO_FIRMA);
    this.merge(ws, 'B68:D68', ESTILO_FIRMA);
    this.celda(ws, 'B69', 'TUTOR DEL PROYECTO', { font: { bold: true, sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.merge(ws, 'B69:D69', { font: { bold: true, sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });

    this.actualizarRefHoja(ws, 70, 'J');
    return ws;
  }

  // ============================================
  // 2. HOJA: CARTA DE COMPROMISO DEL ESTUDIANTE (Formato 04)
  //    Fuente real: CartaCompromiso
  //    { titulo, instituto, estudiante, cedula, carrera, nivel,
  //      entidad_beneficiaria, docente_tutor }
  //    (no trae fecha propia -> se usa la fecha del día de exportación)
  // ============================================
  private construirHojaCartaCompromiso(data: any): XLSX.WorkSheet {
    const ws = this.nuevaHoja();
    this.anchoColumnas(ws, [7.86, 12.86, 17.86, 22.86, 18.86, 12.86, 15.86, 5.86, 13.86]);

    const d = data || {};

    // Columna A:B reservada para el logo institucional — se incrusta
    // aparte, en incrustarLogos(), después de generar el .xlsx.
    this.celda(ws, 'A1', '', ESTILO_HEADER_BLANCO);
    this.merge(ws, 'A1:B4', ESTILO_HEADER_BLANCO);

    this.bloqueCabeceraInstitucional(ws, {
      colTituloInicio: 'C', colTituloFin: 'F',
      colCodigoLabel: 'G', colCodigoValor: 'H', colCodigoValorFin: 'I',
      filaInicio: 1,
      formato: 'FORMATO 04 CARTA DE COMPROMISO DEL ESTUDIANTE',
      codigo: 'DS-040104'
    });

    this.celda(ws, 'B6', d.instituto || 'INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO "YAVIRAC"', ESTILO_TITULO_DOCUMENTO);
    this.merge(ws, 'B6:I6', ESTILO_TITULO_DOCUMENTO);

    this.celda(ws, 'B8', d.titulo || 'ACTA COMPROMISO DE PARTICIPACIÓN EN VINCULACIÓN CON LA COMUNIDAD', { font: { bold: true, sz: 11, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.merge(ws, 'B8:I8', { font: { bold: true, sz: 11, name: 'Calibri' }, alignment: { horizontal: 'center' } });

    // Bloque "Yo, ... me comprometo": cada línea de texto corrido se combina
    // sobre un rango ancho (en vez de desbordar sobre celdas vacías) para que
    // se lea de corrido y no se monte sobre las filas siguientes.
    const ESTILO_TEXTO_CENTRADO = { ...ESTILO_TEXTO_NORMAL, alignment: { ...ESTILO_TEXTO_NORMAL.alignment, horizontal: 'center' }, border: allBorders() };

    this.celda(ws, 'A10', 'Yo,', ESTILO_TEXTO_CENTRADO);
    this.merge(ws, 'A10:B10', ESTILO_TEXTO_CENTRADO);
    this.celda(ws, 'C10', d.estudiante || '', { ...ESTILO_CELDA_TABLA, alignment: { horizontal: 'center' } });
    this.merge(ws, 'C10:D10', { ...ESTILO_CELDA_TABLA, alignment: { horizontal: 'center' } });
    this.celda(ws, 'E10', 'con C.I.', { ...ESTILO_TEXTO_NORMAL, border: allBorders() });
    this.celda(ws, 'F10', d.cedula || '', ESTILO_CELDA_TABLA);
    this.celda(ws, 'G10', 'estudiante del Instituto Superior', ESTILO_TEXTO_CENTRADO);
    this.merge(ws, 'G10:I10', ESTILO_TEXTO_CENTRADO);

    this.celda(ws, 'A11', 'Tecnológico de Turismo y Patrimonio "YAVIRAC" de la Carrera de', ESTILO_TEXTO_CENTRADO);
    this.merge(ws, 'A11:D11', ESTILO_TEXTO_CENTRADO);
    this.celda(ws, 'E11', d.carrera || '', ESTILO_CELDA_TABLA);
    this.merge(ws, 'E11:G11', ESTILO_CELDA_TABLA);
    this.celda(ws, 'H11', d.nivel || '', ESTILO_CELDA_TABLA);
    this.merge(ws, 'H11:I11', ESTILO_CELDA_TABLA);

    this.celda(ws, 'A12', 'quien va a realizar la vinculación con la sociedad en la', ESTILO_TEXTO_CENTRADO);
    this.merge(ws, 'A12:D12', ESTILO_TEXTO_CENTRADO);
    this.celda(ws, 'E12', d.entidad_beneficiaria || '', ESTILO_CELDA_TABLA);
    this.merge(ws, 'E12:I12', ESTILO_CELDA_TABLA);

    this.celda(ws, 'A13', 'me comprometo a seguir las siguientes recomendaciones:', { ...ESTILO_TEXTO_NORMAL, alignment: { ...ESTILO_TEXTO_NORMAL.alignment, horizontal: 'center' } });
    this.merge(ws, 'A13:I13', { ...ESTILO_TEXTO_NORMAL, alignment: { ...ESTILO_TEXTO_NORMAL.alignment, horizontal: 'center' } });
    this.merge(ws, 'A14:I14', { border: allBorders() });

    this.celda(ws, 'A15', TEXTO_ART_22, ESTILO_TEXTO_LEGAL);
    this.merge(ws, 'A15:I22', ESTILO_TEXTO_LEGAL);
    this.filasAltura(ws, 15, 22, 42);

    this.celda(ws, 'A23', TEXTO_ART_23, ESTILO_TEXTO_LEGAL);
    this.merge(ws, 'A23:I32', ESTILO_TEXTO_LEGAL);
    this.filasAltura(ws, 23, 32, 32);

    this.celda(ws, 'A33', TEXTO_CIERRE_ACTA, ESTILO_TEXTO_LEGAL);
    this.merge(ws, 'A33:I37', ESTILO_TEXTO_LEGAL);
    this.filasAltura(ws, 33, 37, 46);

    this.celda(ws, 'B38', this.fmtFecha(new Date()), { ...ESTILO_CENTRADO, font: { bold: true, sz: 10, name: 'Calibri' } });
    this.merge(ws, 'B38:D38', { ...ESTILO_CENTRADO, font: { bold: true, sz: 10, name: 'Calibri' } });

    this.celda(ws, 'B39', 'Estudiante', ESTILO_HEADER_TABLA);
    this.merge(ws, 'B39:C40', ESTILO_HEADER_TABLA);
    this.celda(ws, 'D39', 'Cédula de Identidad', ESTILO_HEADER_TABLA);
    this.merge(ws, 'D39:E40', ESTILO_HEADER_TABLA);
    this.celda(ws, 'F39', 'Nivel', ESTILO_HEADER_TABLA);
    this.merge(ws, 'F39:G40', ESTILO_HEADER_TABLA);
    this.celda(ws, 'H39', 'Firma', ESTILO_HEADER_TABLA);
    this.merge(ws, 'H39:I40', ESTILO_HEADER_TABLA);

    this.celda(ws, 'B41', d.estudiante || '', ESTILO_CELDA_TABLA);
    this.merge(ws, 'B41:C42', ESTILO_CELDA_TABLA);
    this.celda(ws, 'D41', d.cedula || '', ESTILO_CELDA_TABLA);
    this.merge(ws, 'D41:E42', ESTILO_CELDA_TABLA);
    this.celda(ws, 'F41', d.nivel || '', ESTILO_CELDA_TABLA);
    this.merge(ws, 'F41:G42', ESTILO_CELDA_TABLA);
    this.merge(ws, 'H41:I42', ESTILO_CELDA_TABLA);

    this.celda(ws, 'B44', 'En constancia:', ESTILO_TEXTO_CENTRADO);

    this.celda(ws, 'B48', d.docente_tutor || '', ESTILO_FIRMA);
    this.merge(ws, 'B48:C48', ESTILO_FIRMA);
    this.celda(ws, 'B49', 'DOCENTE TUTOR', { font: { bold: true, sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.merge(ws, 'B49:C49', { font: { bold: true, sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });

    this.actualizarRefHoja(ws, 51, 'I');
    return ws;
  }

  // ============================================
  // 3. HOJA: CONTROL DE ASISTENCIA DEL ESTUDIANTE (Formato 06)
  //    Fuente real: AsistenciaEstudianteResponse
  //    { cabecera: { carrera, entidad_beneficiaria, estudiante,
  //        nombre_proyecto, docente_tutor, tutor_entidad_receptora,
  //        periodo_academico },
  //      actividades: [{ id, fecha, hora_entrada, hora_salida,
  //        total_horas, descripcion }],
  //      totales: { total_horas, observaciones } }
  // ============================================
  private construirHojaControlAsistencia(data: any): XLSX.WorkSheet {
    const ws = this.nuevaHoja();
    this.anchoColumnas(ws, [14, 12, 12, 11, 10, 32, 10, 10, 12, 8]);

    const cab = data?.cabecera || {};
    const registros: any[] = data?.actividades || [];
    const totales = data?.totales || {};

    // Columna A reservada para el logo institucional.
    this.celda(ws, 'A1', '', ESTILO_HEADER_BLANCO);
    this.merge(ws, 'A1:A4', ESTILO_HEADER_BLANCO);

    this.bloqueCabeceraInstitucional(ws, {
      colTituloInicio: 'B', colTituloFin: 'H',
      colCodigoLabel: 'I', colCodigoValor: 'J',
      filaInicio: 1,
      formato: 'FORMATO 06 CONTROL DE ASISTENCIA DEL ESTUDIANTE',
      codigo: 'DS-040106'
    });

    this.celda(ws, 'A6', 'INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO "YAVIRAC"', ESTILO_TITULO_DOCUMENTO);
    this.merge(ws, 'A6:J6', ESTILO_TITULO_DOCUMENTO);
    this.celda(ws, 'A7', 'Dirección: García Moreno S-435 y Ambato', { font: { sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.merge(ws, 'A7:J7');
    this.celda(ws, 'A8', 'Quito - Ecuador', { font: { sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.merge(ws, 'A8:J8');

    this.celda(ws, 'A10', 'CONTROL DE ASISTENCIA Y SEGUIMIENTO DE VINCULACIÓN CON LA COMUNIDAD', { font: { bold: true, sz: 11, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.merge(ws, 'A10:J10', { font: { bold: true, sz: 11, name: 'Calibri' }, alignment: { horizontal: 'center' } });

    this.celda(ws, 'A12', 'CARRERA:', ESTILO_FIELD_LABEL);
    this.celda(ws, 'B12', cab.carrera || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'B12:D12', ESTILO_FIELD_VALUE);
    this.celda(ws, 'E12', 'ENTIDAD BENEFICIARIA:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'E12:F12', ESTILO_FIELD_LABEL);
    this.celda(ws, 'G12', cab.entidad_beneficiaria || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'G12:J12', ESTILO_FIELD_VALUE);

    this.celda(ws, 'A13', 'ESTUDIANTE:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'A13:A15', ESTILO_FIELD_LABEL);
    this.celda(ws, 'B13', cab.estudiante || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'B13:D15', ESTILO_FIELD_VALUE);
    this.celda(ws, 'E13', 'NOMBRE DEL PROYECTO:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'E13:F13', ESTILO_FIELD_LABEL);
    this.celda(ws, 'G13', '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'G13:J13', ESTILO_FIELD_VALUE);
    this.celda(ws, 'E14', cab.nombre_proyecto || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'E14:J15', ESTILO_FIELD_VALUE);

    this.celda(ws, 'A16', 'DOCENTE TUTOR:', ESTILO_FIELD_LABEL);
    this.celda(ws, 'E16', 'TUTOR ENTIDAD RECEPTORA:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'E16:G16', ESTILO_FIELD_LABEL);
    this.celda(ws, 'H16', 'PERIODO ACADÉMICO:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'H16:I16', ESTILO_FIELD_LABEL);
    this.celda(ws, 'A17', cab.docente_tutor || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'A17:D18', ESTILO_FIELD_VALUE);
    this.celda(ws, 'E17', cab.tutor_entidad_receptora || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'E17:G18', ESTILO_FIELD_VALUE);
    this.celda(ws, 'H17', cab.periodo_academico || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'H17:J18', ESTILO_FIELD_VALUE);

    const filaHeader = 19;
    this.celda(ws, `A${filaHeader}`, 'FECHA', ESTILO_HEADER_TABLA);
    this.celda(ws, `B${filaHeader}`, 'HORA DE ENTRADA', ESTILO_HEADER_TABLA);
    this.celda(ws, `C${filaHeader}`, 'HORA DE SALIDA', ESTILO_HEADER_TABLA);
    this.celda(ws, `D${filaHeader}`, 'TOTAL HORAS', ESTILO_HEADER_TABLA);
    this.celda(ws, `E${filaHeader}`, 'ACTIVIDAD REALIZADA', ESTILO_HEADER_TABLA);
    this.merge(ws, `E${filaHeader}:J${filaHeader}`, ESTILO_HEADER_TABLA);

    let fila = filaHeader + 1;
    const gruposActividad = this.agruparPorDescripcion(registros);
    gruposActividad.forEach((grupo, gi) => {
      const estCentrado = this.filaCebra(ESTILO_CENTRADO, gi);
      const estCelda = this.filaCebra(ESTILO_CELDA_TABLA, gi);
      const filaInicioGrupo = fila;
      grupo.detalle.forEach((reg: any) => {
        this.celda(ws, `A${fila}`, this.fmtFecha(reg.fecha), estCentrado);
        this.celda(ws, `B${fila}`, this.fmtHora(reg.hora_entrada), estCentrado);
        this.celda(ws, `C${fila}`, this.fmtHora(reg.hora_salida), estCentrado);
        this.celda(ws, `D${fila}`, reg.total_horas ?? '', estCentrado);
        this.filaAltura(ws, fila, 26);
        fila++;
      });
      // Igual que en el sistema: cuando varias fechas comparten la misma
      // actividad realizada, esa celda se combina en un solo bloque que
      // abarca todas esas filas (rowspan), en vez de repetir el texto.
      const filaFinGrupo = fila - 1;
      this.celda(ws, `E${filaInicioGrupo}`, grupo.descripcion || '', estCelda);
      this.merge(ws, `E${filaInicioGrupo}:J${filaFinGrupo}`, estCelda);
    });

    // Total de horas acumulado (dato ya calculado por el backend), justo debajo de la tabla
    this.celda(ws, `D${fila}`, 'TOTAL HORAS:', ESTILO_FIELD_LABEL);
    this.celda(ws, `E${fila}`, totales.total_horas ?? 0, { font: { bold: true }, border: allBorders(), alignment: { horizontal: 'center' } });

    this.celda(ws, `A${fila + 2}`, 'OBSERVACIONES:', ESTILO_FIELD_LABEL);
    this.merge(ws, `A${fila + 2}:B${fila + 2}`, ESTILO_FIELD_LABEL);
    this.celda(ws, `C${fila + 2}`, totales.observaciones || 'Ninguna', ESTILO_FIELD_VALUE);
    this.merge(ws, `C${fila + 2}:J${fila + 2}`, ESTILO_FIELD_VALUE);

    const filaFirmas = fila + 4;
    this.celda(ws, `D${filaFirmas}`, 'ESTUDIANTE', ESTILO_HEADER_TABLA);
    this.merge(ws, `D${filaFirmas}:G${filaFirmas}`, ESTILO_HEADER_TABLA);
    this.celda(ws, `H${filaFirmas}`, 'DOCENTE TUTOR', ESTILO_HEADER_TABLA);
    this.merge(ws, `H${filaFirmas}:J${filaFirmas}`, ESTILO_HEADER_TABLA);

    this.celda(ws, `D${filaFirmas + 6}`, cab.estudiante || '', ESTILO_FIRMA);
    this.merge(ws, `D${filaFirmas + 6}:G${filaFirmas + 6}`, ESTILO_FIRMA);
    this.celda(ws, `H${filaFirmas + 6}`, cab.docente_tutor || '', ESTILO_FIRMA);
    this.merge(ws, `H${filaFirmas + 6}:J${filaFirmas + 6}`, ESTILO_FIRMA);

    this.actualizarRefHoja(ws, filaFirmas + 7, 'J');
    return ws;
  }

  // ============================================
  // 4. HOJA: REGISTRO DE ASISTENCIA DEL TUTOR (Formato 07)
  //    Fuente real: AsistenciaTutorResponse
  //    { cabecera: { carrera, institucion, docente_tutor, periodo_academico },
  //      actividades: [{ id, fecha, hora_entrada, hora_salida,
  //        total_horas, actividad_realizada }],
  //      totales: { suma_total_horas, observaciones, coordinador_carrera } }
  // ============================================
  private construirHojaRegistroTutor(data: any): XLSX.WorkSheet {
    const ws = this.nuevaHoja();
    this.anchoColumnas(ws, [14.86, 13.86, 9, 11.86, 30.86, 8.86, 12.86, 9]);

    const cab = data?.cabecera || {};
    const visitas: any[] = data?.actividades || [];
    const totales = data?.totales || {};

    // Columna A reservada para el logo institucional.
    this.celda(ws, 'A1', '', ESTILO_HEADER_BLANCO);
    this.merge(ws, 'A1:A4', ESTILO_HEADER_BLANCO);

    this.celda(ws, 'B1', 'INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO YAVIRAC', ESTILO_HEADER_AZUL);
    this.merge(ws, 'B1:F1', ESTILO_HEADER_AZUL);
    this.celda(ws, 'B2', 'MACROPROCESO 04 VINCULACIÓN', ESTILO_HEADER_BLANCO);
    this.merge(ws, 'B2:F2', ESTILO_HEADER_BLANCO);
    this.celda(ws, 'B3', 'PROCESO 01 VINCULACIÓN', ESTILO_HEADER_NARANJA);
    this.merge(ws, 'B3:F3', ESTILO_HEADER_NARANJA);
    this.celda(ws, 'B4', 'FORMATO 07 REGISTRO DE ASISTENCIA DEL TUTOR', ESTILO_HEADER_BLANCO);
    this.merge(ws, 'B4:F4', ESTILO_HEADER_BLANCO);
    this.celda(ws, 'G1', 'CÓDIGO: DS-040107', ESTILO_CODIGO_LABEL);
    this.merge(ws, 'G1:H4', ESTILO_CODIGO_LABEL);
    this.filaAltura(ws, 1, 24);
    this.filasAltura(ws, 2, 4, 20);

    // Columna A reservada como margen (el logo, si se pega a mano, iría aquí arriba)
    this.celda(ws, 'A5', 'INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO "YAVIRAC"', ESTILO_TITULO_DOCUMENTO);
    this.merge(ws, 'A5:H5', ESTILO_TITULO_DOCUMENTO);
    this.celda(ws, 'A6', 'Dirección: García Moreno S-435 y Ambato', { font: { sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.merge(ws, 'A6:H6');
    this.celda(ws, 'A7', 'Quito - Ecuador', { font: { sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.merge(ws, 'A7:H7');

    this.celda(ws, 'A9', 'Carrera:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'A9:D9', ESTILO_FIELD_LABEL);
    this.celda(ws, 'E9', 'Institución:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'E9:G9', ESTILO_FIELD_LABEL);
    this.celda(ws, 'A10', cab.carrera || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'A10:D11', ESTILO_FIELD_VALUE);
    this.celda(ws, 'E10', cab.institucion || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'E10:G11', ESTILO_FIELD_VALUE);

    this.celda(ws, 'A12', 'Docente Tutor:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'A12:D12', ESTILO_FIELD_LABEL);
    this.celda(ws, 'E12', 'Periodo Académico:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'E12:G12', ESTILO_FIELD_LABEL);
    this.celda(ws, 'A13', cab.docente_tutor || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'A13:D13', ESTILO_FIELD_VALUE);
    this.celda(ws, 'E13', cab.periodo_academico || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'E13:G13', ESTILO_FIELD_VALUE);

    const filaHeader = 14;
    this.celda(ws, `A${filaHeader}`, 'FECHA', ESTILO_HEADER_TABLA);
    this.celda(ws, `B${filaHeader}`, 'HORA DE ENTRADA', ESTILO_HEADER_TABLA);
    this.celda(ws, `C${filaHeader}`, 'HORA DE SALIDA', ESTILO_HEADER_TABLA);
    this.celda(ws, `D${filaHeader}`, 'TOTAL HORAS', ESTILO_HEADER_TABLA);
    this.celda(ws, `E${filaHeader}`, 'ACTIVIDAD REALIZADA', ESTILO_HEADER_TABLA);
    this.merge(ws, `E${filaHeader}:G${filaHeader}`, ESTILO_HEADER_TABLA);

    let fila = filaHeader + 1;
    visitas.forEach((v, i) => {
      const estCentrado = this.filaCebra(ESTILO_CENTRADO, i);
      const estCelda = this.filaCebra(ESTILO_CELDA_TABLA, i);
      this.celda(ws, `A${fila}`, this.fmtFecha(v.fecha), estCentrado);
      this.celda(ws, `B${fila}`, this.fmtHora(v.hora_entrada), estCentrado);
      this.celda(ws, `C${fila}`, this.fmtHora(v.hora_salida), estCentrado);
      this.celda(ws, `D${fila}`, v.total_horas ?? '', estCentrado);
      this.celda(ws, `E${fila}`, v.actividad_realizada || '', estCelda);
      this.merge(ws, `E${fila}:G${fila}`, estCelda);
      this.filaAltura(ws, fila, 26);
      fila++;
    });

    this.celda(ws, `C${fila}`, 'TOTAL HORAS', ESTILO_FIELD_LABEL);
    this.celda(ws, `D${fila}`, totales.suma_total_horas ?? 0, { font: { bold: true }, border: allBorders(), alignment: { horizontal: 'center' } });

    this.celda(ws, `A${fila + 2}`, `Observaciones: ${totales.observaciones || 'Ninguna'}`, { ...ESTILO_TEXTO_NORMAL, alignment: { ...ESTILO_TEXTO_NORMAL.alignment, horizontal: 'center' } });
    this.merge(ws, `A${fila + 2}:G${fila + 2}`, { ...ESTILO_TEXTO_NORMAL, alignment: { ...ESTILO_TEXTO_NORMAL.alignment, horizontal: 'center' } });
    this.filaAltura(ws, fila + 2, 48);

    // Espacio en blanco reservado antes de la firma (igual que en la plantilla)
    this.merge(ws, `A${fila + 3}:C${fila + 8}`, { border: allBorders() });

    this.celda(ws, `A${fila + 9}`, totales.coordinador_carrera || '', ESTILO_FIRMA);
    this.merge(ws, `A${fila + 9}:C${fila + 9}`, ESTILO_FIRMA);
    this.celda(ws, `A${fila + 10}`, 'COORDINADOR DE CARRERA', { font: { bold: true, sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.merge(ws, `A${fila + 10}:C${fila + 10}`, { font: { bold: true, sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });

    this.actualizarRefHoja(ws, fila + 11, 'H');
    return ws;
  }

  // ============================================
  // 5. HOJA: PLAN DE APRENDIZAJE Y SEGUIMIENTO (Formato 08)
  //    Fuente real: PlanAprendizaje
  //    { cabecera: { fundacion, nivel, estudiante, cedula,
  //        ciclo_academico, asignatura_1, asignatura_2, inicia,
  //        finaliza, docente_tutor, titulo_proyecto },
  //      informe_actividades: [{ id, fecha, actividad,
  //        resultado_aprendizaje }],
  //      reflexion_estudiante }
  //
  //    NOTA: la tabla "SECCIONES DEL PROYECTO / Avance" (Título, Antecedentes,
  //    Marco Teórico, etc.) NO existe en la respuesta del backend — es un
  //    checklist fijo de la plantilla, se mantiene tal cual (no editable
  //    desde datos reales) salvo que el proyecto lo guarde en localStorage.
  // ============================================
  private construirHojaPlanAprendizaje(data: any, idVinculacion?: number): XLSX.WorkSheet {
    const ws = this.nuevaHoja();
    this.anchoColumnas(ws, [8.14, 14.86, 9.86, 9, 9, 9, 9, 9, 9, 15.86, 11.86, 10.86, 14.86]);

    const cab = data?.cabecera || {};
    // Igual que en el sistema (agruparPorSemanaActividad): una fila por
    // actividad única, no por fecha — si varias fechas comparten el mismo
    // texto de actividad, solo se muestra la primera fecha y su resultado.
    const semanas: any[] = this.agruparPorSemanaActividad(data?.informe_actividades || []);
    const reflexion = data?.reflexion_estudiante || '';

    this.bloqueCabeceraInstitucional(ws, {
      colTituloInicio: 'C', colTituloFin: 'J',
      colCodigoLabel: 'K', colCodigoValor: 'L',
      filaInicio: 1,
      formato: 'FORMATO 08 PLAN DE APRENDIZAJE Y SEGUIMIENTO',
      codigo: 'DS-040108'
    });

    // Columna A:B reservada para el logo institucional.
    this.celda(ws, 'A1', '', ESTILO_HEADER_BLANCO);
    this.merge(ws, 'A1:B4', ESTILO_HEADER_BLANCO);

    this.celda(ws, 'B6', 'FUNDACIÓN :', ESTILO_FIELD_LABEL);
    this.celda(ws, 'C6', cab.fundacion || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'C6:F6', ESTILO_FIELD_VALUE);
    this.celda(ws, 'G6', 'NIVEL:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'G6:I6', ESTILO_FIELD_LABEL);
    this.celda(ws, 'J6', cab.nivel || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'J6:L6', ESTILO_FIELD_VALUE);

    this.celda(ws, 'B7', 'ESTUDIANTE:', ESTILO_FIELD_LABEL);
    this.celda(ws, 'C7', cab.estudiante || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'C7:F7', ESTILO_FIELD_VALUE);
    this.celda(ws, 'G7', 'CÉDULA:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'G7:I7', ESTILO_FIELD_LABEL);
    this.celda(ws, 'J7', cab.cedula || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'J7:L7', ESTILO_FIELD_VALUE);

    this.celda(ws, 'B8', 'ASIGNATURA 1', ESTILO_FIELD_LABEL);
    this.celda(ws, 'C8', cab.asignatura_1 || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'C8:F8', ESTILO_FIELD_VALUE);
    this.celda(ws, 'G8', 'CICLO ACADÉMICO:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'G8:I8', ESTILO_FIELD_LABEL);
    this.celda(ws, 'J8', cab.ciclo_academico || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'J8:L8', ESTILO_FIELD_VALUE);

    this.celda(ws, 'B9', 'ASIGNATURA 2', ESTILO_FIELD_LABEL);
    this.celda(ws, 'C9', cab.asignatura_2 || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'C9:F9', ESTILO_FIELD_VALUE);
    this.celda(ws, 'G9', 'INICIA:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'G9:I9', ESTILO_FIELD_LABEL);
    this.celda(ws, 'J9', cab.inicia || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'J9:L9', ESTILO_FIELD_VALUE);

    this.celda(ws, 'B10', 'DOCENTE TUTOR:', ESTILO_FIELD_LABEL);
    this.celda(ws, 'C10', cab.docente_tutor || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'C10:F10', ESTILO_FIELD_VALUE);
    this.celda(ws, 'G10', 'FINALIZA:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'G10:I10', ESTILO_FIELD_LABEL);
    this.celda(ws, 'J10', cab.finaliza || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'J10:L10', ESTILO_FIELD_VALUE);

    this.celda(ws, 'A12', 'INFORME DE LA ACTIVIDADES', ESTILO_SECCION);
    this.merge(ws, 'A12:L12', ESTILO_SECCION);

    this.celda(ws, 'A13', 'SEMANA', ESTILO_HEADER_TABLA);
    this.celda(ws, 'B13', 'FECHA', ESTILO_HEADER_TABLA);
    this.celda(ws, 'C13', 'ACTIVIDADES', ESTILO_HEADER_TABLA);
    this.merge(ws, 'C13:I13', ESTILO_HEADER_TABLA);
    this.celda(ws, 'J13', 'RESULTADOS DEL APRENDIZAJE', ESTILO_HEADER_TABLA);
    this.merge(ws, 'J13:L13', ESTILO_HEADER_TABLA);

    let fila = 14;
    semanas.forEach((s, i) => {
      const estCentrado = this.filaCebra(ESTILO_CENTRADO, i);
      const estCelda = this.filaCebra(ESTILO_CELDA_TABLA, i);
      this.celda(ws, `A${fila}`, s.semana, estCentrado);
      this.celda(ws, `B${fila}`, this.fmtFecha(s.fecha), estCentrado);
      this.celda(ws, `C${fila}`, s.actividad || '', estCelda);
      this.merge(ws, `C${fila}:I${fila}`, estCelda);
      this.celda(ws, `J${fila}`, s.resultado_aprendizaje || '', estCelda);
      this.merge(ws, `J${fila}:L${fila}`, estCelda);
      this.filaAltura(ws, fila, 28);
      fila++;
    });

    const filaReflexion = fila + 1;
    this.celda(ws, `B${filaReflexion}`, 'Reflexión sobre el aprendizaje alcanzado de las actividades realizadas :', ESTILO_FIELD_LABEL);
    this.merge(ws, `B${filaReflexion}:G${filaReflexion}`, ESTILO_FIELD_LABEL);
    this.celda(ws, `H${filaReflexion}`, reflexion, ESTILO_FIELD_VALUE);
    this.merge(ws, `H${filaReflexion}:L${filaReflexion}`, ESTILO_FIELD_VALUE);

    const filaTablaSecciones = filaReflexion + 2;
    this.celda(ws, `B${filaTablaSecciones}`, 'TEMA', ESTILO_HEADER_TABLA);
    this.merge(ws, `B${filaTablaSecciones}:D${filaTablaSecciones}`, ESTILO_HEADER_TABLA);
    this.celda(ws, `E${filaTablaSecciones}`, 'SECCIONES DEL PROYECTO', ESTILO_HEADER_TABLA);
    this.merge(ws, `E${filaTablaSecciones}:G${filaTablaSecciones}`, ESTILO_HEADER_TABLA);
    this.celda(ws, `H${filaTablaSecciones}`, 'Avance', ESTILO_HEADER_TABLA);
    this.merge(ws, `H${filaTablaSecciones}:I${filaTablaSecciones}`, ESTILO_HEADER_TABLA);

    // Checklist de secciones fijo (no viene del backend); se guarda/lee de
    // localStorage por si el docente lo personalizó desde la pantalla.
    const seccionesDefault = [
      { nombre: '1. Título del Proyecto (10%)', avance: 0.1 },
      { nombre: '2. Antecedentes (10%)', avance: 0.1 },
      { nombre: '3. Marco Teórico (10%)', avance: 0.1 },
      { nombre: '4. Metodología (10%)', avance: 0.1 },
      { nombre: '5. Resultados (10%)', avance: 0.1 },
      { nombre: '6. Conclusiones y recomendaciones (10%)', avance: 0.1 },
      { nombre: '7. Referencias bibliográficas (10%)', avance: 0.1 },
      { nombre: '8. Anexos (10%)', avance: 0.1 },
      { nombre: '9. Entrega de proyecto final (20%)', avance: 0.2 }
    ];
    let listaSecciones = seccionesDefault;
    if (idVinculacion) {
      try {
        const guardado = localStorage.getItem(`secciones_avance_${idVinculacion}`);
        if (guardado) {
          const parseado = JSON.parse(guardado);
          if (Array.isArray(parseado) && parseado.length > 0) listaSecciones = parseado;
        }
      } catch (e) {
        console.warn('⚠️ No se pudieron leer secciones de avance de localStorage:', e);
      }
    }

    const filaPrimeraSeccion = filaTablaSecciones + 1;
    this.celda(ws, `B${filaPrimeraSeccion}`, cab.titulo_proyecto || '', ESTILO_CELDA_TABLA);
    this.merge(ws, `B${filaPrimeraSeccion}:D${filaPrimeraSeccion + Math.max(listaSecciones.length - 1, 0)}`, ESTILO_CELDA_TABLA);

    let filaSeccion = filaPrimeraSeccion;
    listaSecciones.forEach((s: any) => {
      this.celda(ws, `E${filaSeccion}`, s.nombre, ESTILO_CELDA_TABLA);
      this.merge(ws, `E${filaSeccion}:G${filaSeccion}`, ESTILO_CELDA_TABLA);
      this.celda(ws, `H${filaSeccion}`, s.avance, { ...ESTILO_CENTRADO, numFmt: '0%' });
      this.merge(ws, `H${filaSeccion}:I${filaSeccion}`, { ...ESTILO_CENTRADO, numFmt: '0%' });
      filaSeccion++;
    });

    this.celda(ws, `H${filaSeccion}`, listaSecciones.reduce((acc: number, s: any) => acc + (s.avance || 0), 0), { font: { bold: true }, alignment: { horizontal: 'center' }, border: allBorders(), numFmt: '0%' });
    this.merge(ws, `H${filaSeccion}:I${filaSeccion}`, { font: { bold: true }, alignment: { horizontal: 'center' }, border: allBorders(), numFmt: '0%' });

    this.actualizarRefHoja(ws, filaSeccion + 2, 'L');
    return ws;
  }

  // ============================================
  // 6. HOJA: CERTIFICADO DE VINCULACIÓN CON LA COMUNIDAD (Formato 10)
  //    Fuente real: Certificado
  //    { fecha_emision, estudiante, cedula, carrera, proyecto,
  //      fecha_inicio, fecha_fin, total_horas, institucion, representante }
  //
  //    IMPORTANTE: el backend ya arma "fecha_emision" como
  //    "Quito, 13 de agosto de 2025" (string listo) — no se debe re-formatear.
  // ============================================
  private construirHojaCertificado(data: any): XLSX.WorkSheet {
    const ws = this.nuevaHoja();
    this.anchoColumnas(ws, [16.86, 14.86, 18.86, 16.86, 20.86, 16.86, 9, 9]);

    const d = data || {};
    const ESTILO_TEXTO_CENTRADO = { ...ESTILO_TEXTO_NORMAL, alignment: { ...ESTILO_TEXTO_NORMAL.alignment, horizontal: 'center' }, border: allBorders() };

    this.merge(ws, 'A1:H1', { border: allBorders() });

    this.celda(ws, 'A2', 'CERTIFICADO DE VINCULACIÓN CON LA COMUNIDAD', { font: { bold: true, sz: 14, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.merge(ws, 'A2:H2');

    this.merge(ws, 'A3:H3', { border: allBorders() });

    // fecha_emision ya viene formateada como "Quito, ..." desde el backend
    this.merge(ws, 'A4:F4', { border: allBorders() });
    this.celda(ws, 'G4', d.fecha_emision || '', { font: { sz: 11, name: 'Calibri' }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: allBorders() });
    this.merge(ws, 'G4:H4', { font: { sz: 11, name: 'Calibri' }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: allBorders() });
    this.filaAltura(ws, 4, 36);

    this.merge(ws, 'A5:H6', { border: allBorders() });

    this.celda(ws, 'A7', 'Por medio de la presente dejo constancia que el/la señor(ita)', ESTILO_TEXTO_CENTRADO);
    this.merge(ws, 'A7:D7', ESTILO_TEXTO_CENTRADO);
    this.celda(ws, 'E7', d.estudiante || '', { ...ESTILO_CELDA_TABLA, alignment: { horizontal: 'center' } });
    this.merge(ws, 'E7:H7', { ...ESTILO_CELDA_TABLA, alignment: { horizontal: 'center' } });
    this.filaAltura(ws, 7, 26);

    this.celda(ws, 'A8', 'con C.I.:', ESTILO_TEXTO_CENTRADO);
    this.merge(ws, 'A8:B8', ESTILO_TEXTO_CENTRADO);
    this.celda(ws, 'C8', d.cedula || '', { ...ESTILO_CELDA_TABLA, alignment: { horizontal: 'center' } });
    this.merge(ws, 'C8:D8', { ...ESTILO_CELDA_TABLA, alignment: { horizontal: 'center' } });
    this.celda(ws, 'E8', 'estudiante de la carrera de', ESTILO_TEXTO_CENTRADO);
    this.merge(ws, 'E8:F8', ESTILO_TEXTO_CENTRADO);
    this.celda(ws, 'G8', d.carrera || '', { ...ESTILO_CELDA_TABLA, alignment: { horizontal: 'center' } });
    this.merge(ws, 'G8:H8', { ...ESTILO_CELDA_TABLA, alignment: { horizontal: 'center' } });
    this.filaAltura(ws, 8, 26);

    this.celda(ws, 'A9', 'del Instituto Superior Tecnológico de Turismo y Patrimonio "YAVIRAC"', ESTILO_TEXTO_CENTRADO);
    this.merge(ws, 'A9:H9', ESTILO_TEXTO_CENTRADO);
    this.filaAltura(ws, 9, 28);

    this.celda(ws, 'A10', 'desempeñó las actividades y tareas establecidas en la planificación del proyecto:', ESTILO_TEXTO_CENTRADO);
    this.merge(ws, 'A10:H10', ESTILO_TEXTO_CENTRADO);
    this.filaAltura(ws, 10, 40);

    this.merge(ws, 'A11:H11', { border: allBorders() });

    this.celda(ws, 'A12', d.proyecto || '', { font: { bold: true, sz: 11, name: 'Calibri' }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true } });
    this.merge(ws, 'A12:H13', { font: { bold: true, sz: 11, name: 'Calibri' }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true } });
    this.filasAltura(ws, 12, 13, 24);

    this.merge(ws, 'A14:H14', { border: allBorders() });

    this.celda(ws, 'A15', 'propuesto para esta comunidad, desde el', ESTILO_TEXTO_CENTRADO);
    this.merge(ws, 'A15:D15', ESTILO_TEXTO_CENTRADO);
    this.celda(ws, 'E15', d.fecha_inicio || '', { ...ESTILO_CELDA_TABLA, alignment: { horizontal: 'center' } });
    this.celda(ws, 'F15', 'hasta el', ESTILO_TEXTO_CENTRADO);
    this.merge(ws, 'F15:G15', ESTILO_TEXTO_CENTRADO);
    this.celda(ws, 'H15', d.fecha_fin || '', { ...ESTILO_CELDA_TABLA, alignment: { horizontal: 'center' } });

    this.celda(ws, 'A16', `acumulando un total de ${d.total_horas ?? 0} horas de vinculación social en ${d.institucion || 'la entidad receptora'}, demostrando en`, ESTILO_TEXTO_CENTRADO);
    this.merge(ws, 'A16:H16', ESTILO_TEXTO_CENTRADO);

    this.celda(ws, 'A17', 'todo momento responsabilidad, capacidad y entusiasmo en el desarrollo de las labores encomendadas.', ESTILO_TEXTO_CENTRADO);
    this.merge(ws, 'A17:H17', ESTILO_TEXTO_CENTRADO);
    this.filasAltura(ws, 15, 17, 28);

    this.celda(ws, 'B19', 'Atentamente,', ESTILO_TEXTO_NORMAL);

    this.merge(ws, 'B20:D23', { border: allBorders() });

    this.celda(ws, 'B24', d.representante || '', { font: { sz: 10, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.merge(ws, 'B24:D24', { font: { sz: 10, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.celda(ws, 'B25', 'Coordinador de Vinculación', { font: { bold: true, sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.merge(ws, 'B25:D25', { font: { bold: true, sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.celda(ws, 'B26', 'ISTY "YAVIRAC"', { font: { sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.merge(ws, 'B26:D26', { font: { sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });

    this.actualizarRefHoja(ws, 28, 'H');
    return ws;
  }

  // ============================================
  // 7. HOJA: INFORME FINAL DEL PROYECTO (Formato 09)
  //    Fuente real: InformeFinalResponse
  //    { datos_generales: {...}, resumen_actividades: [...],
  //      total_horas_cumplidas, objetivos_proyecto: [{objetivo,
  //      actividades, avance, resultados}] (avance ya viene como
  //      string "100%"), reflexion_estudiante,
  //      evaluacion_final: { nota_final, nota_letras, observaciones,
  //      coordinador, parametros: {...} } }
  // ============================================
  private construirHojaInformeFinal(data: any, idVinculacion?: number): XLSX.WorkSheet {
    const objetivosBackend = data?.objetivos_proyecto || [];
    const objetivos = this.leerObjetivosLocalStorage(idVinculacion, objetivosBackend);

    const datos = data?.datos_generales || {};
    const evaluacion = data?.evaluacion_final || data?.evaluacion || {};
    const parametros = evaluacion?.parametros || {};
    const actividades: any[] = data?.resumen_actividades || [];

    const ws = this.nuevaHoja();
    this.anchoColumnas(ws, [16.86, 14.86, 30.86, 28.29, 15.43, 11.57, 14.86]);

    // Columna A reservada para el logo institucional — se incrusta aparte,
    // en incrustarLogos(), después de generar el .xlsx.
    this.celda(ws, 'A1', '', ESTILO_HEADER_BLANCO);
    this.merge(ws, 'A1:A4', ESTILO_HEADER_BLANCO);

    this.bloqueCabeceraInstitucional(ws, {
      colTituloInicio: 'B', colTituloFin: 'D',
      colCodigoLabel: 'E', colCodigoValor: 'F', colCodigoValorFin: 'G',
      filaInicio: 1,
      formato: 'FORMATO 09 INFORME FINAL DEL PROYECTO',
      codigo: 'DS-040109'
    });

    this.celda(ws, 'A7', 'INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO "YAVIRAC"', ESTILO_TITULO_DOCUMENTO);
    this.merge(ws, 'A7:G7', ESTILO_TITULO_DOCUMENTO);
    this.celda(ws, 'A9', 'Informe final de actividades de vinculación con la comunidad', { font: { bold: true, sz: 11, name: 'Calibri' }, alignment: { horizontal: 'center' } });
    this.merge(ws, 'A9:G9', { font: { bold: true, sz: 11, name: 'Calibri' }, alignment: { horizontal: 'center' } });

    // 1. Datos generales
    this.celda(ws, 'A11', '1. DATOS GENERALES DEL PROYECTO', ESTILO_SECCION);
    this.merge(ws, 'A11:G11', ESTILO_SECCION);

    this.celda(ws, 'A13', 'Carrera:', ESTILO_FIELD_LABEL);
    this.celda(ws, 'B13', datos.carrera || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'B13:D13', ESTILO_FIELD_VALUE);
    this.celda(ws, 'E13', 'Fecha del informe:', ESTILO_FIELD_LABEL);
    this.celda(ws, 'F13', datos.fecha_informe || '', { ...ESTILO_FIELD_VALUE, font: { sz: 12, name: 'Calibri', bold: true } });
    this.merge(ws, 'F13:G13', { ...ESTILO_FIELD_VALUE, font: { sz: 12, name: 'Calibri', bold: true } });
    this.filaAltura(ws, 13, 22);

    this.celda(ws, 'A14', 'Estudiante:', ESTILO_FIELD_LABEL);
    this.celda(ws, 'B14', datos.estudiante || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'B14:D14', ESTILO_FIELD_VALUE);
    this.celda(ws, 'E14', 'Cédula C.C.:', ESTILO_FIELD_LABEL);
    this.celda(ws, 'F14', datos.cedula || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'F14:G14', ESTILO_FIELD_VALUE);

    this.celda(ws, 'A15', 'E-mail:', ESTILO_FIELD_LABEL);
    this.celda(ws, 'B15', datos.email || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'B15:D15', ESTILO_FIELD_VALUE);
    this.celda(ws, 'E15', 'Teléfono:', ESTILO_FIELD_LABEL);
    this.celda(ws, 'F15', datos.telefono || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'F15:G15', ESTILO_FIELD_VALUE);

    this.celda(ws, 'A16', 'Nombre del Proyecto:', ESTILO_FIELD_LABEL);
    this.celda(ws, 'A17', datos.nombre_proyecto || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'A17:C19', ESTILO_FIELD_VALUE);
    // El bloque de fechas se combina verticalmente (filas 17-19) para quedar
    // centrado junto al nombre del proyecto, que ocupa esas mismas 3 filas.
    this.celda(ws, 'D17', 'FECHA INICIO', ESTILO_FIELD_LABEL);
    this.merge(ws, 'D17:D19', ESTILO_FIELD_LABEL);
    this.celda(ws, 'E17', datos.fecha_inicio || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'E17:E19', ESTILO_FIELD_VALUE);
    this.celda(ws, 'F17', 'FECHA FINAL', ESTILO_FIELD_LABEL);
    this.merge(ws, 'F17:F19', ESTILO_FIELD_LABEL);
    this.celda(ws, 'G17', datos.fecha_final || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'G17:G19', ESTILO_FIELD_VALUE);

    this.celda(ws, 'A20', 'Nombre de la entidad beneficiaria de vinculación:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'A20:D20', ESTILO_FIELD_LABEL);
    this.celda(ws, 'E20', 'Teléfono:', ESTILO_FIELD_LABEL);
    this.celda(ws, 'F20', datos.telefono_entidad || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'F20:G20', ESTILO_FIELD_VALUE);
    this.celda(ws, 'A21', datos.entidad_beneficiaria || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'A21:D21', ESTILO_FIELD_VALUE);

    this.celda(ws, 'A22', 'Dirección:', ESTILO_FIELD_LABEL);
    this.merge(ws, 'A22:D22', ESTILO_FIELD_LABEL);
    this.celda(ws, 'E22', 'E-mail:', ESTILO_FIELD_LABEL);
    this.celda(ws, 'F22', datos.email_entidad || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'F22:G22', ESTILO_FIELD_VALUE);
    this.celda(ws, 'A23', datos.direccion_entidad || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'A23:D23', ESTILO_FIELD_VALUE);

    const ESTILO_FIELD_LABEL_CENTRADO = { ...ESTILO_FIELD_LABEL, alignment: { ...ESTILO_FIELD_LABEL.alignment, horizontal: 'center' } };
    this.celda(ws, 'A24', 'Tutor entidad vinculación:', ESTILO_FIELD_LABEL_CENTRADO);
    this.merge(ws, 'A24:B24', ESTILO_FIELD_LABEL_CENTRADO);
    this.celda(ws, 'C24', datos.tutor_entidad || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'C24:G24', ESTILO_FIELD_VALUE);
    this.celda(ws, 'A25', 'Docente Tutor:', ESTILO_FIELD_LABEL_CENTRADO);
    this.merge(ws, 'A25:B25', ESTILO_FIELD_LABEL_CENTRADO);
    this.celda(ws, 'C25', datos.docente_tutor || '', ESTILO_FIELD_VALUE);
    this.merge(ws, 'C25:G25', ESTILO_FIELD_VALUE);

    // 2. Resumen de actividades (AGRUPADAS)
this.celda(ws, 'A28', '2.      RESUMEN DE ACTIVIDADES REALIZADAS', ESTILO_SECCION);
this.merge(ws, 'A28:G28', ESTILO_SECCION);

this.celda(ws, 'A29', 'Nro.', ESTILO_HEADER_TABLA);
this.celda(ws, 'B29', 'Fecha', ESTILO_HEADER_TABLA);
this.celda(ws, 'C29', 'Actividades', ESTILO_HEADER_TABLA);
this.merge(ws, 'C29:D29', ESTILO_HEADER_TABLA);
this.celda(ws, 'E29', 'Horas cumplidas', ESTILO_HEADER_TABLA);
this.celda(ws, 'F29', 'Observaciones', ESTILO_HEADER_TABLA);
this.merge(ws, 'F29:G29', ESTILO_HEADER_TABLA);

// ✅ AGRUPAR ACTIVIDADES POR DESCRIPCIÓN (igual que en Control de Asistencia)
const actividadesOriginales: any[] = data?.resumen_actividades || [];
const mapaActividades = new Map<string, any>();

actividadesOriginales.forEach((act: any) => {
  const clave = (act.actividades || '').trim().toLowerCase();
  if (!mapaActividades.has(clave)) {
    mapaActividades.set(clave, {
      actividades: act.actividades,
      fechas: [act.fecha],
      horas: act.horas_cumplidas || 0,
      observaciones: act.observaciones || 'Sin observaciones'
    });
  } else {
    const grupo = mapaActividades.get(clave)!;
    grupo.fechas.push(act.fecha);
    grupo.horas += (act.horas_cumplidas || 0);
  }
});

const actividadesAgrupadas = Array.from(mapaActividades.values()).map((grupo) => {
  const fechasOrdenadas = grupo.fechas.sort((a: string, b: string) => 
    new Date(a).getTime() - new Date(b).getTime()
  );
  
  const fechaInicio = this.fmtFecha(fechasOrdenadas[0]);
  const fechaFin = this.fmtFecha(fechasOrdenadas[fechasOrdenadas.length - 1]);
  
  let fechaTexto = fechaInicio;
  if (fechasOrdenadas.length > 1) {
    fechaTexto = `${fechaInicio} al ${fechaFin} (${fechasOrdenadas.length} días)`;
  }
  
  return {
    fecha: fechaTexto,
    actividades: grupo.actividades,
    horas: grupo.horas,
    observaciones: grupo.observaciones
  };
});

const filaHeaderAct = 29;
if (actividadesAgrupadas.length === 0) {
  const fila = filaHeaderAct + 1;
  this.celda(ws, `A${fila}`, 'No hay actividades registradas', ESTILO_CELDA_TABLA);
  this.merge(ws, `A${fila}:G${fila}`, ESTILO_CELDA_TABLA);
} else {
  actividadesAgrupadas.forEach((grupo, i) => {
    const fila = filaHeaderAct + 1 + i;
    const estCentrado = this.filaCebra(ESTILO_CENTRADO, i);
    const estCelda = this.filaCebra(ESTILO_CELDA_TABLA, i);
    this.celda(ws, `A${fila}`, i + 1, estCentrado);
    this.celda(ws, `B${fila}`, grupo.fecha, estCelda);
    this.celda(ws, `C${fila}`, grupo.actividades || '', estCelda);
    this.merge(ws, `C${fila}:D${fila}`, estCelda);
    this.celda(ws, `E${fila}`, grupo.horas || 0, estCentrado);
    this.celda(ws, `F${fila}`, grupo.observaciones || 'Ninguna', estCelda);
    this.merge(ws, `F${fila}:G${fila}`, estCelda);
    this.filaAltura(ws, fila, 26);
  });
}

const filaTotalAct = filaHeaderAct + 1 + Math.max(actividadesAgrupadas.length, 1);
this.celda(ws, `C${filaTotalAct}`, 'Total Horas Cumplidas', ESTILO_FIELD_LABEL);
this.merge(ws, `C${filaTotalAct}:D${filaTotalAct}`, ESTILO_FIELD_LABEL);
this.celda(ws, `E${filaTotalAct}`, data?.total_horas_cumplidas ?? 0, { font: { bold: true }, border: allBorders(), alignment: { horizontal: 'center' } });

    // 3. Objetivos
    const filaObjTitulo = filaTotalAct + 3;
    this.celda(ws, `A${filaObjTitulo}`, '3. REGISTRO DE AVANCE Y SEGUIMIENTO DE LOS OBJETIVOS DEL PROYECTO DE VINCULACIÓN', ESTILO_SECCION);
    this.merge(ws, `A${filaObjTitulo}:G${filaObjTitulo}`, ESTILO_SECCION);

    const filaHeaderObj = filaObjTitulo + 2;
    this.celda(ws, `A${filaHeaderObj}`, 'Objetivos', ESTILO_HEADER_TABLA);
    this.merge(ws, `A${filaHeaderObj}:B${filaHeaderObj}`, ESTILO_HEADER_TABLA);
    this.celda(ws, `C${filaHeaderObj}`, 'Actividades', ESTILO_HEADER_TABLA);
    this.merge(ws, `C${filaHeaderObj}:D${filaHeaderObj}`, ESTILO_HEADER_TABLA);
    this.celda(ws, `E${filaHeaderObj}`, 'Avance %', ESTILO_HEADER_TABLA);
    this.celda(ws, `F${filaHeaderObj}`, 'Resultados', ESTILO_HEADER_TABLA);
    this.merge(ws, `F${filaHeaderObj}:G${filaHeaderObj}`, ESTILO_HEADER_TABLA);

    let filaCursorObj = filaHeaderObj + 1;
    if (objetivos.length === 0) {
      this.celda(ws, `A${filaCursorObj}`, 'No hay objetivos registrados', ESTILO_CELDA_TABLA);
      this.merge(ws, `A${filaCursorObj}:G${filaCursorObj}`, ESTILO_CELDA_TABLA);
      filaCursorObj++;
    } else {
      objetivos.forEach((obj: any, i: number) => {
        const estCelda = this.filaCebra(ESTILO_CELDA_TABLA, i);
        const estCentrado = this.filaCebra(ESTILO_CENTRADO, i);
        this.celda(ws, `A${filaCursorObj}`, obj.objetivo || '', estCelda);
        this.merge(ws, `A${filaCursorObj}:B${filaCursorObj + 2}`, estCelda);
        this.celda(ws, `C${filaCursorObj}`, obj.actividades || 'Sin especificar', estCelda);
        this.merge(ws, `C${filaCursorObj}:D${filaCursorObj + 2}`, estCelda);
        // "avance" ya viene como texto formateado (ej. "100%") desde el backend
        this.celda(ws, `E${filaCursorObj}`, obj.avance ?? '100%', estCentrado);
        this.merge(ws, `E${filaCursorObj}:E${filaCursorObj + 2}`, estCentrado);
        this.celda(ws, `F${filaCursorObj}`, obj.resultados || 'Pendiente', estCelda);
        this.merge(ws, `F${filaCursorObj}:G${filaCursorObj + 2}`, estCelda);
        this.filasAltura(ws, filaCursorObj, filaCursorObj + 2, 22);
        filaCursorObj += 3;
      });
    }

    // 4. Reflexión
    const filaReflexionTitulo = filaCursorObj + 2;
    this.celda(ws, `A${filaReflexionTitulo}`, '4.      REFLEXIÓN DEL ESTUDIANTE', ESTILO_SECCION);
    this.merge(ws, `A${filaReflexionTitulo}:G${filaReflexionTitulo}`, ESTILO_SECCION);
    this.celda(ws, `A${filaReflexionTitulo + 2}`, data?.reflexion_estudiante || 'Sin reflexión registrada.', ESTILO_CELDA_TABLA);
    this.merge(ws, `A${filaReflexionTitulo + 2}:G${filaReflexionTitulo + 4}`, ESTILO_CELDA_TABLA);
    this.filasAltura(ws, filaReflexionTitulo + 2, filaReflexionTitulo + 4, 26);

    // 5. Evaluación final
    const filaEvalTitulo = filaReflexionTitulo + 6;
    this.celda(ws, `A${filaEvalTitulo}`, '5.      EVALUACIÓN FINAL DEL TUTOR ACADÉMICO', ESTILO_SECCION);
    this.merge(ws, `A${filaEvalTitulo}:G${filaEvalTitulo}`, ESTILO_SECCION);

    const filaHeaderEval = filaEvalTitulo + 2;
    this.celda(ws, `A${filaHeaderEval}`, 'Parámetro de calificación', ESTILO_HEADER_TABLA);
    this.merge(ws, `A${filaHeaderEval}:E${filaHeaderEval}`, ESTILO_HEADER_TABLA);
    this.celda(ws, `F${filaHeaderEval}`, 'Calificación sobre 10', ESTILO_HEADER_TABLA);
    this.merge(ws, `F${filaHeaderEval}:G${filaHeaderEval}`, ESTILO_HEADER_TABLA);

    const filaPrimerParam = filaHeaderEval + 1;
    PARAMETROS_EVALUACION.forEach((p, i) => {
      const fila = filaPrimerParam + i;
      const estCelda = this.filaCebra(ESTILO_CELDA_TABLA, i);
      const estCentrado = this.filaCebra(ESTILO_CENTRADO, i);
      this.celda(ws, `A${fila}`, p.label, estCelda);
      this.merge(ws, `A${fila}:E${fila}`, estCelda);
      this.celda(ws, `F${fila}`, (parametros as any)[p.key] ?? 0, estCentrado);
      this.merge(ws, `F${fila}:G${fila}`, estCentrado);
      this.filaAltura(ws, fila, 28);
    });

    const filaTotalEval = filaPrimerParam + PARAMETROS_EVALUACION.length;
    this.celda(ws, `A${filaTotalEval}`, 'TOTAL', ESTILO_FIELD_LABEL);
    this.merge(ws, `A${filaTotalEval}:E${filaTotalEval}`, ESTILO_FIELD_LABEL);
    // Se usa la nota final ya calculada/guardada por el docente en el backend
    // (evaluacion_final.nota_final), en vez de recalcular un promedio local.
    // OJO: el backend puede enviar nota_final como string (ej. "5.00") si viene
    // de un campo numeric/decimal serializado por TypeORM/Postgres, por eso no
    // basta con `typeof === 'number'` — hay que forzar la conversión con Number().
    // Además, si el objeto llega con otro nombre de campo (nota, notaFinal,
    // promedio) se intenta igual antes de caer en 0, para no perder la nota
    // que el docente ya guardó en el sistema.
    const notaFinalCruda = evaluacion.nota_final ?? evaluacion.notaFinal ?? evaluacion.nota ?? evaluacion.promedio;
    const notaFinalNumerica = Number(notaFinalCruda);
    const notaFinalValida = Number.isFinite(notaFinalNumerica) ? notaFinalNumerica : 0;
    this.celda(ws, `F${filaTotalEval}`, notaFinalValida, { font: { bold: true }, numFmt: '0.00', border: allBorders(), alignment: { horizontal: 'center' } });
    this.merge(ws, `F${filaTotalEval}:G${filaTotalEval}`, { font: { bold: true }, border: allBorders(), alignment: { horizontal: 'center' } });

    const filaNotaFinal = filaTotalEval + 2;
    this.celda(ws, `A${filaNotaFinal}`, 'NOTA FINAL:', ESTILO_FIELD_LABEL);
    this.celda(ws, `B${filaNotaFinal}`, notaFinalValida, { ...ESTILO_FIELD_VALUE, numFmt: '0.00', alignment: { horizontal: 'center' } });
    this.celda(ws, `A${filaNotaFinal + 1}`, 'EN LETRAS', { font: { italic: true, sz: 8, name: 'Calibri' } });
    this.celda(ws, `B${filaNotaFinal + 1}`, evaluacion.nota_letras || evaluacion.notaEnLetras || evaluacion.notaLetras || '', { font: { italic: true, sz: 9, name: 'Calibri' }, alignment: { horizontal: 'center' } });

    const filaObsEval = filaNotaFinal + 3;
    this.celda(ws, `A${filaObsEval}`, '5.1 Observaciones:', ESTILO_FIELD_LABEL);
    this.merge(ws, `A${filaObsEval}:G${filaObsEval}`, ESTILO_FIELD_LABEL);
    this.celda(ws, `A${filaObsEval + 1}`, evaluacion.observaciones || 'Ninguna', ESTILO_CELDA_TABLA);
    this.merge(ws, `A${filaObsEval + 1}:G${filaObsEval + 1}`, ESTILO_CELDA_TABLA);

    const filaFirmasEval = filaObsEval + 4;
    this.celda(ws, `A${filaFirmasEval}`, 'DOCENTE TUTOR', ESTILO_HEADER_TABLA);
    this.merge(ws, `A${filaFirmasEval}:B${filaFirmasEval}`, ESTILO_HEADER_TABLA);
    this.celda(ws, `E${filaFirmasEval}`, 'COORDINADOR', ESTILO_HEADER_TABLA);
    this.merge(ws, `E${filaFirmasEval}:G${filaFirmasEval}`, ESTILO_HEADER_TABLA);

    const filaFirmasNombres = filaFirmasEval + 8;
    this.celda(ws, `A${filaFirmasNombres}`, datos.docente_tutor || '', ESTILO_FIRMA);
    this.merge(ws, `A${filaFirmasNombres}:D${filaFirmasNombres}`, ESTILO_FIRMA);
    this.celda(ws, `E${filaFirmasNombres}`, evaluacion.coordinador || '', ESTILO_FIRMA);
    this.merge(ws, `E${filaFirmasNombres}:G${filaFirmasNombres}`, ESTILO_FIRMA);

    // Anexos
    const filaAnexos = filaFirmasNombres + 3;
    this.celda(ws, `A${filaAnexos}`, 'ANEXOS', ESTILO_SECCION);
    this.merge(ws, `A${filaAnexos}:G${filaAnexos}`, ESTILO_SECCION);

    this.celda(
      ws, `A${filaAnexos + 2}`,
      '6.      Evidencia del producto final: anexos, fotografía o escaneado de las evidencias del resultado final del curso.  Incluya 6 imágenes y aplique las normas APA 7ma. Edición',
      { font: { italic: true, sz: 9, name: 'Calibri' }, alignment: { wrapText: true } }
    );
    this.merge(ws, `A${filaAnexos + 2}:G${filaAnexos + 4}`, { font: { italic: true, sz: 9, name: 'Calibri' }, alignment: { wrapText: true } });
    this.filasAltura(ws, filaAnexos + 2, filaAnexos + 4, 24);

    this.actualizarRefHoja(ws, filaAnexos + 6, 'G');
    return ws;
  }
}