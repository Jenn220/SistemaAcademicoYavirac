    import { HttpClient } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable, map, catchError, of } from 'rxjs';
  import * as XLSX from 'xlsx-js-style';

  import {
    ActividadEstudiantePayload,
    AsistenciaTutorPayload,
    CrearProyectoVinculacionPayload,
    InformePayload,
    ProyectoVinculacion,
    VinculacionActividad
  } from '../models/proyecto-vinculacion.model';

  const BASE_URL = 'http://localhost:3000/api/vinculacion';

  @Injectable({ providedIn: 'root' })
  export class VinculacionService {
    constructor(private readonly http: HttpClient) {}

    private mapEstado(estado?: string): string {
      if (!estado) return 'Desconocido';
      const normalized = estado.toUpperCase();
      if (normalized === 'EN_CURSO' || normalized === 'EN CURSO') return 'En ejecución';
      if (normalized === 'ACTIVO') return 'Activo';
      if (normalized === 'FINALIZADO') return 'Finalizado';
      return estado;
    }

    getProyectos(): Observable<ProyectoVinculacion[]> {
  return this.http.get<any[]>(`${BASE_URL}/estudiantes`).pipe(
    map(items => items.map(item => ({
      id: Number(item.id_vinculacion),

      nombre: item.nombre_proyecto ?? item.nombre,

      tutor: item.id_docente 
        ? `Docente ${item.id_docente}` 
        : 'Sin tutor',

      estado: this.mapEstado(item.estado),

      estudiantes: 1,

      descripcion: `Inicio: ${item.fecha_inicio} - Fin: ${item.fecha_fin}`
    })))
  );
}

    createProyecto(payload: CrearProyectoVinculacionPayload): Observable<any> {
      return this.http.post(`${BASE_URL}/vinculacion-estudiante`, payload);
    }

    getActividadesEstudiante(): Observable<any[]> {
      return this.http.get<any[]>(`${BASE_URL}/actividades-estudiante`);
    }

    createActividad(payload: ActividadEstudiantePayload): Observable<any> {
      return this.http.post(`${BASE_URL}/actividad-estudiante`, payload);
    }

    getAsistenciasTutor(): Observable<any[]> {
      return this.http.get<any[]>(`${BASE_URL}/asistencia-tutor`);
    }

    createAsistenciaTutor(payload: AsistenciaTutorPayload): Observable<any> {
      return this.http.post(`${BASE_URL}/asistencia-tutor`, payload);
    }

    getInformes(): Observable<any[]> {
      return this.http.get<any[]>(`${BASE_URL}/informes`);
    }

    createInforme(payload: InformePayload): Observable<any> {
      return this.http.post(`${BASE_URL}/informe`, payload);
    }

    getReporteById(id: number): Observable<any> {
      return this.http.get<any>(`${BASE_URL}/reporte/${id}`);
    }

    getActaCompromiso(id: number): Observable<any> {
      return this.http.get<any>(`${BASE_URL}/acta-compromiso/${id}`);
    }

    getReporteAsistenciaTutor(id: number): Observable<any> {
      return this.http.get<any>(`${BASE_URL}/asistencia-tutor/${id}`);
    }

    getInformeActividades(id: number): Observable<any> {
      return this.http.get<any>(`${BASE_URL}/informe-actividades/${id}`);
    }

    getCertificado(id: number): Observable<any> {
      return this.http.get<any>(`${BASE_URL}/certificado/${id}`);
    }

    getInicioTutor(id: number): Observable<any> {
      return this.http.get<any>(`${BASE_URL}/inicio-tutor/${id}`);
    }

    getProyectoById(id: number): Observable<ProyectoVinculacion | undefined> {
      return this.getReporteById(id).pipe(
        map(response => {
          console.log('RESPUESTA BACKEND REPORTE:', response);
          if (!response || !response.cabecera) {
            return undefined;
          }

          const cabecera = response.cabecera ?? {};
          const totales = response.totales ?? {};

          return {
            id,
            nombre: cabecera.nombre_proyecto ?? 'Proyecto desconocido',
            tutor: cabecera.docente_tutor ?? 'Sin tutor',
            estado: 'N/A',
            estudiantes: 0,
            descripcion: `Periodo: ${cabecera.periodo_academico ?? 'N/A'}`,
            carrera: cabecera.carrera,
            entidad_beneficiaria: cabecera.entidad_beneficiaria,
            estudiante: cabecera.estudiante,
            docente_tutor: cabecera.docente_tutor,
            tutor_entidad_receptora: cabecera.tutor_entidad_receptora,
            periodo_academico: cabecera.periodo_academico,
            actividades: Array.isArray(response.actividades)
              ? response.actividades.map((row: any) => ({
                  fecha: row.fecha,
                  hora_entrada: row.hora_entrada ?? row.hora_inicio,
                  hora_salida: row.hora_salida ?? row.hora_fin,
                  total_horas: Number(row.total_horas ?? row.horas_total ?? 0),
                  actividad_realizada: row.actividad_realizada ?? row.actividades_realizadas ?? ''
                }))
              : [],
            total_horas: Number(totales.total_horas ?? 0),
            observaciones: totales.observaciones ?? 'Ninguna'
          };
        }),
        catchError(error => {
          console.error('ERROR AL OBTENER REPORTE:', error);
          return of(undefined);
        })
      );
    }

    exportarReporteExcel(id: number, proyecto: ProyectoVinculacion | undefined): void {
      if (!proyecto) {
        return;
      }

      // 1. Definir la matriz base (A1:G15)
      const filas: any[][] = [
        // Banner Superior Institucional (Filas 0, 1, 2, 3)
        ['', 'INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO YAVIRAC', '', '', '', 'CÓDIGO', 'DS-040106'],
        ['', 'MACROPROCESO 04 VINCULACIÓN', '', '', '', '', ''],
        ['', 'PROCESO 01 VINCULACIÓN', '', '', '', '', ''],
        ['', 'FORMATO 06 CONTROL DE ASISTENCIA DEL ESTUDIANTE', '', '', '', '', ''],
        [], // Fila 4: Espacio

        // Títulos del Reporte (Filas 5, 6, 7)
        ['INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO "YAVIRAC"'],
        ['Dirección: García Moreno S-435 y Ambato'],
        ['Quito - Ecuador'],
        [], // Fila 8: Espacio
        ['CONTROL DE ASISTENCIA Y SEGUIMIENTO DE VINCULACIÓN CON LA COMUNIDAD'],
        [], // Fila 10: Espacio

        // Bloque de Información General (Filas 11, 12, 13)
        ['CARRERA:', proyecto.carrera ?? 'N/A', '', 'ENTIDAD BENEFICIARIA:', proyecto.entidad_beneficiaria ?? 'N/A', '', `PERIODO ACADÉMICO:\n${proyecto.periodo_academico ?? 'N/A'}`],
        ['ESTUDIANTE:', proyecto.estudiante ?? 'N/A', '', 'NOMBRE DEL PROYECTO:', proyecto.nombre ?? 'N/A', '', ''],
        ['DOCENTE TUTOR:', proyecto.docente_tutor ?? 'N/A', '', 'TUTOR ENTIDAD RECEPTORA:', proyecto.tutor_entidad_receptora ?? 'N/A', '', ''],
        [], // Fila 14: Espacio

        // Encabezados de Tabla (Fila 15)
        ['FECHA', 'HORA DE ENTRADA', 'HORA DE SALIDA', 'TOTAL HORAS', 'ACTIVIDAD REALIZADA', '', '']
      ];

      // 2. Insertar las actividades de forma dinámica
      const actividades = proyecto.actividades ?? [];
      const inicioTablaIdx = filas.length; // Fila 16 (índice 16 en base-0)

      actividades.forEach(act => {
        filas.push([
          act.fecha ?? '',
          act.hora_entrada ?? '',
          act.hora_salida ?? '',
          act.total_horas ?? 0,
          act.actividad_realizada ?? '',
          '', // Columna F
          ''  // Columna G
        ]);
      });

      const finTablaIdx = filas.length - 1;

      // Fila de sumatoria final
      filas.push(['', '', 'TOTAL HORAS:', proyecto.total_horas ?? 0, '', '', '']);
      filas.push([]); // Espacio

      // Observaciones
      filas.push(['OBSERVACIONES:', proyecto.observaciones ?? 'Ninguna', '', '', '', '', '']);
      filas.push([]); 
      filas.push([]); 

      const inicioFirmasIdx = filas.length;

      // Bloque de Firmas
      filas.push(['ESTUDIANTE', '', '', 'DOCENTE TUTOR', '', '', '']);
      filas.push(['', '', '', '', '', '', '']); // Espacio para firma física
      filas.push(['', '', '', '', '', '', '']); 
      filas.push(['', '', '', '', '', '', '']); 
      filas.push([proyecto.estudiante ?? '', '', '', proyecto.docente_tutor ?? '', '', '', '']);

      // 3. Convertir matriz a Hoja de Excel
      const sheet = XLSX.utils.aoa_to_sheet(filas);

      // --- CONFIGURACIÓN DE COMBINACIÓN DE CELDAS (MERGES) ---
      const merges: any[] = [
        // Banner superior
        { s: { r: 0, c: 1 }, e: { r: 0, c: 4 } }, // Título azul
        { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } }, // Macroproceso
        { s: { r: 2, c: 1 }, e: { r: 2, c: 4 } }, // Proceso naranja
        { s: { r: 3, c: 1 }, e: { r: 3, c: 4 } }, // Formato 06
        { s: { r: 0, c: 5 }, e: { r: 3, c: 5 } }, // CÓDIGO
        { s: { r: 0, c: 6 }, e: { r: 3, c: 6 } }, // Valor del código

        // Títulos del centro
        { s: { r: 5, c: 0 }, e: { r: 5, c: 6 } },
        { s: { r: 6, c: 0 }, e: { r: 6, c: 6 } },
        { s: { r: 7, c: 0 }, e: { r: 7, c: 6 } },
        { s: { r: 9, c: 0 }, e: { r: 9, c: 6 } },

        // Información General
        { s: { r: 11, c: 1 }, e: { r: 11, c: 2 } }, // Carrera (B12:C12)
        { s: { r: 11, c: 4 }, e: { r: 11, c: 5 } }, // Entidad beneficiaria (E12:F12)
        { s: { r: 12, c: 1 }, e: { r: 12, c: 2 } }, // Estudiante (B13:C13)
        { s: { r: 12, c: 4 }, e: { r: 12, c: 5 } }, // Nombre proyecto (E13:F13)
        { s: { r: 13, c: 1 }, e: { r: 13, c: 2 } }, // Docente tutor (B14:C14)
        { s: { r: 13, c: 4 }, e: { r: 13, c: 5 } }, // Tutor entidad receptora (E14:F14)

        // PERIODO ACADÉMICO (F12:G14) -> Unifica las columnas F-G de las filas 11, 12, 13
        { s: { r: 11, c: 5 }, e: { r: 13, c: 6 } },

        // Encabezado de "Actividad Realizada" de la tabla (E16:F16)
        { s: { r: 15, c: 4 }, e: { r: 15, c: 5 } }
      ];

      // Combinación horizontal de las descripciones de actividades en la tabla (Columna E y F)
      for (let r = inicioTablaIdx; r <= finTablaIdx; r++) {
        merges.push({ s: { r: r, c: 4 }, e: { r: r, c: 5 } });
      }

      // Combinación de totales, observaciones y firmas
      merges.push({ s: { r: finTablaIdx + 1, c: 4 }, e: { r: finTablaIdx + 1, c: 5 } }); // Total Horas vacío derecho
      merges.push({ s: { r: finTablaIdx + 3, c: 1 }, e: { r: finTablaIdx + 3, c: 5 } }); // Observaciones (B:F)

      // Cuadros de firmas
      merges.push({ s: { r: inicioFirmasIdx, c: 0 }, e: { r: inicioFirmasIdx, c: 2 } });     // ESTUDIANTE (A:C)
      merges.push({ s: { r: inicioFirmasIdx, c: 3 }, e: { r: inicioFirmasIdx, c: 5 } });     // DOCENTE TUTOR (D:F)
      merges.push({ s: { r: inicioFirmasIdx + 1, c: 0 }, e: { r: inicioFirmasIdx + 3, c: 2 } }); // Espacio firma estudiante
      merges.push({ s: { r: inicioFirmasIdx + 1, c: 3 }, e: { r: inicioFirmasIdx + 3, c: 5 } }); // Espacio firma docente
      merges.push({ s: { r: inicioFirmasIdx + 4, c: 0 }, e: { r: inicioFirmasIdx + 4, c: 2 } }); // Nombre estudiante
      merges.push({ s: { r: inicioFirmasIdx + 4, c: 3 }, e: { r: inicioFirmasIdx + 4, c: 5 } }); // Nombre docente

      sheet['!merges'] = merges;

      // --- ESTILIZACIÓN DETALLADA (BORDES, COLORES Y FUENTES) ---
      const borderThin = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      };

      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:G100');

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
          if (!sheet[cell_ref]) {
            sheet[cell_ref] = { t: 'z', v: '' };
          }
          const cell = sheet[cell_ref];

          // 1. Estilos para el Banner Tricolor Superior
          if (R <= 3) {
            let bgColor = 'FFFFFF';
            let textColor = '000000';
            let isBold = true;

            if (R === 0 && C >= 1 && C <= 4) { bgColor = '006699'; textColor = 'FFFFFF'; } // Azul
            if (R === 2 && C >= 1 && C <= 4) { bgColor = 'E36C09'; textColor = 'FFFFFF'; } // Naranja
            if (R === 1 || R === 3) { bgColor = 'F2F2F2'; } // Gris claro institucional

            cell.s = {
              font: { bold: isBold, name: 'Arial', sz: 9, color: { rgb: textColor } },
              fill: { fgColor: { rgb: bgColor } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              border: borderThin
            };
          }

          // Código de la esquina derecha
          if (R <= 3 && C >= 5) {
            cell.s = {
              font: { bold: true, name: 'Arial', sz: 8 },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: borderThin
            };
          }

          // 2. Subtítulos de Institución (Filas 5 a 9)
          if (R >= 5 && R <= 9) {
            cell.s = {
              font: { bold: R === 5 || R === 9, name: 'Arial', sz: R === 5 ? 12 : 10 },
              alignment: { horizontal: 'center', vertical: 'center' }
            };
          }

          // 3. Cuadrícula de Información General (Filas 11 a 13)
          if (R >= 11 && R <= 13) {
            const esEtiqueta = (C === 0 || C === 3);
            const esPeriodo = (C === 5 || C === 6); // Columnas F y G

            cell.s = {
              font: { bold: esEtiqueta || esPeriodo, name: 'Arial', sz: 8 },
              fill: (esEtiqueta || esPeriodo) ? { fgColor: { rgb: 'F2F2F2' } } : undefined,
              alignment: { 
                horizontal: esPeriodo ? 'center' : 'left', 
                vertical: 'center', 
                wrapText: true 
              },
              border: borderThin
            };
          }

          // 4. Encabezados de la Tabla de Actividades (Fila 15)
          if (R === 15) {
            cell.s = {
              font: { bold: true, name: 'Arial', sz: 9 },
              fill: { fgColor: { rgb: 'D9D9D9' } }, // Gris medio
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              border: borderThin
            };
          }

          // 5. Filas de Actividades de la Tabla
          if (R >= inicioTablaIdx && R <= finTablaIdx) {
            cell.s = {
              font: { name: 'Arial', sz: 9 },
              alignment: { 
                horizontal: C === 4 ? 'left' : 'center', 
                vertical: 'center', 
                wrapText: true 
              },
              border: borderThin
            };
            if (C === 3 && typeof cell.v === 'number') {
              cell.z = '0.00'; // Total de horas por fila
            }
          }

          // 6. Fila de Total de Horas
          if (R === finTablaIdx + 1) {
            cell.s = {
              font: { bold: true, name: 'Arial', sz: 9 },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: borderThin
            };
            if (C === 3 && typeof cell.v === 'number') {
              cell.z = '0.00';
            }
          }

          // 7. Fila de Observaciones
          if (R === finTablaIdx + 3) {
            cell.s = {
              font: { bold: C === 0, name: 'Arial', sz: 9 },
              alignment: { horizontal: 'left', vertical: 'center' },
              border: borderThin
            };
          }

          // 8. Bloque de Firmas
          if (R >= inicioFirmasIdx) {
            const esHeaderFirma = (R === inicioFirmasIdx);
            const esNombreFirma = (R === inicioFirmasIdx + 4);
            cell.s = {
              font: { bold: esHeaderFirma || esNombreFirma, name: 'Arial', sz: 9 },
              fill: esHeaderFirma ? { fgColor: { rgb: 'D9D9D9' } } : undefined,
              alignment: { horizontal: 'center', vertical: 'center' },
              border: borderThin
            };
          }
        }
      }

      // Configuración exacta de los anchos de columna
      sheet['!cols'] = [
        { wch: 16 }, // A: Fecha / Carreras
        { wch: 18 }, // B: Entrada / Estudiante (M1)
        { wch: 18 }, // C: Salida / Estudiante (M2)
        { wch: 15 }, // D: Horas / Entidad
        { wch: 38 }, // E: Actividad Realizada (M1)
        { wch: 38 }, // F: Actividad Realizada (M2) / Código
        { wch: 18 }  // G: Código Valor / Período
      ];

      // --- ALTURAS DE FILAS ---
      sheet['!rows'] = [];
      for (let i = 0; i <= filas.length; i++) {
        if (i <= 3) sheet['!rows'].push({ hpt: 20 }); // Banner
        else if (i >= 11 && i <= 13) sheet['!rows'].push({ hpt: 28 }); // Cabecera de información (más alta por el wrap)
        else if (i === 15) sheet['!rows'].push({ hpt: 25 }); // Encabezado tabla
        else if (i >= inicioTablaIdx && i <= finTablaIdx) sheet['!rows'].push({ hpt: 22 }); // Filas de datos
        else sheet['!rows'].push({ hpt: 18 });
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'Control de Asistencias');
      
      const nombreArchivo = `FORMATO_06_CONTROL_ASISTENCIA_${(proyecto.estudiante ?? 'VINCULACION').replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(workbook, nombreArchivo);
    }
    exportarFormato07Excel(id: number, proyecto: ProyectoVinculacion | undefined): void {
      if (!proyecto) {
        return;
      }

      // 1. Definir la matriz base adaptada al FORMATO 07 (TUTOR)
      const filas: any[][] = [
        // Banner Superior Institucional (Filas 0, 1, 2, 3)
        ['', 'INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO YAVIRAC', '', '', '', 'CÓDIGO', 'DS-040107'],
        ['', 'MACROPROCESO 04 VINCULACIÓN', '', '', '', '', ''],
        ['', 'PROCESO 01 VINCULACIÓN', '', '', '', '', ''],
        ['', 'FORMATO 07 REGISTRO DE ASISTENCIA DEL TUTOR', '', '', '', '', ''],
        [], // Fila 4: Espacio

        // Títulos del Reporte (Filas 5, 6, 7)
        ['INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO "YAVIRAC"'],
        ['Dirección: García Moreno S-435 y Ambato'],
        ['Quito - Ecuador'],
        [], // Fila 8: Espacio

        // Bloque de Información General del Tutor (Filas 9, 10, 11, 12)
        ['CARRERA:', proyecto.carrera ?? 'N/A', '', 'INSTITUCIÓN:', proyecto.entidad_beneficiaria ?? 'N/A', '', `PERIODO ACADÉMICO:\n${proyecto.periodo_academico ?? 'N/A'}`],
        ['DOCENTE TUTOR:', proyecto.docente_tutor ?? 'N/A', '', '', '', '', ''],
        [], // Fila 11: Espacio vacío para balancear el diseño anterior

        // Encabezados de Tabla (Fila 12)
        ['FECHA', 'HORA DE ENTRADA', 'HORA DE SALIDA', 'TOTAL HORAS', 'ACTIVIDAD REALIZADA', '', '']
      ];

      // 2. Insertar las actividades del tutor de forma dinámica
      const actividades = proyecto.actividades ?? [];
      const inicioTablaIdx = filas.length; // Fila 13 (índice en base-0)

      actividades.forEach(act => {
        filas.push([
          act.fecha ?? '',
          act.hora_entrada ?? '',
          act.hora_salida ?? '',
          act.total_horas ?? 0,
          act.actividad_realizada ?? '',
          '', // Columna F
          ''  // Columna G
        ]);
      });

      const finTablaIdx = filas.length - 1;

      // Fila de sumatoria final
      filas.push(['', '', 'TOTAL HORA', proyecto.total_horas ?? 0, '', '', '']);
      filas.push([]); // Espacio

      // Observaciones
      filas.push(['OBSERVACIONES:', proyecto.observaciones ?? 'Ninguna', '', '', '', '', '']);
      filas.push([]); 
      filas.push([]); 

      const inicioFirmasIdx = filas.length;

      // Bloque de Firmas (Solo Coordinador de Carrera para el Formato 07)
      filas.push(['', '', '', 'COORDINADOR DE CARRERA', '', '', '']);
      filas.push(['', '', '', '', '', '', '']); // Espacio para firma física
      filas.push(['', '', '', '', '', '', '']); 
      filas.push(['', '', '', '', '', '', '']); 
      filas.push(['', '', '', 'Ing. Raúl Páez', '', '', '']); // Puedes cambiar por una variable dinámica de tu proyecto si la tienes

      // 3. Convertir matriz a Hoja de Excel
      const sheet = XLSX.utils.aoa_to_sheet(filas);

      // --- CONFIGURACIÓN DE COMBINACIÓN DE CELDAS (MERGES) ---
      const merges: any[] = [
        // Banner superior
        { s: { r: 0, c: 1 }, e: { r: 0, c: 4 } }, // Título azul
        { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } }, // Macroproceso
        { s: { r: 2, c: 1 }, e: { r: 2, c: 4 } }, // Proceso naranja
        { s: { r: 3, c: 1 }, e: { r: 3, c: 4 } }, // Formato 07
        { s: { r: 0, c: 5 }, e: { r: 3, c: 5 } }, // CÓDIGO
        { s: { r: 0, c: 6 }, e: { r: 3, c: 6 } }, // Valor del código (DS-040107)

        // Títulos del centro
        { s: { r: 5, c: 0 }, e: { r: 5, c: 6 } },
        { s: { r: 6, c: 0 }, e: { r: 6, c: 6 } },
        { s: { r: 7, c: 0 }, e: { r: 7, c: 6 } },

        // Información General (Alineado a la cabecera del Formato 07)
        { s: { r: 9, c: 1 }, e: { r: 9, c: 2 } }, // Carrera (B10:C10)
        { s: { r: 9, c: 4 }, e: { r: 9, c: 5 } }, // Institución (E10:F10)
        { s: { r: 10, c: 1 }, e: { r: 10, c: 2 } }, // Docente tutor (B11:C11)

        // PERIODO ACADÉMICO (F10:G11)
        { s: { r: 9, c: 5 }, e: { r: 10, c: 6 } },

        // Encabezado de "Actividad Realizada" de la tabla (E13:F13)
        { s: { r: 12, c: 4 }, e: { r: 12, c: 5 } }
      ];

      // Combinación horizontal de las descripciones de actividades en la tabla (Columna E y F)
      for (let r = inicioTablaIdx; r <= finTablaIdx; r++) {
        merges.push({ s: { r: r, c: 4 }, e: { r: r, c: 5 } });
      }

      // Combinación de totales y observaciones
      merges.push({ s: { r: finTablaIdx + 1, c: 4 }, e: { r: finTablaIdx + 1, c: 5 } }); // Vacío derecho
      merges.push({ s: { r: finTablaIdx + 3, c: 1 }, e: { r: finTablaIdx + 3, c: 5 } }); // Observaciones (B:F)

      // Cuadro de firmas para el Coordinador (Columnas D a F)
      merges.push({ s: { r: inicioFirmasIdx, c: 3 }, e: { r: inicioFirmasIdx, c: 5 } });     // COORDINADOR DE CARRERA (D:F)
      merges.push({ s: { r: inicioFirmasIdx + 1, c: 3 }, e: { r: inicioFirmasIdx + 3, c: 5 } }); // Espacio firma
      merges.push({ s: { r: inicioFirmasIdx + 4, c: 3 }, e: { r: inicioFirmasIdx + 4, c: 5 } }); // Nombre Coordinador

      sheet['!merges'] = merges;

      // --- ESTILIZACIÓN DETALLADA (BORDES, COLORES Y FUENTES) ---
      const borderThin = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      };

      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:G100');

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
          if (!sheet[cell_ref]) {
            sheet[cell_ref] = { t: 'z', v: '' };
          }
          const cell = sheet[cell_ref];

          // 1. Estilos para el Banner Tricolor Superior
          if (R <= 3) {
            let bgColor = 'FFFFFF';
            let textColor = '000000';
            let isBold = true;

            if (R === 0 && C >= 1 && C <= 4) { bgColor = '006699'; textColor = 'FFFFFF'; } // Azul
            if (R === 2 && C >= 1 && C <= 4) { bgColor = 'E36C09'; textColor = 'FFFFFF'; } // Naranja
            if (R === 1 || R === 3) { bgColor = 'F2F2F2'; } // Gris claro institucional

            cell.s = {
              font: { bold: isBold, name: 'Arial', sz: 9, color: { rgb: textColor } },
              fill: { fgColor: { rgb: bgColor } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              border: borderThin
            };
          }

          // Código de la esquina derecha (DS-040107)
          if (R <= 3 && C >= 5) {
            cell.s = {
              font: { bold: true, name: 'Arial', sz: 8 },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: borderThin
            };
          }

          // 2. Subtítulos de Institución (Filas 5 a 7)
          if (R >= 5 && R <= 7) {
            cell.s = {
              font: { bold: R === 5, name: 'Arial', sz: R === 5 ? 12 : 10 },
              alignment: { horizontal: 'center', vertical: 'center' }
            };
          }

          // 3. Cuadrícula de Información General (Filas 9 a 10)
          if (R >= 9 && R <= 10) {
            const esEtiqueta = (C === 0 || C === 3);
            const esPeriodo = (C === 5 || C === 6); // Columnas F y G

            cell.s = {
              font: { bold: esEtiqueta || esPeriodo, name: 'Arial', sz: 8 },
              fill: (esEtiqueta || esPeriodo) ? { fgColor: { rgb: 'F2F2F2' } } : undefined,
              alignment: { 
                horizontal: esPeriodo ? 'center' : 'left', 
                vertical: 'center', 
                wrapText: true 
              },
              border: borderThin
            };
          }

          // 4. Encabezados de la Tabla de Actividades (Fila 12)
          if (R === 12) {
            cell.s = {
              font: { bold: true, name: 'Arial', sz: 9 },
              fill: { fgColor: { rgb: 'D9D9D9' } }, // Gris medio
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              border: borderThin
            };
          }

          // 5. Filas de Actividades de la Tabla
          if (R >= inicioTablaIdx && R <= finTablaIdx) {
            cell.s = {
              font: { name: 'Arial', sz: 9 },
              alignment: { 
                horizontal: C === 4 ? 'left' : 'center', 
                vertical: 'center', 
                wrapText: true 
              },
              border: borderThin
            };
            if (C === 3 && typeof cell.v === 'number') {
              cell.z = '0.00'; // Formato numérico para las horas
            }
          }

          // 6. Fila de Total de Horas
          if (R === finTablaIdx + 1) {
            cell.s = {
              font: { bold: true, name: 'Arial', sz: 9 },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: borderThin
            };
            if (C === 3 && typeof cell.v === 'number') {
              cell.z = '0.00';
            }
          }

          // 7. Fila de Observaciones
          if (R === finTablaIdx + 3) {
            cell.s = {
              font: { bold: C === 0, name: 'Arial', sz: 9 },
              alignment: { horizontal: 'left', vertical: 'center' },
              border: borderThin
            };
          }

          // 8. Bloque de Firmas (Solo para el Coordinador en las columnas correspondientes)
          if (R >= inicioFirmasIdx && C >= 3 && C <= 5) {
            const esHeaderFirma = (R === inicioFirmasIdx);
            const esNombreFirma = (R === inicioFirmasIdx + 4);
            cell.s = {
              font: { bold: esHeaderFirma || esNombreFirma, name: 'Arial', sz: 9 },
              fill: esHeaderFirma ? { fgColor: { rgb: 'D9D9D9' } } : undefined,
              alignment: { horizontal: 'center', vertical: 'center' },
              border: borderThin
            };
          }
        }
      }

      // Configuración exacta de los anchos de columna
      sheet['!cols'] = [
        { wch: 16 }, // A: Fecha / Carreras
        { wch: 18 }, // B: Entrada / Estudiante
        { wch: 18 }, // C: Salida
        { wch: 15 }, // D: Horas / Entidad
        { wch: 38 }, // E: Actividad Realizada
        { wch: 38 }, // F: Actividad Realizada / Código
        { wch: 18 }  // G: Código Valor / Período
      ];

      // --- ALTURAS DE FILAS ---
      sheet['!rows'] = [];
      for (let i = 0; i <= filas.length; i++) {
        if (i <= 3) sheet['!rows'].push({ hpt: 20 }); // Banner
        else if (i >= 9 && i <= 10) sheet['!rows'].push({ hpt: 28 }); // Cabecera de información
        else if (i === 12) sheet['!rows'].push({ hpt: 25 }); // Encabezado tabla
        else if (i >= inicioTablaIdx && i <= finTablaIdx) sheet['!rows'].push({ hpt: 22 }); // Filas de datos
        else sheet['!rows'].push({ hpt: 18 });
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'Asistencia de Tutor');
      
      const nombreArchivo = `FORMATO_07_ASISTENCIA_TUTOR_${(proyecto.docente_tutor ?? 'TUTOR').replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(workbook, nombreArchivo);
    }

    exportarActaCompromisoExcel(id: number): void {
      this.getActaCompromiso(id).subscribe({
        next: (resp: any) => {
          const filas: any[][] = [
            ['', resp.instituto ?? 'INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO YAVIRAC', '', '', '', ''],
            [],
            ['', resp.titulo ?? 'ACTA COMPROMISO DE PARTICIPACIÓN EN VINCULACIÓN CON LA COMUNIDAD', '', '', '', ''],
            [],
            ['A:', 'Ing. Raúl Páez', '', 'Coordinador de Carrera', '', ''],
            ['De:', resp.estudiante ?? 'N/A', '', 'Tutor del Proyecto', '', ''],
            ['Cédula:', resp.cedula ?? 'N/A', '', 'Carrera:', resp.carrera ?? 'N/A', ''],
            ['Nivel:', resp.nivel ?? 'N/A', '', 'Entidad beneficiaria:', resp.entidad_beneficiaria ?? 'N/A', ''],
            ['Docente tutor:', resp.docente_tutor ?? 'N/A', '', '', '', ''],
            [],
            ['Yo,', resp.estudiante ?? 'N/A', 'con C.I. Nº', resp.cedula ?? 'N/A', '', ''],
            ['declaro que me comprometo a cumplir con el cronograma de actividades y normas de vinculación al proyecto.', '', '', '', '', ''],
            ['El presente documento certifica el inicio de las actividades del estudiante en el proyecto asignado.', '', '', '', '', '']
          ];

          const sheet = XLSX.utils.aoa_to_sheet(filas);
          sheet['!merges'] = [
            { s: { r: 0, c: 1 }, e: { r: 0, c: 4 } },
            { s: { r: 2, c: 1 }, e: { r: 2, c: 4 } },
            { s: { r: 4, c: 1 }, e: { r: 4, c: 3 } },
            { s: { r: 5, c: 1 }, e: { r: 5, c: 3 } },
            { s: { r: 10, c: 1 }, e: { r: 10, c: 3 } },
            { s: { r: 11, c: 0 }, e: { r: 11, c: 5 } },
            { s: { r: 12, c: 0 }, e: { r: 12, c: 5 } }
          ];

          const border = {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          };

          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:F20');
          for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const ref = XLSX.utils.encode_cell({ r: R, c: C });
              if (!sheet[ref]) sheet[ref] = { t: 's', v: '' };
              const cell = sheet[ref];
              cell.s = cell.s || {};
              if (R === 2) {
                cell.s = {
                  font: { bold: true, sz: 13, name: 'Arial' },
                  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                  border
                };
              } else if (R >= 4 && R <= 8) {
                cell.s = {
                  font: { bold: C === 0 || C === 3, name: 'Arial', sz: 10 },
                  alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
                  border
                };
              } else {
                cell.s = {
                  font: { name: 'Arial', sz: 10 },
                  alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
                  border
                };
              }
            }
          }

          sheet['!cols'] = [
            { wch: 10 },
            { wch: 28 },
            { wch: 6 },
            { wch: 24 },
            { wch: 8 },
            { wch: 10 }
          ];
          sheet['!rows'] = [{ hpt: 18 }, {}, { hpt: 26 }, {}, { hpt: 22 }, { hpt: 22 }, { hpt: 22 }, { hpt: 22 }, { hpt: 22 }, {}, { hpt: 24 }, { hpt: 26 }, { hpt: 26 }];

          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, sheet, 'Acta Compromiso');
          const nombreArchivo = `ACTA_COMPROMISO_${(resp.estudiante ?? 'VINCULACION').replace(/\s+/g, '_')}.xlsx`;
          XLSX.writeFile(wb, nombreArchivo);
        },
        error: (err) => console.error('Error fetching acta compromiso:', err)
      });
    }

    exportarCertificadoExcel(id: number): void {
      this.getCertificado(id).subscribe({
        next: (resp: any) => {
          const nombreProyecto = resp.proyecto ?? resp.nombre_proyecto ?? resp.nombre ?? 'N/A';
          const representante = resp.representante || resp.institucion || 'N/A';
          const filas: any[][] = [
            ['', 'INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO "YAVIRAC"', '', '', '', ''],
            ['', 'MACROPROCESO 04 VINCULACIÓN', '', '', '', ''],
            ['', 'PROCESO 01 VINCULACIÓN', '', '', '', ''],
            ['', 'FORMATO 04 CARTA DE COMPROMISO DEL ESTUDIANTE', '', '', '', ''],
            [],
            ['', 'CERTIFICADO DE VINCULACIÓN CON LA COMUNIDAD', '', '', '', ''],
            [],
            ['Fecha emisión:', resp.fecha_emision ?? 'N/A', '', '', '', ''],
            ['Estudiante:', resp.estudiante ?? 'N/A', '', 'Cédula:', resp.cedula ?? 'N/A', ''],
            ['Carrera:', resp.carrera ?? 'N/A', '', 'Proyecto:', nombreProyecto, ''],
            ['Desde:', resp.fecha_inicio ?? 'N/A', '', 'Hasta:', resp.fecha_fin ?? 'N/A', ''],
            ['Total horas:', resp.total_horas ?? 0, '', 'Institución beneficiaria:', resp.institucion ?? 'N/A', ''],
            ['Representante:', representante, '', '', '', ''],
            [],
            ['Firma estudiante', '', '', 'Firma representante', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', '']
          ];

          const sheet = XLSX.utils.aoa_to_sheet(filas);
          sheet['!merges'] = [
            { s: { r: 0, c: 1 }, e: { r: 0, c: 4 } },
            { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } },
            { s: { r: 2, c: 1 }, e: { r: 2, c: 4 } },
            { s: { r: 3, c: 1 }, e: { r: 3, c: 4 } },
            { s: { r: 5, c: 1 }, e: { r: 5, c: 4 } },
            { s: { r: 7, c: 1 }, e: { r: 7, c: 4 } },
            { s: { r: 8, c: 1 }, e: { r: 8, c: 4 } },
            { s: { r: 9, c: 1 }, e: { r: 9, c: 4 } },
            { s: { r: 10, c: 1 }, e: { r: 10, c: 4 } },
            { s: { r: 11, c: 1 }, e: { r: 11, c: 4 } },
            { s: { r: 12, c: 1 }, e: { r: 12, c: 4 } },
            { s: { r: 14, c: 0 }, e: { r: 14, c: 2 } },
            { s: { r: 14, c: 3 }, e: { r: 14, c: 5 } },
            { s: { r: 16, c: 0 }, e: { r: 16, c: 2 } },
            { s: { r: 16, c: 3 }, e: { r: 16, c: 5 } }
          ];

          const border = {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          };

          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:F20');
          for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const ref = XLSX.utils.encode_cell({ r: R, c: C });
              if (!sheet[ref]) sheet[ref] = { t: 's', v: '' };
              const cell = sheet[ref];
              const isHeader = R <= 5;
              cell.s = {
                font: { bold: isHeader || C === 0, name: 'Arial', sz: isHeader ? 10 : 10 },
                fill: isHeader ? { fgColor: { rgb: 'D9D9D9' } } : undefined,
                alignment: { horizontal: isHeader ? 'center' : 'left', vertical: 'center', wrapText: true },
                border
              };
            }
          }

          sheet['!cols'] = [{ wch: 14 }, { wch: 32 }, { wch: 4 }, { wch: 18 }, { wch: 30 }, { wch: 12 }];
          sheet['!rows'] = [{ hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, {}, { hpt: 26 }, {}, { hpt: 22 }, { hpt: 20 }, { hpt: 20 }, { hpt: 20 }, { hpt: 20 }, { hpt: 20 }, {}, { hpt: 20 }, { hpt: 20 }, { hpt: 20 }];

          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, sheet, 'Certificado');
          const nombreArchivo = `CERTIFICADO_${(resp.estudiante ?? 'VINCULACION').replace(/\s+/g, '_')}.xlsx`;
          XLSX.writeFile(wb, nombreArchivo);
        },
        error: (err) => console.error('Error fetching certificado:', err)
      });
    }

    exportarInformeActividadesExcel(id: number): void {
      this.getInformeActividades(id).subscribe({
        next: (resp: any) => {
          const filas: any[][] = [];
          filas.push(['', 'INFORME DE ACTIVIDADES', '', '', '']);
          filas.push([]);
          filas.push(['Fundación/Entidad:', resp.cabecera?.fundacion ?? 'N/A', '', 'Ciclo académico:', resp.cabecera?.ciclo_academico ?? 'N/A']);
          filas.push(['Estudiante:', resp.cabecera?.estudiante ?? 'N/A', '', 'Cédula:', resp.cabecera?.cedula ?? 'N/A']);
          filas.push(['Título proyecto:', resp.cabecera?.titulo_proyecto ?? 'N/A']);
          filas.push([]);
          filas.push(['Fecha', 'Actividad', 'Resultado de aprendizaje']);

          (resp.informe_actividades ?? []).forEach((a: any) => {
            filas.push([a.fecha ?? '', a.actividad ?? '', a.resultado_aprendizaje ?? '']);
          });

          const sheet = XLSX.utils.aoa_to_sheet(filas);
          // merges for title
          sheet['!merges'] = [{ s: { r: 0, c: 1 }, e: { r: 0, c: 3 } }];
          const headerRow = 6; // 0-based index of header 'Fecha, Actividad, Resultado...'
          const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:E100');
          const border = { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin', color: { rgb: '000000' } }, left: { style: 'thin', color: { rgb: '000000' } }, right: { style: 'thin', color: { rgb: '000000' } } };
          for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const ref = XLSX.utils.encode_cell({ r: R, c: C });
              if (!sheet[ref]) sheet[ref] = { t: 's', v: '' };
              const cell = sheet[ref];
              if (R === 0) cell.s = { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center', vertical: 'center' }, border };
              else if (R === headerRow) cell.s = { font: { bold: true }, fill: { fgColor: { rgb: 'D9D9D9' } }, alignment: { horizontal: 'center' }, border };
              else cell.s = { font: { name: 'Arial', sz: 10 }, alignment: { horizontal: 'left' }, border };
            }
          }
          sheet['!cols'] = [{ wch: 12 }, { wch: 60 }, { wch: 40 }];

          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, sheet, 'Informe Actividades');
          const nombreArchivo = `INFORME_ACTIVIDADES_${(resp.cabecera?.estudiante ?? 'VINCULACION').replace(/\s+/g, '_')}.xlsx`;
          XLSX.writeFile(wb, nombreArchivo);
        },
        error: (err) => console.error('Error fetching informe actividades:', err)
      });
    }

    exportarInicioTutorExcel(id: number): void {
      this.getProyectoById(id).subscribe({
        next: (proyecto) => {
          // getProyectoById maps reporte; for inicio tutor we have a dedicated endpoint too
          this.http.get<any>(`${BASE_URL}/inicio-tutor/${id}`).subscribe({
            next: (resp) => {
              const filas: any[][] = [];
              filas.push(['', 'INICIO DE ACTIVIDADES - TUTOR', '', '', '']);
              filas.push([]);
              filas.push(['Coordinador:', resp.coordinador ?? 'N/A', '', 'Tutor:', resp.tutor_nombre ?? 'N/A']);
              filas.push(['Cédula tutor:', resp.tutor_cedula ?? 'N/A', '', 'Proyecto:', resp.proyecto_nombre ?? proyecto?.nombre ?? 'N/A']);
              filas.push(['Fecha inicio:', resp.fecha_inicio ?? 'N/A', '', 'Carrera:', resp.carrera ?? 'N/A']);
              filas.push([]);
              filas.push(['Descripción de actividades:']);
              filas.push([resp.descripcion_actividades ?? '']);

              const sheet = XLSX.utils.aoa_to_sheet(filas);
              sheet['!merges'] = [{ s: { r: 0, c: 1 }, e: { r: 0, c: 3 } }, { s: { r: 6, c: 0 }, e: { r: 6, c: 3 } }];
              const border = { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin', color: { rgb: '000000' } }, left: { style: 'thin', color: { rgb: '000000' } }, right: { style: 'thin', color: { rgb: '000000' } } };
              const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:E50');
              for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                  const ref = XLSX.utils.encode_cell({ r: R, c: C });
                  if (!sheet[ref]) sheet[ref] = { t: 's', v: '' };
                  const cell = sheet[ref];
                  if (R === 0) cell.s = { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' }, border };
                  else if (R === 6) cell.s = { font: { name: 'Arial' }, alignment: { horizontal: 'left' }, border };
                  else cell.s = { font: { name: 'Arial' }, alignment: { horizontal: 'left' }, border };
                }
              }
              sheet['!cols'] = [{ wch: 14 }, { wch: 30 }, { wch: 4 }, { wch: 20 }, { wch: 12 }];

              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, sheet, 'Inicio Tutor');
              const nombreArchivo = `INICIO_TUTOR_${(resp.tutor_nombre ?? 'TUTOR').replace(/\s+/g, '_')}.xlsx`;
              XLSX.writeFile(wb, nombreArchivo);
            },
            error: (err) => console.error('Error fetching inicio tutor:', err)
          });
        },
        error: (err) => console.error('Error fetching proyecto for inicio tutor:', err)
      });
    }

    exportarInformeFinalExcel(proyecto: ProyectoVinculacion): void {
      const filas: any[][] = [];
      filas.push(['', 'INFORME FINAL DE VINCULACIÓN', '', '', '']);
      filas.push([]);
      filas.push(['Estudiante:', proyecto.estudiante ?? 'N/A', '', 'Cédula:', 'N/A']);
      filas.push(['Carrera:', proyecto.carrera ?? 'N/A', '', 'Proyecto:', proyecto.nombre ?? 'N/A']);
      filas.push(['Periodo informe:', proyecto.periodo_academico ?? 'N/A']);
      filas.push([]);
      filas.push(['Fecha', 'Descripción actividad', 'Horas cumplidas']);

      (proyecto.actividades ?? []).forEach((a: VinculacionActividad) => {
        filas.push([a.fecha ?? '', a.actividad_realizada ?? '', a.total_horas ?? '']);
      });

      filas.push([]);
      filas.push(['Total horas cumplidas:', proyecto.total_horas ?? 0]);

      const sheet = XLSX.utils.aoa_to_sheet(filas);
      sheet['!merges'] = [{ s: { r: 0, c: 1 }, e: { r: 0, c: 3 } }];
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:C200');
      const border = { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin', color: { rgb: '000000' } }, left: { style: 'thin', color: { rgb: '000000' } }, right: { style: 'thin', color: { rgb: '000000' } } };
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const ref = XLSX.utils.encode_cell({ r: R, c: C });
          if (!sheet[ref]) sheet[ref] = { t: 's', v: '' };
          const cell = sheet[ref];
          if (R === 0) cell.s = { font: { bold: true, sz: 12 }, alignment: { horizontal: 'center' }, border };
          else if (R === 7) cell.s = { font: { bold: true }, fill: { fgColor: { rgb: 'D9D9D9' } }, alignment: { horizontal: 'center' }, border };
          else cell.s = { font: { name: 'Arial' }, alignment: { horizontal: 'left' }, border };
        }
      }
      sheet['!cols'] = [{ wch: 14 }, { wch: 70 }, { wch: 15 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, 'Informe Final');
      const nombreArchivo = `INFORME_FINAL_${(proyecto.estudiante ?? 'VINCULACION').replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);
    }
  } 