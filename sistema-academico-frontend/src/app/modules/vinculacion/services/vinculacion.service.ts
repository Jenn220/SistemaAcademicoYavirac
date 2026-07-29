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

    private mapEstado(estado?: string ): string {
      if (!estado) return 'Desconocido';
      const normalized = estado.toUpperCase();
      if (normalized === 'EN_CURSO' || normalized === 'EN CURSO') return 'En ejecución';
      if (normalized  === 'ACTIVO') return 'Activo';
      if (normalized === 'FINALIZADO') return 'Finalizado';
      return estado;
    }

    getProyectos(): Observable<ProyectoVinculacion[]> {
  return this.http.get<any>(`${BASE_URL}/estudiantes`).pipe(
    map(response => {

      console.log('RESPUESTA BACKEND:', response);

      const items = Array.isArray(response)
        ? response
        : response.data ?? [];

      console.log('ITEMS:', items);

      return items.map((item: any) => ({
        id: Number(item.id_vinculacion),
        nombre: item.nombre_proyecto ?? item.nombre,
        tutor: item.id_docente
          ? `Docente ${item.id_docente}`
          : 'Sin tutor',
        estado: this.mapEstado(item.estado),
        estudiantes: 1,
        descripcion: `Inicio: ${item.fecha_inicio} - Fin: ${item.fecha_fin}`
      }));
    })
  );
}

    createProyecto(payload: CrearProyectoVinculacionPayload): Observable<any> {
  return this.http.post(
    `${BASE_URL}/vinculacion-estudiante`,
    payload
  );
}


getActividadesEstudiante(): Observable<any[]> {
  return this.http.get<any>(
    `${BASE_URL}/actividades/actividades`
  ).pipe(
    map(response => {
      console.log('ACTIVIDADES BACKEND:', response);

      return Array.isArray(response)
        ? response
        : response?.data ?? [];
    }),
    catchError(error => {
      console.error('ERROR ACTIVIDADES:', error);
      return of([]);
    })
  );
}


createActividad(payload: ActividadEstudiantePayload): Observable<any> {
  return this.http.post(
    `${BASE_URL}/actividades/estudiante`,
    payload
  );
}


getAsistenciasTutor(): Observable<any[]> {
  return this.http.get<any>(
    `${BASE_URL}/actividades/asistencia-tutor`
  ).pipe(
    map(response =>
      Array.isArray(response)
        ? response
        : response?.data ?? []
    ),
    catchError(() => of([]))
  );
}


createAsistenciaTutor(payload: AsistenciaTutorPayload): Observable<any> {
  return this.http.post(
    `${BASE_URL}/actividades/asistencia-tutor`,
    payload
  );
}


getInformes(id: number): Observable<any> {
  return this.http.get<any>(
    `${BASE_URL}/reportes/informe-actividades/${id}`
  );
}


createInforme(payload: InformePayload): Observable<any> {
  return this.http.post(
    `${BASE_URL}/reportes/informe`,
    payload
  );
}


getReporteById(id: number): Observable<any> {
  return this.http.get<any>(
    `${BASE_URL}/reportes/asistencia-estudiante/${id}`
  );
}


getActaCompromiso(id: number): Observable<any> {
  return this.http.get<any>(
    `${BASE_URL}/reportes/acta-compromiso/${id}`
  );
}


getReporteAsistenciaTutor(id: number): Observable<any> {
  return this.http.get<any>(
    `${BASE_URL}/reportes/asistencia-tutor/${id}`
  );
}


getInformeActividades(id: number): Observable<any> {
  return this.http.get<any>(
    `${BASE_URL}/reportes/informe-actividades/${id}`
  );
}


getInformeFinal(id: number): Observable<any> {
  return this.http.get<any>(
    `${BASE_URL}/reportes/informe-final/${id}`
  );
}


getCertificado(id: number): Observable<any> {
  return this.http.get<any>(
    `${BASE_URL}/reportes/certificado/${id}`
  );
}


getInicioTutor(id: number): Observable<any> {
  return this.http.get<any>(
    `${BASE_URL}/reportes/inicio-tutor/${id}`
  );
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
        ['', 'INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO YAVIRAC', '', '', '', 'CODIGO', 'DS-040106'],
        ['', 'MACROPROCESO 04 VINCULACION', '', '', '', '', ''],
        ['', 'PROCESO 01 VINCULACION', '', '', '', '', ''],
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
      // 1. Textos reglamentarios completos
      const obligacionesText = 
        "Art. 22.- Obligaciones de los estudiantes de prácticas y vinculación con la sociedad. -\n" +
        "a. Cumplir con las horas exigidas de prácticas pre profesionales o deformación dual y vinculación con la sociedad, dentro del programa curricular de su carrera y la normativa del instituto.\n" +
        "b. Cumplir de forma eficiente, diligente y con calidez, las acciones encomendadas en el área y modalidad de práctica, y vinculación con la sociedad establecida.\n" +
        "c. Conservar una apropiada presentación personal, y de ser el caso utilizar uniforme o la vestimenta de acuerdo a las políticas internas de la entidad receptora o el ISTY.\n" +
        "d. Mantener absoluta reserva sobre toda información interna de la entidad receptora.\n" +
        "e. Demostrar responsabilidad, disciplina, ética y eficiencia durante el desarrollo de sus prácticas o vinculación con la sociedad.\n" +
        "f. Asistir puntualmente a las jornadas establecidas por la entidad receptora o el ISTY.\n" +
        "g. Informar en in máximo de 72 horas al tutor académico y empresarial, cuando por enfermedad o fuerza mayor se vea impedido de asistir a cumplir con su jornada de prácticas o vinculación con la sociedad.\n" +
        "h. Cumplir con las disposiciones enmarcadas por el ISTY, y por la entidad receptora de lo concerniente a su práctica o vinculación con la sociedad.\n" +
        "i. Informar de forma escrita al tutor académico del instituto y de la entidad receptora sobre las novedades que se produzcan en el desempeño de sus tareas, a fin de establecer correctivos necesarios con el fin de ayudar el normal desarrollo de sus actividades.\n" +
        "j. Guardar las debidas consideraciones éticas y humanas todo el personal en las entidades receptoras, tutores académicos, responsables y demás miembros relacionados del área.\n" +
        "k. Presentar al tutor académico, la documentación necesaria para el registro de sus horas cumplidas en actividades de prácticas o vinculación con la sociedad.\n" +
        "l. L. permanecer en la entidad receptora el tiempo determinado según el cronograma elaborado entre la entidad receptora y el ISTY.\n" +
        "m. M. entregar un informe escrito del proyecto donde se evidencia el trabajo ejecutado en las prácticas pre profesionales o formación dual y vinculación con la sociedad.\n" +
        "n. En caso de existir plazas disponibles para la realización de la vinculación con la sociedad el estudiante deberá aceptar dicha plaza; y,\n" +
        "o. Las demás obligaciones que se encuentren establecidas en los convenios individuales pertinentes.";

      const prohibicionesText = 
        "Art 23.- Prohibiciones a los estudiantes. -\n" +
        "a. Crear documentación o circunstancias diferentes a las prácticas o vinculación con la sociedad.\n" +
        "b. Disponer de los servicios, equipos y suministros de la entidad receptora para asuntos personales, salvo en casos de emergencia y previa autorización del responsable.\n" +
        "c. Asistir al lugar de desarrollo de las prácticas o vinculación con la sociedad, bajo influencia la influencia de bebidas alcohólicas y sustancias psicotrópicas.\n" +
        "d. Atender o aceptar visitas de tipo particular dentro de la entidad receptora.\n" +
        "e. Cambiar de turno o encargar a otra persona, la realización de su práctica o vinculación con la sociedad.\n" +
        "f. Abandonar las prácticas o vinculación con la sociedad, sin autorización del tutor académico y empresarial.\n" +
        "g. Promover o participar en actos de indisciplina que alteren el normal funcionamiento de la entidad receptora.\n" +
        "h. Cometer actos que alteren las buenas costumbres y que me atenten contra la salud y contra la seguridad de la entidad receptora o el ISTY.\n" +
        "i. Abandonar las prácticas o vinculación con la sociedad sin justificación.\n" +
        "j. Incumplir con las tareas asignadas en el área o realizar prácticas ajenas a su función.\n" +
        "k. Sustraer bienes, divulgar o copiar información de la entidad receptora; y,\n" +
        "l. Las demás establecidas en las normativas vigentes.";

      const fechaLarga = resp.fecha_larga ?? 'lunes, 20 de octubre de 2025';
      const sancionesText = 
        "El incumplimiento de lo establecido en esta Acta se aplicará el Art. 24 del Reglamento Interno de Prácticas preprofesionales, formación dual y vinculación con la sociedad del ISTY.\n\n" +
        "Una vez que he leído y comprendido las normas a seguir durante el desarrollo de las actividades, en mi calidad de participante, entendiendo que estas son para un beneficio tanto colectivo como individual y procura el bienestar de todos quienes asistimos a estos eventos, me comprometo a seguir dichas recomendaciones y evitar causar cualquier actividad que pusiere en peligro a mi persona como al grupo en general.\n" +
        `Una vez leído y entendido el contenido de la presente Acta, acepto las condiciones del mismo en favor de mi bienestar, para constancia de lo cual lo suscriben en el día ${fechaLarga}.`;

      // 2. Matriz de celdas
      const filas: any[][] = [
        // Header / Banner
        ['', 'INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO YAVIRAC', '', '', '', 'CODIGO', 'DS-040104'],
        ['', 'MACROPROCESO 04 VINCULACIÓN', '', '', '', '', ''],
        ['', 'PROCESO 01 VINCULACIÓN', '', '', '', '', ''],
        ['', 'FORMATO 04 CARTA DE COMPROMISO DEL ESTUDIANTE', '', '', '', '', ''],
        [], 

        // Títulos Principales
        ['INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO "YAVIRAC"'],
        [], 
        ['ACTA COMPROMISO DE PARTICIPACIÓN EN VINCULACIÓN CON LA COMUNIDAD'],
        [], 

        // Datos del estudiante
        ['Yo,', resp.estudiante ?? 'Kevin Josue Alvarado Carrera', '', '', 'con C.I.', resp.cedula ?? '1755432109', 'estudiante del Instituto Superior'],
        ['Tecnológico de Turismo y Patrimonio "YAVIRAC" de la Carrera de', '', '', '', resp.carrera ?? 'Tecnología Superior en Desarrollo de Software', '', 'del tercer nivel'],
        ['quien va a realizar la vinculación con la sociedad en la', '', '', '', resp.entidad_beneficiaria ?? 'Produbanco S.A.', '', ''],
        ['me comprometo a seguir las siguientes recomendaciones:', '', '', '', '', '', ''],

        // Cuadros normativos unidos
        [obligacionesText], 
        [prohibicionesText], 
        [sancionesText],    
        [], 

        // Tabla de firmas estudiante
        ['Estudiante', '', 'Cédula de Indentidad', '', 'Nivel', 'Firma', ''],
        ['', '', '', '', '', '', ''],
        [resp.estudiante ?? 'Kevin Josue Alvarado Carrera', '', resp.cedula ?? '1755432109', '', 'Tercero', '', ''],
        [], 

        // Firma Tutor (Colocada en la columna B para mantener un ancho estándar)
        ['En constancia:'], 
        [], [], 
        ['', resp.docente_tutor ?? 'Ana Maria Pazmiño Cevallos'], 
        ['', 'DOCENTE TUTOR'] 
      ];

      const sheet = XLSX.utils.aoa_to_sheet(filas);

      // 3. Merges de celdas
      sheet['!merges'] = [
        // Banner
        { s: { r: 0, c: 1 }, e: { r: 0, c: 4 } },
        { s: { r: 1, c: 1 }, e: { r: 1, c: 4 } },
        { s: { r: 2, c: 1 }, e: { r: 2, c: 4 } },
        { s: { r: 3, c: 1 }, e: { r: 3, c: 4 } },
        { s: { r: 0, c: 5 }, e: { r: 3, c: 5 } },
        { s: { r: 0, c: 6 }, e: { r: 3, c: 6 } },

        // Títulos
        { s: { r: 5, c: 0 }, e: { r: 5, c: 6 } },
        { s: { r: 7, c: 0 }, e: { r: 7, c: 6 } },

        // Datos del estudiante
        { s: { r: 9, c: 1 }, e: { r: 9, c: 3 } },
        { s: { r: 10, c: 0 }, e: { r: 10, c: 3 } },
        { s: { r: 10, c: 4 }, e: { r: 10, c: 5 } },
        { s: { r: 11, c: 0 }, e: { r: 11, c: 3 } },
        { s: { r: 11, c: 4 }, e: { r: 11, c: 6 } },
        { s: { r: 12, c: 0 }, e: { r: 12, c: 6 } },

        // Cajas normativas
        { s: { r: 13, c: 0 }, e: { r: 13, c: 6 } },
        { s: { r: 14, c: 0 }, e: { r: 14, c: 6 } },
        { s: { r: 15, c: 0 }, e: { r: 15, c: 6 } },

        // Tabla de firmas estudiante
        { s: { r: 17, c: 0 }, e: { r: 18, c: 1 } },
        { s: { r: 17, c: 2 }, e: { r: 18, c: 3 } },
        { s: { r: 17, c: 4 }, e: { r: 18, c: 4 } },
        { s: { r: 17, c: 5 }, e: { r: 18, c: 6 } },

        { s: { r: 19, c: 0 }, e: { r: 19, c: 1 } },
        { s: { r: 19, c: 2 }, e: { r: 19, c: 3 } },
        { s: { r: 19, c: 4 }, e: { r: 19, c: 4 } },
        { s: { r: 19, c: 5 }, e: { r: 19, c: 6 } },

        // Firma Docente Tutor (AJUSTADO: únicamente abarca de columna B a C para controlar la longitud de la línea)
        { s: { r: 24, c: 1 }, e: { r: 24, c: 2 } },
        { s: { r: 25, c: 1 }, e: { r: 25, c: 2 } }
      ];

      // 4. Estilos y Formato
      const borderThin = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      };

      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:G30');

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const ref = XLSX.utils.encode_cell({ r: R, c: C });
          if (!sheet[ref]) sheet[ref] = { t: 's', v: '' };
          const cell = sheet[ref];
          cell.s = cell.s || {};

          // Banner Superior
          if (R <= 3) {
            let bgColor = 'FFFFFF';
            let textColor = '000000';
            if (R === 0 && C >= 1 && C <= 4) { bgColor = '006699'; textColor = 'FFFFFF'; }
            if (R === 2 && C >= 1 && C <= 4) { bgColor = 'E36C09'; textColor = 'FFFFFF'; }
            if (R === 1 || R === 3) { bgColor = 'F2F2F2'; }

            cell.s = {
              font: { bold: true, name: 'Arial', sz: C >= 5 ? 8 : 9, color: { rgb: textColor } },
              fill: { fgColor: { rgb: bgColor } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              border: borderThin
            };
          }
          // Títulos
          else if (R === 5 || R === 7) {
            cell.s = {
              font: { bold: true, name: 'Arial', sz: 11 },
              alignment: { horizontal: 'center', vertical: 'center' }
            };
          }
          // Cajas normativas
          else if (R === 13 || R === 14 || R === 15) {
            cell.s = {
              font: { name: 'Arial', sz: 8 },
              alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
              border: borderThin
            };
          }
          // Tabla de firmas estudiante
          else if (R >= 17 && R <= 19) {
            const isHeader = R <= 18;
            cell.s = {
              font: { bold: isHeader, name: 'Arial', sz: 9 },
              fill: isHeader ? { fgColor: { rgb: 'D9D9D9' } } : undefined,
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              border: borderThin
            };
          }
          // Firma del Docente Tutor (Línea de firma acotada a las celdas B24:C24)
          else if (R === 24 && (C === 1 || C === 2)) {
            cell.s = {
              font: { bold: true, name: 'Arial', sz: 9 },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: { top: { style: 'thin', color: { rgb: '000000' } } }
            };
          } else if (R === 25 && (C === 1 || C === 2)) {
            cell.s = {
              font: { bold: true, name: 'Arial', sz: 9 },
              alignment: { horizontal: 'center', vertical: 'center' }
            };
          }
        }
      }

      // 5. Dimensiones de columnas y filas
      sheet['!cols'] = [
        { wch: 10 }, { wch: 32 }, { wch: 10 }, { wch: 18 }, { wch: 38 }, { wch: 15 }, { wch: 20 }
      ];

      sheet['!rows'] = [
        { hpt: 20 }, { hpt: 20 }, { hpt: 20 }, { hpt: 20 }, {},
        { hpt: 22 }, {}, { hpt: 22 }, {},
        { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 18 },
        { hpt: 210 }, { hpt: 170 }, { hpt: 100 }, {},
        { hpt: 16 }, { hpt: 16 }, { hpt: 20 }, {},
        { hpt: 18 }, {}, {}, { hpt: 20 }, { hpt: 18 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, 'Carta de Compromiso');
      const nombreArchivo = `ACTA_COMPROMISO_${(resp.estudiante ?? 'VINCULACION').replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);
    },
    error: (err) => console.error('Error al descargar el acta:', err)
  });
}

exportarCertificadoExcel(id: number): void {
  this.getCertificado(id).subscribe({
    next: (resp: any) => {
      // 1. Extraer datos del Backend
      const estudiante = resp.estudiante ?? resp.nombre_estudiante ?? 'Kevin Smith Nivesela Armijos';
      const cedula = resp.cedula ?? resp.cedula_estudiante ?? '2250022114';
      const carrera = resp.carrera ?? resp.nombre_carrera ?? 'Desarrollo de Software';
      const proyecto = resp.proyecto ?? resp.nombre_proyecto ?? 'Alfabetizacion Digital';
      const fechaEmision = resp.fecha_emision ?? resp.fecha_actual ?? 'Quito, 29 de julio de 2026';
      const fechaInicio = resp.fecha_inicio ?? '1 de mayo de 2026';
      const fechaFin = resp.fecha_fin ?? '30 de junio de 2026';
      const totalHoras = resp.total_horas ?? resp.horas ?? '8.00';
      const representante = resp.representante ?? resp.nombre_representante ?? 'BARRIGA OLIVO SUSAN JACQUELINE';
      const institucion = resp.institucion ?? resp.nombre_institucion ?? 'TechCorp S.A.';

      // Total de columnas usadas: 6 (A, B, C, D, E, F) para dar la anchura exacta de una página A4/Carta
      const filas: any[][] = [
        ['', '', '', '', '', ''], // R0
        ['CERTIFICADO DE VINCULACION CON LA COMUNIDAD', '', '', '', '', ''], // R1: Título exacto
        ['', '', '', '', '', ''], // R2
        ['', '', '', '', '', fechaEmision], // R3: Fecha alineada a la derecha
        ['', '', '', '', '', ''], // R4
        
        // PÁRRAFO 1: Dividido de forma natural en 4 líneas a ancho completo
        [`Por medio de la presente dejo constancia que  ${estudiante}`, '', '', '', '', ''], // R5
        [`con C.I.:     ${cedula}     estudiante de la carrera de     ${carrera}`, '', '', '', '', ''], // R6
        ['del Instituto Superior Tecnológico de Turismo y Patrimonio "YAVIRAC"     desempeñó las actividades', '', '', '', '', ''], // R7
        ['y tareas establecidas en la planificación del proyecto:', '', '', '', '', ''], // R8
        
        ['', '', '', '', '', ''], // R9
        [proyecto, '', '', '', '', ''], // R10: Nombre del Proyecto Centrado
        ['', '', '', '', '', ''], // R11
        
        // PÁRRAFO 2
        [`propuesto para esta comunidad, desde     ${fechaInicio}     hasta el`, '', '', '', '', ''], // R12
        [`${fechaFin}     acumulando un total de ${totalHoras} horas de vinculación social, demostrando en`, '', '', '', '', ''], // R13
        ['todo momento responsabilidad, capacidad y entusiasmo en el desarrollo de las labores encomendadas.', '', '', '', '', ''], // R14
        
        ['', '', '', '', '', ''], // R15
        ['Atentamente,', '', '', '', '', ''], // R16
        ['', '', '', '', '', ''], // R17
        ['', '', '', '', '', ''], // R18
        ['', '', '', '', '', ''], // R19
        
        // FIRMA (Centrada en las columnas centrales B a E)
        ['', representante, '', '', '', ''], // R20
        ['', institucion, '', '', '', ''],   // R21
        ['', 'REPRESENTANTE', '', '', '', ''] // R22
      ];

      const sheet = XLSX.utils.aoa_to_sheet(filas);

      // 2. DESACTIVAR LA CUADRÍCULA DE EXCEL (Hoja limpia en blanco)
      sheet['!views'] = [{ showGridLines: false }];

      // 3. COMBINACIÓN DE CELDAS PARA GARANTIZAR CENTRADO PERFECTO
      sheet['!merges'] = [
        // Título Principal Centrado (Col A a F)
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
        
        // Párrafos (Col A a F cada línea)
        { s: { r: 5, c: 0 }, e: { r: 5, c: 5 } },
        { s: { r: 6, c: 0 }, e: { r: 6, c: 5 } },
        { s: { r: 7, c: 0 }, e: { r: 7, c: 5 } },
        { s: { r: 8, c: 0 }, e: { r: 8, c: 5 } },
        
        // Nombre del Proyecto Centrado (Col A a F)
        { s: { r: 10, c: 0 }, e: { r: 10, c: 5 } },
        
        // Párrafo 2 (Col A a F cada línea)
        { s: { r: 12, c: 0 }, e: { r: 12, c: 5 } },
        { s: { r: 13, c: 0 }, e: { r: 13, c: 5 } },
        { s: { r: 14, c: 0 }, e: { r: 14, c: 5 } },
        
        // Firma (Centrada entre Col B y Col D)
        { s: { r: 20, c: 1 }, e: { r: 20, c: 3 } },
        { s: { r: 21, c: 1 }, e: { r: 21, c: 3 } },
        { s: { r: 22, c: 1 }, e: { r: 22, c: 3 } }
      ];

      // 4. ANCHOS DE COLUMNAS SIMÉTRICOS (Para simular una hoja tamaño Carta)
      sheet['!cols'] = [
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 }
      ];

      // Borde superior para la línea de la firma
      const borderTopFirma = {
        top: { style: 'medium', color: { rgb: '000000' } }
      };

      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:F23');

      // 5. ESTILOS Y FORMATOS
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const ref = XLSX.utils.encode_cell({ r: R, c: C });
          if (!sheet[ref]) sheet[ref] = { t: 's', v: '' };
          const cell = sheet[ref];

          // Estilo general base
          cell.s = {
            font: { name: 'Arial', sz: 10 },
            alignment: { horizontal: 'left', vertical: 'center' }
          };

          // TÍTULO: CERTIFICADO DE VINCULACIÓN CON LA COMUNIDAD (Centrado + Negrita)
          if (R === 1) {
            cell.s = {
              font: { bold: true, name: 'Arial', sz: 12 },
              alignment: { horizontal: 'center', vertical: 'center' }
            };
          }
          // FECHA EMISIÓN (Alineada a la derecha)
          else if (R === 3 && C === 5) {
            cell.s = {
              font: { name: 'Arial', sz: 10 },
              alignment: { horizontal: 'right', vertical: 'center' }
            };
          }
          // PÁRRAFOS DE TEXTO
          else if ((R >= 5 && R <= 8) || (R >= 12 && R <= 14)) {
            cell.s = {
              font: { name: 'Arial', sz: 10 },
              alignment: { horizontal: 'left', vertical: 'center' }
            };
          }
          // PROYECTO (Centrado + Negrita)
          else if (R === 10) {
            cell.s = {
              font: { bold: true, name: 'Arial', sz: 11 },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
            };
          }
          // FIRMA REPRESENTANTE (Línea de firma + Centrado + Negrita)
          else if (R >= 20 && R <= 22 && C === 1) {
            cell.s = {
              font: { bold: true, name: 'Arial', sz: 9 },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: R === 20 ? borderTopFirma : undefined
            };
          }
        }
      }

      // 6. GENERAR Y DESCARGAR
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, 'Certificado');
      const nombreLimpio = (estudiante ?? 'VINCULACION').replace(/\s+/g, '_');
      XLSX.writeFile(wb, `CERTIFICADO_${nombreLimpio}.xlsx`);
    },
    error: (err) => console.error('Error al exportar el certificado:', err)
  });
}

    exportarInformeActividadesExcel(id: number): void {
  this.getInformeActividades(id).subscribe({
    next: (resp: any) => {
      const cabecera = resp.cabecera || {};
      const actividades = resp.informe_actividades || [];
      const temaProyecto = resp.tema_proyecto || cabecera.titulo_proyecto || 'ACTUALIZACIÓN, Y MEJORA DEL SISTEMA WEB...';
      const reflexiones = resp.reflexion || 'Los estudiantes desarrollaron algunas habilidades blandas como: comunicación en equipo, coordinación de actividades, planificación de actividades';
      const avanceSecciones = resp.avance_secciones || [
        { sec: '1. Título del Proyecto (10%)', pct: '10%' },
        { sec: '2. Antecedentes (10%)', pct: '10%' },
        { sec: '3. Marco Teórico (10%)', pct: '10%' },
        { sec: '4. Metodología (10%)', pct: '10%' },
        { sec: '5. Resultados (10%)', pct: '10%' },
        { sec: '6. Conclusiones y recomendaciones (10%)', pct: '10%' },
        { sec: '7. Referencias bibliográficas (10%)', pct: '10%' },
        { sec: '8. Anexos (10%)', pct: '10%' },
        { sec: '9. Entrega de proyecto final (20%)', pct: '20%' }
      ];

      const filas: any[][] = [];

      // --- FILAS 0 a 3: ENCABEZADO INSTITUCIONAL ---
      filas.push(['', 'INSTITUTO SUPERIOR TECNOLÓGICO DE TURISMO Y PATRIMONIO YAVIRAC', '', '', 'CÓDIGO', 'DS-040108']);
      filas.push(['', 'MACROPROCESO 04 VINCULACIÓN', '', '', '', '']);
      filas.push(['', 'PROCESO 01 VINCULACIÓN', '', '', '', '']);
      filas.push(['', 'FORMATO 08 PLAN DE APRENDIZAJE Y SEGUIMIENTO', '', '', '', '']);

      // --- FILAS 4 a 9: DATOS GENERALES ---
      filas.push(['FUNDACIÓN :', cabecera.fundacion ?? 'FUNDACION NACIONAL DE PARALISIS CEREBRAL FUNAPACE', '', '', 'NIVEL:', cabecera.nivel ?? 'Tercero']);
      filas.push(['ESTUDIANTE:', cabecera.estudiante ?? 'N/A', '', '', 'CÉDULA:', cabecera.cedula ?? 'N/A']);
      filas.push(['ASIGNATURA 1', cabecera.asignatura1 ?? 'PROGRAMACIÓN WEB TRABAJO DE INTEGRACIÓN CURRICULAR', '', '', 'CICLO ACADÉMICO:', cabecera.ciclo_academico ?? '2025 - 2']);
      filas.push(['ASIGNATURA 2', cabecera.asignatura2 ?? 'FUNDAMENTOS DE REDES Y TELECOMUNICACIONES', '', '', 'INICIA:', cabecera.fecha_inicio ?? '20/10/2025']);
      filas.push(['DOCENTE TUTOR:', cabecera.docente_tutor ?? 'Ing. Byron Moreno M', '', '', 'FINALIZA:', cabecera.fecha_fin ?? '24/11/2025']);

      // --- FILA 9: TÍTULO SECCIÓN ACTIVIDADES ---
      filas.push(['', 'INFORME DE LA ACTIVIDADES', '', '', '', '']);

      // --- FILA 10: ENCABEZADOS DE LA TABLA DE ACTIVIDADES ---
      filas.push(['SEMANA', 'FECHA', 'ACTIVIDADES', 'RESULTADOS DEL APRENDIZAJE', '', 'FIRMA DOCENTE TUTOR']);

      // --- FILAS DE ACTIVIDADES ---
      actividades.forEach((a: any, idx: number) => {
        filas.push([
          a.semana ?? (idx + 1),
          a.fecha ?? '',
          a.actividad ?? '',
          a.resultado_aprendizaje ?? '',
          '', // Columna auxiliar para el merge
          ''  // Firma Docente Tutor
        ]);
      });

      // --- SECCIÓN DE REFLEXIÓN ---
      const idxReflexion = filas.length;
      filas.push([
        'Reflexión sobre el aprendizaje alcanzado de las actividades realizadas :',
        reflexiones,
        '', '', '', ''
      ]);

      // Línea en blanco de separación
      filas.push([]);

      // --- SECCIÓN DE AVANCE DEL PROYECTO ---
      const idxAvanceHeader = filas.length;
      filas.push(['TEMA', 'SECCIONES DEL PROYECTO', '', '', 'Avance', '']);

      avanceSecciones.forEach((sec: any, i: number) => {
        filas.push([
          i === 0 ? temaProyecto : '',
          sec.sec,
          '', '',
          sec.pct,
          ''
        ]);
      });

      // Fila Total Avance
      const idxTotalAvance = filas.length;
      filas.push(['', 'Total', '', '', '100%', '']);

      // Generar hoja desde arreglos
      const sheet = XLSX.utils.aoa_to_sheet(filas);

      // --- FUSIONES DE CELDAS (MERGES) ---
      sheet['!merges'] = [
        // Encabezado principal
        { s: { r: 0, c: 1 }, e: { r: 0, c: 3 } }, // Nombre Instituto
        { s: { r: 1, c: 1 }, e: { r: 1, c: 3 } }, // Macroproceso
        { s: { r: 2, c: 1 }, e: { r: 2, c: 3 } }, // Proceso
        { s: { r: 3, c: 1 }, e: { r: 3, c: 3 } }, // Formato
        { s: { r: 0, c: 4 }, e: { r: 3, c: 4 } }, // Título CÓDIGO
        { s: { r: 0, c: 5 }, e: { r: 3, c: 5 } }, // Valor Código (DS-040108)

        // Datos Generales
        { s: { r: 4, c: 1 }, e: { r: 4, c: 3 } }, // Fundación
        { s: { r: 5, c: 1 }, e: { r: 5, c: 3 } }, // Estudiante
        { s: { r: 6, c: 1 }, e: { r: 6, c: 3 } }, // Asignatura 1
        { s: { r: 7, c: 1 }, e: { r: 7, c: 3 } }, // Asignatura 2
        { s: { r: 8, c: 1 }, e: { r: 8, c: 3 } }, // Docente Tutor

        // Título Informe de Actividades
        { s: { r: 9, c: 0 }, e: { r: 9, c: 5 } },

        // Encabezados Actividades (Merge en Resultado Aprendizaje col C y D)
        { s: { r: 10, c: 3 }, e: { r: 10, c: 4 } }
      ];

      // Merges dinámicos para filas de actividades
      let rowStartAct = 11;
      actividades.forEach((_: any, i: number) => {
        const r = rowStartAct + i;
        sheet['!merges']?.push({ s: { r: r, c: 3 }, e: { r: r, c: 4 } });
      });

      // Merge Reflexión
      sheet['!merges']?.push({ s: { r: idxReflexion, c: 1 }, e: { r: idxReflexion, c: 5 } });

      // Merges Tabla Avance
      sheet['!merges']?.push(
        { s: { r: idxAvanceHeader, c: 1 }, e: { r: idxAvanceHeader, c: 3 } },
        { s: { r: idxAvanceHeader, c: 0 }, e: { r: idxAvanceHeader + avanceSecciones.length, c: 0 } }, // Columna Tema vertical
        { s: { r: idxTotalAvance, c: 1 }, e: { r: idxTotalAvance, c: 3 } }
      );

      for (let i = 0; i < avanceSecciones.length; i++) {
        const r = idxAvanceHeader + 1 + i;
        sheet['!merges']?.push({ s: { r: r, c: 1 }, e: { r: r, c: 3 } });
      }

      // --- ANCHO DE COLUMNAS ---
      sheet['!cols'] = [
        { wch: 10 }, // A: Semana / Etiquetas
        { wch: 15 }, // B: Fecha / Datos
        { wch: 45 }, // C: Actividades
        { wch: 45 }, // D: Resultado Aprendizaje
        { wch: 15 }, // E: Avance / Ciclo / Cédula
        { wch: 22 }  // F: Firma Tutor / Código
      ];

      // --- ESTILOS Y BORDES ---
      const borderThin = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      };

      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:F50');

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const ref = XLSX.utils.encode_cell({ r: R, c: C });
          if (!sheet[ref]) sheet[ref] = { t: 's', v: '' };
          const cell = sheet[ref];

          // Aplicar borde por defecto a la estructura activa
          if (R <= idxTotalAvance) {
            cell.s = { ...cell.s, border: borderThin, font: { name: 'Arial', sz: 9 } };
          }

          // Estilo Encabezado Institucional
          if (R === 0 && C === 1) {
            cell.s = { font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '1F497D' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderThin };
          }
          if ((R === 1 || R === 2) && C === 1) {
            cell.s = { font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: 'ED7D31' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderThin };
          }
          if (R === 3 && C === 1) {
            cell.s = { font: { bold: true, sz: 9 }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderThin };
          }

          // Estilo Datos Generales (Etiquetas)
          if (R >= 4 && R <= 8 && (C === 0 || C === 4)) {
            cell.s = { font: { bold: true, sz: 8 }, fill: { fgColor: { rgb: 'EAEAEA' } }, alignment: { horizontal: 'left', vertical: 'center' }, border: borderThin };
          }

          // Título 'INFORME DE LA ACTIVIDADES'
          if (R === 9) {
            cell.s = { font: { bold: true, sz: 10 }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderThin };
          }

          // Cabecera Tabla Actividades
          if (R === 10) {
            cell.s = { font: { bold: true, sz: 8 }, fill: { fgColor: { rgb: 'D9D9D9' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: borderThin };
          }

          // Filas de Datos de Actividades
          if (R >= 11 && R < idxReflexion) {
            cell.s = {
              font: { sz: 9 },
              alignment: { horizontal: C === 0 || C === 1 ? 'center' : 'left', vertical: 'center', wrapText: true },
              border: borderThin
            };
          }

          // Sección Reflexión
          if (R === idxReflexion) {
            if (C === 0) {
              cell.s = { font: { bold: true, sz: 8 }, fill: { fgColor: { rgb: 'EAEAEA' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: borderThin };
            } else {
              cell.s = { font: { sz: 9 }, alignment: { horizontal: 'left', vertical: 'center', wrapText: true }, border: borderThin };
            }
          }

          // Tabla Avance Proyecto
          if (R === idxAvanceHeader) {
            cell.s = { font: { bold: true, sz: 9 }, fill: { fgColor: { rgb: 'D9D9D9' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderThin };
          }
          if (R > idxAvanceHeader && R < idxTotalAvance) {
            if (C === 0) {
              cell.s = { font: { bold: true, sz: 8 }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: borderThin };
            } else if (C === 1) {
              cell.s = { font: { sz: 8 }, alignment: { horizontal: 'left', vertical: 'center' }, border: borderThin };
            } else if (C === 4) {
              cell.s = { font: { sz: 8 }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderThin };
            }
          }
          if (R === idxTotalAvance) {
            cell.s = { font: { bold: true, sz: 9 }, fill: { fgColor: { rgb: 'EAEAEA' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderThin };
          }
        }
      }

      // Guardar Libro Excel
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, 'Plan y Seguimiento');
      const nombreArchivo = `FORMATO_08_PLAN_APRENDIZAJE_${(cabecera.estudiante ?? 'VINCULACION').replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);
    },
    error: (err) => console.error('Error al obtener el informe de actividades:', err)
  });
}

  exportarInicioTutorExcel(proyecto: any): void {
  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = {};
  ws['!views'] = [{ showGridLines: true }];

  // Estilos
  const borderThin = {
    top: { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } }
  };

  const borderBottomLine = {
    bottom: { style: 'medium', color: { rgb: '000000' } }
  };

  const fillBlue = { fgColor: { rgb: '1B4079' } };
  const fillOrange = { fgColor: { rgb: 'ED7D31' } };
  const fillGrayHeader = { fgColor: { rgb: 'D9D9D9' } };

  const fontWhiteBold = { name: 'Arial', sz: 9, bold: true, color: { rgb: 'FFFFFF' } };
  const fontBold = { name: 'Arial', sz: 9, bold: true };
  const fontNormal = { name: 'Arial', sz: 9 };
  const fontTitle = { name: 'Arial', sz: 11, bold: true };

  const alignCenter = { horizontal: 'center', vertical: 'center', wrapText: true };
  const alignLeft = { horizontal: 'left', vertical: 'center', wrapText: true };
  const alignRight = { horizontal: 'right', vertical: 'center', wrapText: true };

  const merges: XLSX.Range[] = [];

  const setCell = (r: number, c: number, val: any, font = fontNormal, align = alignLeft, border: any = borderThin, fill?: any) => {
    const ref = XLSX.utils.encode_cell({ r, c });
    const cell: XLSX.CellObject = { t: typeof val === 'number' ? 'n' : 's', v: val ?? '' };
    cell.s = { font, alignment: align };
    if (border) cell.s.border = border;
    if (fill) cell.s.fill = fill;
    ws[ref] = cell;
  };

  const applyStyleToRange = (r1: number, c1: number, r2: number, c2: number, font = fontNormal, align = alignLeft, fill?: any, border: any = borderThin) => {
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        const ref = XLSX.utils.encode_cell({ r, c });
        if (!ws[ref]) ws[ref] = { t: 's', v: '' };
        ws[ref].s = { font, alignment: align, border: border };
        if (fill) ws[ref].s.fill = fill;
      }
    }
    merges.push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
  };

  // Helper para limpiar tildes y enes por seguridad
  const cleanStr = (str: string): string => {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/Ñ/g, 'N');
  };

  // 1. ENCABEZADO SUPERIOR (R0:R3) - Sin tildes
  setCell(0, 0, 'INSTITUTO SUPERIOR TECNOLOGICO DE TURISMO Y PATRIMONIO YAVIRAC', fontWhiteBold, alignCenter, borderThin, fillBlue);
  setCell(1, 0, 'MACROPROCESO 04 VINCULACION', fontBold, alignCenter, borderThin);
  setCell(2, 0, 'PROCESO 01 VINCULACION', fontWhiteBold, alignCenter, borderThin, fillOrange);
  setCell(3, 0, 'FORMATO 07 REGISTRO DE ASISTENCIA DEL TUTOR', fontBold, alignCenter, borderThin);
  setCell(0, 4, 'CODIGO: DS-040107', fontBold, alignCenter, borderThin);

  applyStyleToRange(0, 0, 0, 3, fontWhiteBold, alignCenter, fillBlue);
  applyStyleToRange(1, 0, 1, 3, fontBold, alignCenter);
  applyStyleToRange(2, 0, 2, 3, fontWhiteBold, alignCenter, fillOrange);
  applyStyleToRange(3, 0, 3, 3, fontBold, alignCenter);
  applyStyleToRange(0, 4, 3, 4, fontBold, alignCenter);

  // 2. TITULO CENTRAL INSTITUCIONAL (R5:R7)
  setCell(5, 0, 'INSTITUTO SUPERIOR TECNOLOGICO DE TURISMO Y PATRIMONIO "YAVIRAC"', fontTitle, alignCenter, null);
  setCell(6, 0, 'Direccion: Garcia Moreno S-435 y Ambato', fontNormal, alignCenter, null);
  setCell(7, 0, 'Quito - Ecuador', fontNormal, alignCenter, null);
  merges.push({ s: { r: 5, c: 0 }, e: { r: 5, c: 4 } });
  merges.push({ s: { r: 6, c: 0 }, e: { r: 6, c: 4 } });
  merges.push({ s: { r: 7, c: 0 }, e: { r: 7, c: 4 } });

  // 3. DATOS GENERALES (Carrera, Institucion, Tutor, Periodo)
  setCell(9, 0, 'Carrera:', fontBold, alignLeft, borderThin, fillGrayHeader);
  setCell(9, 3, 'Institucion:', fontBold, alignLeft, borderThin, fillGrayHeader);
  applyStyleToRange(9, 0, 9, 2, fontBold, alignLeft, fillGrayHeader);
  applyStyleToRange(9, 3, 9, 4, fontBold, alignLeft, fillGrayHeader);

  const carreraTxt = cleanStr(proyecto?.carrera || 'DESARROLLO DE SOFTWARE');
  const institucionTxt = cleanStr(proyecto?.entidad_beneficiaria || 'FUNDACION NACIONAL DE PARALISIS CEREBRAL FUNAPACE');
  setCell(10, 0, carreraTxt, fontNormal, alignLeft);
  setCell(10, 3, institucionTxt, fontNormal, alignLeft);
  applyStyleToRange(10, 0, 10, 2);
  applyStyleToRange(10, 3, 10, 4);

  setCell(11, 0, 'Docente Tutor:', fontBold, alignLeft, borderThin, fillGrayHeader);
  setCell(11, 3, 'Periodo Academico:', fontBold, alignLeft, borderThin, fillGrayHeader);
  applyStyleToRange(11, 0, 11, 2, fontBold, alignLeft, fillGrayHeader);
  applyStyleToRange(11, 3, 11, 4, fontBold, alignLeft, fillGrayHeader);

  const tutorTxt = cleanStr(proyecto?.docente_tutor || 'Ing. Byron Moreno M');
  const periodoTxt = cleanStr(proyecto?.periodo_academico || '2025 - 2');
  setCell(12, 0, tutorTxt, fontNormal, alignLeft);
  setCell(12, 3, periodoTxt, fontNormal, alignCenter);
  applyStyleToRange(12, 0, 12, 2);
  applyStyleToRange(12, 3, 12, 4, fontNormal, alignCenter);

  // 4. TABLA DE ASISTENCIA (R13)
  setCell(13, 0, 'FECHA', fontBold, alignCenter, borderThin, fillGrayHeader);
  setCell(13, 1, 'HORA DE ENTRADA', fontBold, alignCenter, borderThin, fillGrayHeader);
  setCell(13, 2, 'HORA DE SALIDA', fontBold, alignCenter, borderThin, fillGrayHeader);
  setCell(13, 3, 'TOTAL HORAS', fontBold, alignCenter, borderThin, fillGrayHeader);
  setCell(13, 4, 'ACTIVIDAD REALIZADA', fontBold, alignCenter, borderThin, fillGrayHeader);

  let cRow = 14;
  const listaAsistencias = proyecto?.asistencia_tutor || proyecto?.actividades || [];

  if (listaAsistencias.length > 0) {
    listaAsistencias.forEach((ast: any) => {
      setCell(cRow, 0, cleanStr(ast.fecha || ''), fontNormal, alignCenter);
      setCell(cRow, 1, cleanStr(ast.hora_entrada || ast.entrada || '16:00'), fontNormal, alignCenter);
      setCell(cRow, 2, cleanStr(ast.hora_salida || ast.salida || '18:00'), fontNormal, alignCenter);
      
      const totalH = ast.total_horas || ast.horas || '2:00';
      setCell(cRow, 3, typeof totalH === 'number' ? `${totalH}:00` : cleanStr(totalH), fontNormal, alignCenter);
      setCell(cRow, 4, cleanStr(ast.actividad_realizada || ast.actividad || ''), fontNormal, alignLeft);
      cRow++;
    });
  } else {
    // Ejemplo por defecto idéntico a tu imagen
    const demoData = [
      { f: '20/10/2025', e: '16:00', s: '18:00', h: '2:00', a: 'Reunion inicial, acompanamiento a los estudiantes e indicaciones generales' },
      { f: '27/10/2025', e: '13:00', s: '15:00', h: '2:00', a: 'Coordinacion del trabajo y planificacion de ejecucion' },
      { f: '03/11/2025', e: '16:00', s: '18:00', h: '2:00', a: 'Seguimiento del plan de trabajo y retroalimentacion' },
      { f: '10/11/2025', e: '13:00', s: '15:00', h: '2:00', a: 'Revision de avances y documentacion' },
      { f: '17/11/2025', e: '14:00', s: '18:00', h: '4:00', a: 'Revision de documentacion' },
      { f: '24/11/2025', e: '13:00', s: '16:00', h: '3:00', a: 'Entrega del producto, revision de mejoras y acompanamiento a los estudiantes' }
    ];
    demoData.forEach(item => {
      setCell(cRow, 0, item.f, fontNormal, alignCenter);
      setCell(cRow, 1, item.e, fontNormal, alignCenter);
      setCell(cRow, 2, item.s, fontNormal, alignCenter);
      setCell(cRow, 3, item.h, fontNormal, alignCenter);
      setCell(cRow, 4, item.a, fontNormal, alignLeft);
      cRow++;
    });
  }

  // Fila TOTAL HORA (Alineado a la derecha en la columna de SALIDA)
  setCell(cRow, 2, 'TOTAL HORA', fontBold, alignRight, null);
  setCell(cRow, 3, '15:00:00', fontBold, alignCenter, borderThin);
  cRow += 2;

  // 5. CAJA DE OBSERVACIONES (Borde rectangular completo alrededor)
  const obsTitleRow = cRow;
  const obsVal = cleanStr(proyecto?.observaciones || 'Ninguna');
  setCell(obsTitleRow, 0, `Observaciones: ${obsVal}`, fontNormal, alignLeft, null);
  
  const obsStartRow = cRow;
  const obsEndRow = cRow + 4;
  applyStyleToRange(obsStartRow, 0, obsEndRow, 4, fontNormal, alignLeft, null, borderThin);
  
  cRow = obsEndRow + 3;

  // 6. SECCION DE FIRMA (Linea superior + Nombre + Cargo)
  setCell(cRow, 0, '', fontNormal, alignLeft, borderBottomLine);
  applyStyleToRange(cRow, 0, cRow, 1, fontNormal, alignLeft, null, borderBottomLine);
  cRow++;

  const coordNombre = cleanStr(proyecto?.coordinador || 'Ing. Raul Paez');
  setCell(cRow, 0, coordNombre, fontBold, alignLeft, null);
  cRow++;
  setCell(cRow, 0, 'COORDINADOR DE CARRERA', fontBold, alignLeft, null);

  // Configuraciones Finales del Sheet
  ws['!merges'] = merges;
  ws['!cols'] = [
    { wch: 14 }, // Fecha
    { wch: 16 }, // Hora Entrada
    { wch: 16 }, // Hora Salida
    { wch: 14 }, // Total Horas
    { wch: 65 }  // Actividad Realizada
  ];
  ws['!ref'] = `A1:E${cRow + 2}`;

  XLSX.utils.book_append_sheet(wb, ws, 'Formato 07');

  const fileNombre = cleanStr(proyecto?.estudiante || 'VINCULACION').replace(/\s+/g, '_').toUpperCase();
  XLSX.writeFile(wb, `REGISTRO_ASISTENCIA_TUTOR_${fileNombre}.xlsx`);
}

exportarInformeFinalExcel(proyecto: any): void {
    const wb = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = {};
    ws['!views'] = [{ showGridLines: true }];

    // ------------------ ESTILOS REUTILIZABLES ------------------
    const borderThin = {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    };

    const fillBlue = { fgColor: { rgb: '1B4079' } };       // Azul Institucional
    const fillOrange = { fgColor: { rgb: 'ED7D31' } };     // Naranja Institucional
    const fillGrayHeader = { fgColor: { rgb: 'D9D9D9' } }; // Gris Cabeceras
    const fillLightGray = { fgColor: { rgb: 'F2F2F2' } };  // Gris Claro

    const fontWhiteBold = { name: 'Arial', sz: 9, bold: true, color: { rgb: 'FFFFFF' } };
    const fontBold = { name: 'Arial', sz: 9, bold: true };
    const fontNormal = { name: 'Arial', sz: 9 };
    const fontTitle = { name: 'Arial', sz: 11, bold: true };

    const alignCenter = { horizontal: 'center', vertical: 'center', wrapText: true };
    const alignLeft = { horizontal: 'left', vertical: 'center', wrapText: true };
    const alignRight = { horizontal: 'right', vertical: 'center' };

    const merges: XLSX.Range[] = [];

    // Helper para establecer celdas sin romper bordes ni rangos
    const setCell = (
      r: number,
      c: number,
      val: any,
      font: any = fontNormal,
      align: any = alignLeft,
      border: any = borderThin,
      fill?: any
    ) => {
      const ref = XLSX.utils.encode_cell({ r, c });
      const cell: XLSX.CellObject = { t: typeof val === 'number' ? 'n' : 's', v: val ?? '' };
      cell.s = { font, alignment: align };
      if (border) cell.s.border = border;
      if (fill) cell.s.fill = fill;
      ws[ref] = cell;
    };

    // Helper para bordes limpios en bloques combinados
    const applyStyleToRange = (r1: number, c1: number, r2: number, c2: number, font = fontNormal, align = alignLeft, fill?: any) => {
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          const ref = XLSX.utils.encode_cell({ r, c });
          if (!ws[ref]) ws[ref] = { t: 's', v: '' };
          ws[ref].s = { font, alignment: align, border: borderThin };
          if (fill) ws[ref].s.fill = fill;
        }
      }
      merges.push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
    };

    // ------------------ 1. ENCABEZADO INSTITUCIONAL (Filas 0 a 3) ------------------
    setCell(0, 0, 'INSTITUTO SUPERIOR TECNOLOGICO DE TURISMO Y PATRIMONIO YAVIRAC', fontWhiteBold, alignCenter, borderThin, fillBlue);
    setCell(1, 0, 'MACROPROCESO 04 VINCULACION', fontBold, alignCenter, borderThin);
    setCell(2, 0, 'PROCESO 01 VINCULACION', fontWhiteBold, alignCenter, borderThin, fillOrange);
    setCell(3, 0, 'FORMATO 09 INFORME FINAL DEL PROYECTO', fontBold, alignCenter, borderThin);

    setCell(0, 3, 'CODIGO', fontBold, alignCenter, borderThin);
    setCell(0, 4, 'DS-040109', fontBold, alignCenter, borderThin);

    applyStyleToRange(0, 0, 0, 2, fontWhiteBold, alignCenter, fillBlue);
    applyStyleToRange(1, 0, 1, 2, fontBold, alignCenter);
    applyStyleToRange(2, 0, 2, 2, fontWhiteBold, alignCenter, fillOrange);
    applyStyleToRange(3, 0, 3, 2, fontBold, alignCenter);
    applyStyleToRange(0, 3, 3, 3, fontBold, alignCenter);
    applyStyleToRange(0, 4, 3, 4, fontBold, alignCenter);

    // ------------------ 2. TÍTULOS PRINCIPALES (Filas 5 y 6) ------------------
    setCell(5, 0, 'INSTITUTO SUPERIOR TECNOLOGICO DE TURISMO Y PATRIMONIO "YAVIRAC"', fontTitle, alignCenter, null);
    setCell(6, 0, 'Informe final de actividades de vinculación con la comunidad', fontTitle, alignCenter, null);
    merges.push({ s: { r: 5, c: 0 }, e: { r: 5, c: 4 } });
    merges.push({ s: { r: 6, c: 0 }, e: { r: 6, c: 4 } });

    // ------------------ 3. SECCIÓN 1: DATOS GENERALES ------------------
    setCell(8, 0, '1. DATOS GENERALES DEL PROYECTO', fontBold, alignLeft, null);

    // Fila Carrera (R9)
    setCell(9, 0, 'Carrera:', fontBold, alignLeft);
    setCell(9, 1, proyecto?.carrera ?? 'DESARROLLO DE SOFTWARE', fontNormal, alignLeft);
    setCell(9, 3, 'Fecha del informe:', fontBold, alignLeft);
    setCell(9, 4, proyecto?.fecha_informe ?? '24/11/2025', fontNormal, alignCenter);
    applyStyleToRange(9, 1, 9, 2);

    // Fila Estudiante (R10)
    setCell(10, 0, 'Estudiante:', fontBold, alignLeft);
    setCell(10, 1, proyecto?.estudiante ?? 'N/A', fontNormal, alignLeft);
    setCell(10, 3, 'Cédula C.C.:', fontBold, alignLeft);
    setCell(10, 4, proyecto?.cedula ?? 'N/A', fontNormal, alignCenter);
    applyStyleToRange(10, 1, 10, 2);

    // Fila Email (R11)
    setCell(11, 0, 'E-mail:', fontBold, alignLeft);
    setCell(11, 1, proyecto?.email ?? 'N/A', fontNormal, alignLeft);
    setCell(11, 3, 'Teléfono:', fontBold, alignLeft);
    setCell(11, 4, proyecto?.telefono ?? 'N/A', fontNormal, alignCenter);
    applyStyleToRange(11, 1, 11, 2);

    // Nombre del Proyecto y Fechas (R12 y R13)
    setCell(12, 0, 'Nombre del Proyecto:', fontBold, alignLeft);
    setCell(13, 0, proyecto?.nombre ?? 'N/A', fontNormal, alignLeft);
    setCell(12, 3, 'FECHA INICIO', fontBold, alignCenter, borderThin, fillLightGray);
    setCell(12, 4, proyecto?.fecha_inicio ?? '20/10/2025', fontNormal, alignCenter);
    setCell(13, 3, 'FECHA FINAL', fontBold, alignCenter, borderThin, fillLightGray);
    setCell(13, 4, proyecto?.fecha_fin ?? '24/11/2025', fontNormal, alignCenter);
    applyStyleToRange(12, 0, 12, 2);
    applyStyleToRange(13, 0, 13, 2);

    // Entidad (R14 y R15)
    setCell(14, 0, 'Nombre de la entidad beneficiaria de vinculación:', fontBold, alignLeft);
    setCell(15, 0, proyecto?.entidad_beneficiaria ?? 'N/A', fontNormal, alignLeft);
    setCell(14, 3, 'Teléfono:', fontBold, alignLeft);
    setCell(14, 4, proyecto?.telefono_entidad ?? 'N/A', fontNormal, alignCenter);
    applyStyleToRange(14, 0, 14, 2);
    applyStyleToRange(15, 0, 15, 2);
    applyStyleToRange(14, 3, 15, 3);
    applyStyleToRange(14, 4, 15, 4);

    // Dirección (R16 y R17)
    setCell(16, 0, 'Dirección:', fontBold, alignLeft);
    setCell(17, 0, proyecto?.direccion_entidad ?? 'N/A', fontNormal, alignLeft);
    setCell(16, 3, 'E-mail:', fontBold, alignLeft);
    setCell(16, 4, proyecto?.email_entidad ?? 'N/A', fontNormal, alignCenter);
    applyStyleToRange(16, 0, 16, 2);
    applyStyleToRange(17, 0, 17, 2);
    applyStyleToRange(16, 3, 17, 3);
    applyStyleToRange(16, 4, 17, 4);

    // Tutores (R18 y R19)
    setCell(18, 0, 'Tutor entidad vinculación:', fontBold, alignLeft);
    setCell(18, 1, proyecto?.tutor_entidad ?? 'N/A', fontNormal, alignLeft);
    applyStyleToRange(18, 1, 18, 4);

    setCell(19, 0, 'Docente Tutor:', fontBold, alignLeft);
    setCell(19, 1, proyecto?.docente_tutor ?? 'Ing. Byron Moreno M', fontNormal, alignLeft);
    applyStyleToRange(19, 1, 19, 4);

    // Aplicar bordes generales a la Sección 1
    for (let r = 9; r <= 19; r++) {
      for (let c = 0; c <= 4; c++) {
        const ref = XLSX.utils.encode_cell({ r, c });
        if (!ws[ref]) ws[ref] = { t: 's', v: '' };
        if (!ws[ref].s) ws[ref].s = {};
        ws[ref].s.border = borderThin;
      }
    }

    // ------------------ 4. SECCIÓN 2: ACTIVIDADES REALIZADAS ------------------
    let cRow = 21;
    setCell(cRow, 0, '2. RESUMEN DE ACTIVIDADES REALIZADAS', fontBold, alignLeft, null);
    cRow++;

    // Cabecera Tabla
    setCell(cRow, 0, 'Nro.', fontBold, alignCenter, borderThin, fillGrayHeader);
    setCell(cRow, 1, 'Fecha', fontBold, alignCenter, borderThin, fillGrayHeader);
    setCell(cRow, 2, 'Actividades', fontBold, alignCenter, borderThin, fillGrayHeader);
    setCell(cRow, 3, 'Horas cumplidas', fontBold, alignCenter, borderThin, fillGrayHeader);
    setCell(cRow, 4, 'Observaciones', fontBold, alignCenter, borderThin, fillGrayHeader);
    cRow++;

    const actividadesList = proyecto?.actividades ?? [];
    let totalHoras = 0;

    if (actividadesList.length > 0) {
      actividadesList.forEach((act: any, idx: number) => {
        const hrs = Number(act.total_horas ?? act.horas ?? 0);
        totalHoras += hrs;
        setCell(cRow, 0, idx + 1, fontNormal, alignCenter);
        setCell(cRow, 1, act.fecha ?? '', fontNormal, alignCenter);
        setCell(cRow, 2, act.actividad_realizada ?? act.actividad ?? '', fontNormal, alignLeft);
        setCell(cRow, 3, hrs, fontNormal, alignCenter);
        setCell(cRow, 4, act.observaciones ?? 'Ninguna', fontNormal, alignCenter);
        cRow++;
      });
    } else {
      setCell(cRow, 0, 1, fontNormal, alignCenter);
      setCell(cRow, 1, proyecto?.fecha_inicio ?? '20/10/2025', fontNormal, alignCenter);
      setCell(cRow, 2, 'Sin actividades registradas', fontNormal, alignLeft);
      setCell(cRow, 3, 0, fontNormal, alignCenter);
      setCell(cRow, 4, 'Ninguna', fontNormal, alignCenter);
      cRow++;
    }

    // Total Horas
    setCell(cRow, 0, 'Total Horas Cumplidas', fontBold, alignCenter, borderThin, fillGrayHeader);
    setCell(cRow, 3, proyecto?.total_horas ?? totalHoras, fontBold, alignCenter, borderThin, fillGrayHeader);
    applyStyleToRange(cRow, 0, cRow, 2, fontBold, alignCenter, fillGrayHeader);
    applyStyleToRange(cRow, 3, cRow, 4, fontBold, alignCenter, fillGrayHeader);
    cRow += 2;

    // ------------------ 5. SECCIÓN 3: OBJETIVOS ------------------
    setCell(cRow, 0, '3. REGISTRO DE AVANCE Y SEGUIMIENTO DE LOS OBJETIVOS DEL PROYECTO DE VINCULACIÓN', fontBold, alignLeft, null);
    cRow++;

    setCell(cRow, 0, 'Objetivos', fontBold, alignCenter, borderThin, fillGrayHeader);
    setCell(cRow, 2, 'Actividades', fontBold, alignCenter, borderThin, fillGrayHeader);
    setCell(cRow, 3, 'Avance %', fontBold, alignCenter, borderThin, fillGrayHeader);
    setCell(cRow, 4, 'Resultados', fontBold, alignCenter, borderThin, fillGrayHeader);
    applyStyleToRange(cRow, 0, cRow, 1, fontBold, alignCenter, fillGrayHeader);
    cRow++;

    const objetivosList = proyecto?.objetivos ?? [
      {
        objetivo: 'Objetivo 1: analizar y diagnosticar el desempeño técnico y funcional del sistema web institucional.',
        actividades: 'Realizar un diagnóstico técnico del sistema web mediante pruebas de rendimiento.',
        avance: '100%',
        resultados: 'Informe técnico de diagnóstico con identificación de fallas.'
      }
    ];

    objetivosList.forEach((obj: any) => {
      setCell(cRow, 0, obj.objetivo ?? '', fontNormal, alignLeft);
      setCell(cRow, 2, obj.actividades ?? '', fontNormal, alignLeft);
      setCell(cRow, 3, obj.avance ?? '100%', fontNormal, alignCenter);
      setCell(cRow, 4, obj.resultados ?? '', fontNormal, alignLeft);
      applyStyleToRange(cRow, 0, cRow, 1);
      cRow++;
    });

    cRow++;

    // ------------------ 6. SECCIÓN 4: REFLEXIÓN ------------------
    setCell(cRow, 0, '4. REFLEXIÓN DEL ESTUDIANTE', fontBold, alignLeft, null);
    cRow++;

    setCell(cRow, 0, proyecto?.reflexion_estudiante ?? 'Los estudiantes desarrollaron algunas habilidades blandas como: comunicación en equipo, coordinación de actividades, planificación de actividades', fontNormal, alignCenter);
    applyStyleToRange(cRow, 0, cRow, 4, fontNormal, alignCenter);
    cRow += 2;

    // ------------------ 7. SECCIÓN 5: EVALUACIÓN TUTOR ------------------
    setCell(cRow, 0, '5. EVALUACIÓN FINAL DEL TUTOR ACADÉMICO', fontBold, alignLeft, null);
    cRow++;

    setCell(cRow, 0, 'Parámetro de calificación', fontBold, alignLeft, borderThin, fillGrayHeader);
    setCell(cRow, 4, 'Calificación sobre 10', fontBold, alignCenter, borderThin, fillGrayHeader);
    applyStyleToRange(cRow, 0, cRow, 3, fontBold, alignLeft, fillGrayHeader);
    cRow++;

    const parametros = proyecto?.evaluacion_parametros ?? [
      'Puntualidad (Cumple sus obligaciones en el tiempo y plazo convenido, sin retraso)',
      'Trabajo autónomo',
      'Asistencia (Se encontraba presente en los días y horas acordadas)',
      'Ética profesional (Demuestra normas y valores que ayudan al desarrollo de las actividades profesionales)',
      'Cumple a satisfacción sus tareas',
      'Su actitud es proactiva y facilita la tarea en equipo',
      'Coopera de manera permanente y espontánea',
      'Demuestra respeto a la autoridad y compañeros',
      'Constancia y predisposición para desempeñar la labor',
      'Cumple con responsabilidad, esmero y orden las planificadas',
      'Habilidad para poner en práctica ideas propias o ajenas'
    ];

    parametros.forEach((p: any) => {
      const textoParametro = typeof p === 'string' ? p : p.parametro;
      const notaParametro = typeof p === 'string' ? '10,00' : (p.nota ?? '10,00');
      setCell(cRow, 0, textoParametro, fontNormal, alignLeft);
      setCell(cRow, 4, notaParametro, fontNormal, alignCenter);
      applyStyleToRange(cRow, 0, cRow, 3);
      cRow++;
    });

    // TOTAL EVALUACION
    setCell(cRow, 3, 'TOTAL', fontBold, alignRight);
    setCell(cRow, 4, proyecto?.nota_final_numero ?? '10,00', fontBold, alignCenter);
    applyStyleToRange(cRow, 0, cRow, 4, fontBold, alignLeft);
    cRow += 2;

    // NOTAS Y LETRAS
    setCell(cRow, 0, `NOTA FINAL: ${proyecto?.nota_final_texto ?? 'Diez'}`, fontBold, alignLeft, null);
    cRow++;
    setCell(cRow, 0, 'EN LETRAS', fontBold, alignLeft, null);
    cRow += 2;

    // OBSERVACIONES TUTOR
    setCell(cRow, 0, '5.1 Observaciones:', fontBold, alignLeft, null);
    cRow++;
    setCell(cRow, 0, proyecto?.observaciones_tutor ?? 'Ninguna', fontNormal, alignLeft, borderThin, fillLightGray);
    applyStyleToRange(cRow, 0, cRow, 4, fontNormal, alignLeft, fillLightGray);
    cRow += 3;

    // FIRMAS
    setCell(cRow, 0, 'DOCENTE TUTOR', fontBold, alignCenter, borderThin, fillGrayHeader);
    setCell(cRow, 2, 'COORDINADOR', fontBold, alignCenter, borderThin, fillGrayHeader);
    applyStyleToRange(cRow, 0, cRow, 1, fontBold, alignCenter, fillGrayHeader);
    applyStyleToRange(cRow, 2, cRow, 4, fontBold, alignCenter, fillGrayHeader);
    cRow += 3;

    setCell(cRow, 0, proyecto?.docente_tutor ?? 'Ing. Byron Moreno M', fontNormal, alignCenter, borderThin);
    setCell(cRow, 2, proyecto?.coordinador ?? 'Ing. Raúl Páez', fontNormal, alignCenter, borderThin);
    applyStyleToRange(cRow, 0, cRow, 1, fontNormal, alignCenter);
    applyStyleToRange(cRow, 2, cRow, 4, fontNormal, alignCenter);
    cRow += 2;

    // ANEXOS
    setCell(cRow, 0, 'ANEXOS', fontBold, alignCenter, borderThin, fillGrayHeader);
    applyStyleToRange(cRow, 0, cRow, 4, fontBold, alignCenter, fillGrayHeader);
    cRow += 2;

    setCell(cRow, 0, '6. Evidencia del producto final: anexos, fotografía o escaneado de las evidencias del resultado final del curso.\nIncluya 6 imágenes y aplique las normas APA 7ma. Edición', fontBold, alignLeft, null);

    // ------------------ CONFIGURACIONES FINALES ------------------
    ws['!merges'] = merges;
    ws['!cols'] = [
      { wch: 10 }, // A
      { wch: 20 }, // B
      { wch: 50 }, // C
      { wch: 18 }, // D
      { wch: 24 }  // E
    ];
    ws['!ref'] = `A1:E${cRow + 5}`;

    XLSX.utils.book_append_sheet(wb, ws, 'Informe Final');

    const nombreLimpio = (proyecto?.estudiante ?? 'VINCULACION')
      .replace(/\s+/g, '_')
      .toUpperCase();

    XLSX.writeFile(wb, `INFORME_FINAL_${nombreLimpio}.xlsx`);
  }
  
}
   
  