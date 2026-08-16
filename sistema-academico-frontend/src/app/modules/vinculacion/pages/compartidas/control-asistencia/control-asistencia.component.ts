import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ControlAsistenciaService } from '../../../services/control-asistencia.service';
import { InicioActividadesService } from '../../../services/inicio-actividades.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { AsistenciaEstudianteResponse, ActividadEstudiante, CreateActividadEstudianteDto, UpdateActividadEstudianteDto, ActividadAgrupada } from '../../../models/control-asistencia.model';
import { VolverArchivosComponent } from '../../../components/volver-archivos/volver-archivos.component';
import { ExcelExportService } from '../../../services/excel-export.service'; 
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-control-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule, VolverArchivosComponent],
  templateUrl: './control-asistencia.component.html',
  styleUrls: ['./control-asistencia.component.scss']
})
export class ControlAsistenciaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private asistenciaService = inject(ControlAsistenciaService);
  private inicioActividadesService = inject(InicioActividadesService);
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);
  private cdr = inject(ChangeDetectorRef);
  private excelService = inject(ExcelExportService);

  data: AsistenciaEstudianteResponse | null = null;
  loading = true;
  error: string | null = null;
  isEstudiante = false;
  isDocente = false;
  isCoordinador = false;
  idVinculacion: number = 0;

  fechaInicioProyecto: string = '';
  fechaFinProyecto: string = '';

  observaciones: string = '';
  observacionesOriginales: string = '';
  guardandoObservacion: boolean = false;
  observacionGuardada: boolean = true;
  timeoutGuardado: any = null;
  mensajeFeedback: string = '';
  editandoObservacion = false;

  errorHora: string | null = null;

  actividadesAgrupadas: ActividadAgrupada[] = [];

  nuevaActividad: CreateActividadEstudianteDto = {
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    actividades_realizadas: '',
    observacion: '',
    resultado_aprendizaje: ''
  };
  mostrandoFormulario = false;

  editandoId: number | null = null;
  editandoActividad: UpdateActividadEstudianteDto = {};
  editandoGrupoId: number | null = null;
  descripcionGrupoOriginal: string = '';

  get puedeEditarObservaciones(): boolean {
    return this.isDocente || this.isCoordinador;
  }

  ngOnInit(): void {
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');
    this.isDocente = roles.includes('DOCENTE');
    this.isCoordinador = roles.includes('COORDINADOR');

    if (this.isDocente) {
      this.cargarDatosDocente();
      return;
    }

    if (!this.isEstudiante) {
      this.error = '⚠️ No tienes permisos para ver esta pantalla. Solo estudiantes pueden acceder.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.route.params.subscribe(params => {
      const idParam = params['id'] ? +params['id'] : 0;
      
      if (idParam > 0) {
        this.idVinculacion = idParam;
        this.cargarDatos();
      } else {
        this.obtenerVinculacionActiva();
      }
    });
  }

  // ============================================
  // ✅ MÉTODOS DE EDICIÓN SEPARADOS Y CORREGIDOS
  // ============================================

  // 1️⃣ Edita únicamente una fila específica (fecha, hora entrada, hora salida)
  editarFilaIndividual(act: any): void {
    if (!this.isEstudiante) return;
    this.editandoId = act.id;
    this.editandoGrupoId = null; 
    this.errorHora = null;

    this.editandoActividad = {
      fecha: act.fecha,
      hora_inicio: act.hora_entrada,
      hora_fin: act.hora_salida,
      actividades_realizadas: act.descripcion // 👈 Añadido para que cargue el texto al editar
    };
    this.cdr.markForCheck();
  }

  // 2️⃣ Edita la descripción compartida de todo el grupo
  editarDescripcionGrupo(grupo: ActividadAgrupada): void {
    if (!this.isEstudiante) return;
    this.editandoId = null; // Nos aseguramos de no activar filas individuales
    this.editandoGrupoId = grupo.ids[0];
    this.errorHora = null;

    this.editandoActividad = {
      actividades_realizadas: grupo.descripcion
    };
    this.cdr.markForCheck();
  }

  // 3️⃣ Guarda los cambios de una fila individual (fecha u horas)
  guardarEdicionFila(actId: number): void {
    if (!this.isEstudiante) return;

    this.errorHora = null;

    if (this.editandoActividad.fecha && !this.validarFecha(this.editandoActividad.fecha)) {
      return;
    }

    if (this.editandoActividad.hora_inicio && this.editandoActividad.hora_fin) {
      if (this.editandoActividad.hora_fin <= this.editandoActividad.hora_inicio) {
        this.errorHora = '❌ La hora de salida debe ser posterior a la hora de entrada.';
        this.cdr.markForCheck();
        return;
      }
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.asistenciaService.actualizarActividad(actId, this.editandoActividad).subscribe({
      next: () => {
        this.cargarDatos();
        this.cancelarEdicion();
      },
      error: (err) => {
        console.error('❌ Error al actualizar la actividad:', err);
        const mensaje = err.error?.message || 'Error al actualizar la actividad.';
        this.error = mensaje;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // 4️⃣ Guarda el cambio de la descripción en todos los elementos del grupo mediante el backend
  guardarEdicionGrupo(grupo: ActividadAgrupada): void {
    if (!this.isEstudiante || !this.editandoGrupoId) return;

    const nuevaDescripcion = this.editandoActividad.actividades_realizadas;
    if (!nuevaDescripcion || nuevaDescripcion.trim() === '') {
      alert('⚠️ La descripción no puede estar vacía.');
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const promesas = grupo.ids.map(id => 
      this.asistenciaService.actualizarActividad(id, { actividades_realizadas: nuevaDescripcion }).toPromise()
    );

    Promise.all(promesas)
      .then(() => {
        this.cargarDatos();
        this.cancelarEdicion();
      })
      .catch((err) => {
        console.error('❌ Error al actualizar el grupo de actividades:', err);
        const mensaje = err.error?.message || 'Error al actualizar las actividades.';
        this.error = mensaje;
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  cargarDatosDocente(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.route.params.subscribe(params => {
      const idParam = params['id'] ? +params['id'] : 0;
      if (idParam > 0) {
        this.idVinculacion = idParam;
        this.cargarSoloObservaciones();
      } else {
        this.error = 'No se encontró el ID de vinculación.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  cargarSoloObservaciones(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.inicioActividadesService.obtenerInicioActividades(this.idVinculacion)
      .subscribe({
        next: (data) => {
          this.fechaInicioProyecto = data.fecha_inicio || '';
          this.fechaFinProyecto = data.fecha_fin || '';
          this.cdr.markForCheck();
        },
        error: () => {
          this.fechaInicioProyecto = '';
          this.fechaFinProyecto = '';
        }
      });

    this.asistenciaService.obtenerAsistencia(this.idVinculacion)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          this.data = {
            cabecera: data.cabecera || {
              carrera: '',
              entidad_beneficiaria: '',
              estudiante: '',
              nombre_proyecto: '',
              docente_tutor: '',
              tutor_entidad_receptora: '',
              periodo_academico: ''
            },
            actividades: [],
            totales: {
              total_horas: 0,
              observaciones: data.totales?.observaciones || ''
            }
          };
          this.procesarActividadesAgrupadas();
          this.observaciones = data.totales?.observaciones || '';
          this.observacionesOriginales = this.observaciones;
          this.observacionGuardada = true;
          this.cdr.markForCheck();
        },
        error: () => {
          this.data = {
            cabecera: {
              carrera: '',
              entidad_beneficiaria: '',
              estudiante: '',
              nombre_proyecto: '',
              docente_tutor: '',
              tutor_entidad_receptora: '',
              periodo_academico: ''
            },
            actividades: [],
            totales: {
              total_horas: 0,
              observaciones: ''
            }
          };
          this.procesarActividadesAgrupadas();
          this.observaciones = '';
          this.observacionesOriginales = '';
          this.observacionGuardada = true;
          this.cdr.markForCheck();
        }
      });
  }

  obtenerVinculacionActiva(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.vinculacionService.obtenerVinculacionActiva()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (response) => {
          if (response && response.id_vinculacion) {
            this.idVinculacion = Number(response.id_vinculacion);
            this.cargarDatos();
          } else {
            this.error = 'No se encontró una vinculación activa para este estudiante.';
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          console.error('❌ Error al obtener vinculación activa:', err);
          this.error = 'Error al obtener la vinculación activa.';
          this.cdr.markForCheck();
        }
      });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();
    console.log('🔵 Cargando asistencia para vinculación:', this.idVinculacion);
    
    this.inicioActividadesService.obtenerInicioActividades(this.idVinculacion)
      .subscribe({
        next: (data) => {
          console.log('📦 Fechas del proyecto recibidas:', data);
          this.fechaInicioProyecto = data.fecha_inicio || '';
          this.fechaFinProyecto = data.fecha_fin || '';
          this.cdr.markForCheck();
        },
        error: () => {
          this.fechaInicioProyecto = '';
          this.fechaFinProyecto = '';
        }
      });

    this.asistenciaService.obtenerAsistencia(this.idVinculacion)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          console.log('📦 Datos de asistencia recibidos:', data);
          this.data = data;
          this.procesarActividadesAgrupadas();
          this.observaciones = data.totales?.observaciones || '';
          this.observacionesOriginales = this.observaciones;
          this.observacionGuardada = true;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al cargar asistencia:', err);
          this.error = 'No se pudo cargar el control de asistencia.';
          this.cdr.markForCheck();
        }
      });
  }

  // ============================================
  // LÓGICA DE AGRUPACIÓN DE ACTIVIDADES
  // ============================================
  procesarActividadesAgrupadas(): void {
    if (!this.data || !this.data.actividades) {
      this.actividadesAgrupadas = [];
      return;
    }

    const mapa = new Map<string, ActividadAgrupada>();

    this.data.actividades.forEach(act => {
      const clave = act.descripcion.trim().toLowerCase();

      if (!mapa.has(clave)) {
        mapa.set(clave, {
          ids: [act.id],
          fechas: [act.fecha],
          textoFechas: this.formatearFecha(act.fecha),
          hora_entrada: act.hora_entrada,
          hora_salida: act.hora_salida,
          total_horas: Number(act.total_horas) || 0,
          descripcion: act.descripcion,
          actividadRepresentativa: act,
          actividadesDetalle: [act]
        });
      } else {
        const grupo = mapa.get(clave)!;
        grupo.ids.push(act.id);
        grupo.fechas.push(act.fecha);
        grupo.total_horas += Number(act.total_horas) || 0;
        
        grupo.actividadesDetalle.push(act);
        grupo.actividadesDetalle.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

        grupo.fechas.sort();
        const fechaInicio = this.formatearFecha(grupo.fechas[0]);
        const fechaFin = this.formatearFecha(grupo.fechas[grupo.fechas.length - 1]);

        if (grupo.fechas.length === 1) {
          grupo.textoFechas = fechaInicio;
        } else {
          grupo.textoFechas = `${fechaInicio} al ${fechaFin} (${grupo.fechas.length} días)`;
        }
      }
    });

    this.actividadesAgrupadas = Array.from(mapa.values());
  }

  validarFecha(fecha: string): boolean {
    if (!this.fechaInicioProyecto || !this.fechaFinProyecto) {
      console.warn('⚠️ No hay fechas de proyecto para validar');
      return true;
    }

    const fechaActividad = new Date(fecha);
    const fechaInicio = new Date(this.fechaInicioProyecto);
    const fechaFin = new Date(this.fechaFinProyecto);

    fechaActividad.setHours(0, 0, 0, 0);
    fechaInicio.setHours(0, 0, 0, 0);
    fechaFin.setHours(0, 0, 0, 0);

    if (fechaActividad < fechaInicio) {
      alert(`❌ La fecha no puede ser anterior a ${this.formatearFecha(this.fechaInicioProyecto)}`);
      return false;
    }

    if (fechaActividad > fechaFin) {
      alert(`❌ La fecha no puede ser posterior a ${this.formatearFecha(this.fechaFinProyecto)}`);
      return false;
    }

    return true;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  // ============================================
  // OBSERVACIONES - AUTO-GUARDADO
  // ============================================
  onObservacionChange(): void {
    if (!this.puedeEditarObservaciones) return;

    if (this.timeoutGuardado) {
      clearTimeout(this.timeoutGuardado);
    }

    this.observacionGuardada = false;

    this.timeoutGuardado = setTimeout(() => {
      this.guardarObservacion();
    }, 1500);
  }

  guardarObservacion(): void {
    if (!this.puedeEditarObservaciones) return;
    if (this.guardandoObservacion) return;
    if (this.observaciones === this.observacionesOriginales) {
      this.observacionGuardada = true;
      this.editandoObservacion = false;
      this.cdr.markForCheck();
      return;
    }

    this.guardandoObservacion = true;
    this.observacionGuardada = false;
    this.cdr.markForCheck();

    this.asistenciaService.actualizarObservacion(this.idVinculacion, this.observaciones)
      .pipe(finalize(() => {
        this.guardandoObservacion = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          console.log('✅ Observación guardada automáticamente');
          this.observacionesOriginales = this.observaciones;
          this.observacionGuardada = true;
          this.mostrarFeedback('Observación guardada ✅');
          this.editandoObservacion = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al guardar observación:', err);
          this.error = 'Error al guardar la observación.';
          this.observacionGuardada = false;
          this.cdr.markForCheck();
        }
      });
  }

  toggleEditObservacion(): void {
    if (!this.puedeEditarObservaciones) return;
    if (this.editandoObservacion) {
      this.guardarObservacion();
    } else {
      this.editandoObservacion = true;
      this.observaciones = this.data?.totales?.observaciones || '';
      this.observacionesOriginales = this.observaciones;
      this.cdr.markForCheck();
    }
  }

  mostrarFeedback(mensaje: string): void {
    this.mensajeFeedback = mensaje;
    setTimeout(() => {
      this.mensajeFeedback = '';
      this.cdr.markForCheck();
    }, 3000);
  }

  // ============================================
  // CRUD ACTIVIDADES (SOLO ESTUDIANTE)
  // ============================================
  mostrarFormulario(): void {
    if (!this.isEstudiante) return;
    this.mostrandoFormulario = true;
    this.errorHora = null;
    const hoy = new Date();
    const fechaStr = hoy.toISOString().split('T')[0];
    this.nuevaActividad = { 
      fecha: fechaStr,
      hora_inicio: '', 
      hora_fin: '', 
      actividades_realizadas: '',
      observacion: '',
      resultado_aprendizaje: ''
    };
    this.cdr.markForCheck();
  }

  cancelarNuevo(): void {
    this.mostrandoFormulario = false;
    this.errorHora = null;
    this.cdr.markForCheck();
  }

  agregarActividad(): void {
    if (!this.isEstudiante) return;
    this.errorHora = null;

    if (!this.nuevaActividad.fecha || !this.nuevaActividad.hora_inicio || !this.nuevaActividad.hora_fin) {
      alert('⚠️ Complete fecha, hora entrada y hora salida.');
      return;
    }

    if (this.nuevaActividad.hora_fin <= this.nuevaActividad.hora_inicio) {
      this.errorHora = '❌ La hora de salida debe ser posterior a la hora de entrada.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.validarFecha(this.nuevaActividad.fecha)) {
      return;
    }

    const payload = {
      ...this.nuevaActividad,
      id_vinculacion: this.idVinculacion
    };

    this.loading = true;
    this.cdr.markForCheck();
    
    this.asistenciaService.crearActividad(payload)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.cargarDatos();
          this.mostrandoFormulario = false;
        },
        error: (err) => {
          console.error('❌ Error al agregar actividad:', err);
          const mensaje = err.error?.message || 'Error al agregar actividad.';
          this.error = mensaje;
          this.cdr.markForCheck();
        }
      });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.editandoGrupoId = null;
    this.editandoActividad = {};
    this.errorHora = null;
    this.cdr.markForCheck();
  }

  eliminarActividad(id: number): void {
    if (!this.isEstudiante) return;
    if (!confirm('¿Está seguro de eliminar esta actividad?')) return;
    
    this.loading = true;
    this.cdr.markForCheck();
    
    this.asistenciaService.eliminarActividad(id)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err) => {
          console.error('❌ Error al eliminar actividad:', err);
          const mensaje = err.error?.message || 'Error al eliminar actividad.';
          this.error = mensaje;
          this.cdr.markForCheck();
        }
      });
  }

  // ============================================
  // ESTADOS PARA DUPLICAR ACTIVIDAD
  // ============================================
  mostrandoModalDuplicar = false;
  actividadParaDuplicar: ActividadEstudiante | null = null;
  nuevoDiaDuplicado = {
    fecha: '',
    hora_inicio: '08:00',
    hora_fin: '12:00'
  };

  prepararDuplicado(actividad: ActividadEstudiante): void {
    if (!this.isEstudiante) return;
    this.actividadParaDuplicar = actividad;
    this.errorHora = null;
    this.nuevoDiaDuplicado = {
      fecha: '',
      hora_inicio: actividad.hora_entrada || '08:00',
      hora_fin: actividad.hora_salida || '12:00'
    };
    this.mostrandoModalDuplicar = true;
    this.cdr.markForCheck();
  }

  cancelarDuplicado(): void {
    this.mostrandoModalDuplicar = false;
    this.actividadParaDuplicar = null;
    this.errorHora = null;
    this.cdr.markForCheck();
  }

  guardarDiaDuplicado(): void {
    if (!this.isEstudiante || !this.actividadParaDuplicar) return;
    this.errorHora = null;

    if (!this.nuevoDiaDuplicado.fecha || !this.nuevoDiaDuplicado.hora_inicio || !this.nuevoDiaDuplicado.hora_fin) {
      alert('⚠️ Complete la fecha, hora de entrada y hora de salida.');
      return;
    }

    if (this.nuevoDiaDuplicado.hora_fin <= this.nuevoDiaDuplicado.hora_inicio) {
      this.errorHora = '❌ La hora de salida debe ser posterior a la hora de entrada.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.validarFecha(this.nuevoDiaDuplicado.fecha)) {
      return;
    }

    const payload: CreateActividadEstudianteDto = {
      fecha: this.nuevoDiaDuplicado.fecha,
      hora_inicio: this.nuevoDiaDuplicado.hora_inicio,
      hora_fin: this.nuevoDiaDuplicado.hora_fin,
      actividades_realizadas: this.actividadParaDuplicar.descripcion, 
      observacion: '', 
      id_vinculacion: this.idVinculacion
    };

    this.loading = true;
    this.cdr.markForCheck();

    this.asistenciaService.crearActividad(payload)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.cargarDatos();
          this.cancelarDuplicado();
        },
        error: (err) => {
          console.error('❌ Error al duplicar actividad:', err);
          const mensaje = err.error?.message || 'Error al duplicar la actividad.';
          this.error = mensaje;
          this.cdr.markForCheck();
        }
      });
  }

  // ✅ Exportar a Excel
  async exportarExcel(): Promise<void> {
    if (!this.idVinculacion || !this.data) {
      alert('No hay datos para exportar.');
      return;
    }
    try {
      await this.excelService.exportarHojaIndividual(
        this.idVinculacion,
        'C.A.',
        this.data
      );
    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
      alert('Error al exportar el archivo Excel.');
    }
  }
}