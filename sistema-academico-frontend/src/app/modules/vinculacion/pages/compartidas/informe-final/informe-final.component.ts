import { Component, OnInit, inject, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { InformeFinalService } from '../../../services/informe-final.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { VolverArchivosComponent } from '../../../components/volver-archivos/volver-archivos.component';
import { AuthService } from '../../../../auth/services/auth.service';
import { ExcelExportService } from '../../../services/excel-export.service';
import { InicioActividadesService } from '../../../services/inicio-actividades.service';

// ✅ IMPORTAR MODAL DESDE SHARED
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-informe-final',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VolverArchivosComponent,
    ModalComponent  // ✅ AGREGADO
  ],
  templateUrl: './informe-final.component.html',
  styleUrls: ['./informe-final.component.scss']
})
export class InformeFinalComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private informeFinalService = inject(InformeFinalService);
  private vinculacionService = inject(VinculacionService);
  private inicioActividadesService = inject(InicioActividadesService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private excelService = inject(ExcelExportService);

  @Input() idVinculacion: number = 0;
  esEstudiante: boolean = false;
  esDocente: boolean = false;

  loading = true;
  guardando = false;
  error: string | null = null;
  mensajeExito: string = '';

  informe: any = null;
  datosInicioActividades: any = null;
  actividadesAgrupadas: any[] = [];

  observaciones: string = '';
  notaFinalCalculada: number = 0;
  notaEnLetras: string = '';

  editandoEvaluacion: boolean = false;
  editandoObjetivos: boolean = false;
  objetivosEditados: any[] = [];

  // ============================================
  // NUEVO: EDICIÓN DE OBSERVACIONES EN ACTIVIDADES
  // ============================================
  editandoObservacionActividad: number | null = null;
  observacionActividadEdit: string = '';

  parametros = {
    puntualidad: 0,
    trabajoAutonomo: 0,
    asistencia: 0,
    eticaProfesional: 0,
    cumpleTareas: 0,
    actitudProactiva: 0,
    cooperaPermanentemente: 0,
    respetoAutoridad: 0,
    constanciaPredisposicion: 0,
    responsabilidadEsmero: 0,
    habilidadPractica: 0
  };

  listaParametros = [
    { key: 'puntualidad', label: 'Puntualidad' },
    { key: 'trabajoAutonomo', label: 'Trabajo autónomo' },
    { key: 'asistencia', label: 'Asistencia' },
    { key: 'eticaProfesional', label: 'Ética profesional' },
    { key: 'cumpleTareas', label: 'Cumple a satisfacción sus tareas' },
    { key: 'actitudProactiva', label: 'Actitud proactiva' },
    { key: 'cooperaPermanentemente', label: 'Coopera permanentemente' },
    { key: 'respetoAutoridad', label: 'Respeto a la autoridad y compañeros' },
    { key: 'constanciaPredisposicion', label: 'Constancia y predisposición' },
    { key: 'responsabilidadEsmero', label: 'Responsabilidad, esmero y orden' },
    { key: 'habilidadPractica', label: 'Habilidad para poner en práctica ideas' }
  ];

  // ============================================
  // MODAL
  // ============================================
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalButtonText: string = 'Aceptar';
  showConfirmButtons: boolean = false;
  modalConfirmCallback: (() => void) | null = null;
  modalCancelCallback: (() => void) | null = null;
  private objetivoAEliminar: number | null = null;

  // ============================================
  // LIFECYCLE
  // ============================================
  ngOnInit(): void {
    this.obtenerRoles();

    console.log('🔍 esEstudiante FINAL:', this.esEstudiante);
    console.log('🔍 esDocente FINAL:', this.esDocente);
    console.log('🔍 idVinculacion Input inicial:', this.idVinculacion);

    this.route.params.subscribe(params => {
      console.log('🔍 Parámetros de la URL:', params);
      const idParam = params['id'];

      if (idParam !== undefined && idParam !== null && idParam !== '0' && idParam !== '') {
        this.idVinculacion = +idParam;
        console.log('✅ ID desde URL (prioridad 1):', this.idVinculacion);
        this.cargarInforme();
        return;
      }

      if (this.idVinculacion > 0) {
        console.log('✅ ID desde Input (prioridad 2):', this.idVinculacion);
        this.cargarInforme();
        return;
      }

      console.log('❌ No hay ID en URL ni en Input');

      if (this.esEstudiante) {
        console.log('✅ Es estudiante, obteniendo vinculación activa...');
        this.obtenerVinculacionActiva();
        return;
      }

      if (this.esDocente) {
        console.log('✅ Es docente, pero no hay ID de vinculación');
        this.mostrarModal(
          'Sin selección',
          'No se encontró un ID de vinculación. Por favor, selecciona un estudiante.',
          'warning'
        );
        this.loading = false;
        this.cdr.markForCheck();
        return;
      }

      console.warn('⚠️ No se pudo determinar el rol, intentando obtener vinculación activa como fallback...');
      this.obtenerVinculacionActiva();
    });
  }

  // ============================================
  // MODAL
  // ============================================
  private mostrarModal(
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    buttonText: string = 'Aceptar'
  ): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;
    this.modalButtonText = buttonText;
    this.showConfirmButtons = false;
    this.modalConfirmCallback = null;
    this.modalCancelCallback = null;
    this.modalVisible = true;
    this.cdr.markForCheck();
  }

  private mostrarModalConfirmacion(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = 'warning';
    this.modalButtonText = 'Confirmar';
    this.showConfirmButtons = true;
    this.modalConfirmCallback = onConfirm;
    this.modalCancelCallback = onCancel || null;
    this.modalVisible = true;
    this.cdr.markForCheck();
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.showConfirmButtons = false;
    this.modalConfirmCallback = null;
    this.modalCancelCallback = null;
    this.cdr.markForCheck();
  }

  confirmarModal(): void {
    if (this.modalConfirmCallback) {
      this.modalConfirmCallback();
    }
    this.cerrarModal();
  }

  cancelarModal(): void {
    if (this.modalCancelCallback) {
      this.modalCancelCallback();
    }
    this.cerrarModal();
  }

  // ============================================
  // OBTENER ROLES
  // ============================================
  obtenerRoles(): void {
    try {
      const roles = this.authService.roles();
      console.log('🔍 Roles desde AuthService:', roles);

      if (roles && roles.length > 0) {
        const rolesArray = Array.isArray(roles) ? roles : [roles];

        this.esEstudiante = rolesArray.some((r: string) => {
          const rol = r?.toUpperCase() || '';
          return rol === 'ESTUDIANTE' || rol === 'ROLE_ESTUDIANTE' || rol.includes('ESTUDIANTE');
        });

        this.esDocente = rolesArray.some((r: string) => {
          const rol = r?.toUpperCase() || '';
          return rol === 'DOCENTE' || rol === 'ROLE_DOCENTE' || rol.includes('DOCENTE');
        });

        console.log('✅ Roles asignados desde AuthService - Estudiante:', this.esEstudiante, 'Docente:', this.esDocente);
        return;
      }

      console.warn('⚠️ AuthService no devolvió roles, buscando en localStorage...');

      const posiblesClaves = ['user', 'authData', 'currentUser', 'usuario', 'auth_user', 'userData', 'data'];

      for (const clave of posiblesClaves) {
        const data = localStorage.getItem(clave);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            console.log(`🔍 Datos encontrados en "${clave}":`, parsed);

            let rolesEncontrados = parsed?.roles || parsed?.role || parsed?.authorities || [];
            if (rolesEncontrados.length > 0) {
              const rolesArray = Array.isArray(rolesEncontrados) ? rolesEncontrados : [rolesEncontrados];

              this.esEstudiante = rolesArray.some((r: string) => {
                const rol = r?.toUpperCase() || '';
                return rol === 'ESTUDIANTE' || rol === 'ROLE_ESTUDIANTE' || rol.includes('ESTUDIANTE');
              });

              this.esDocente = rolesArray.some((r: string) => {
                const rol = r?.toUpperCase() || '';
                return rol === 'DOCENTE' || rol === 'ROLE_DOCENTE' || rol.includes('DOCENTE');
              });

              console.log(`✅ Roles asignados desde "${clave}" - Estudiante:`, this.esEstudiante, 'Docente:', this.esDocente);
              return;
            }
          } catch (e) {
            console.warn(`⚠️ No se pudo parsear "${clave}"`);
          }
        }
      }

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        console.log('🔍 Token encontrado, intentando decodificar...');
        try {
          const payload = token.split('.')[1];
          if (payload) {
            const decoded = JSON.parse(atob(payload));
            console.log('🔍 Token decodificado:', decoded);

            let rolesEncontrados = decoded?.roles || decoded?.role || decoded?.authorities || [];
            if (rolesEncontrados.length > 0) {
              const rolesArray = Array.isArray(rolesEncontrados) ? rolesEncontrados : [rolesEncontrados];

              this.esEstudiante = rolesArray.some((r: string) => {
                const rol = r?.toUpperCase() || '';
                return rol === 'ESTUDIANTE' || rol === 'ROLE_ESTUDIANTE' || rol.includes('ESTUDIANTE');
              });

              this.esDocente = rolesArray.some((r: string) => {
                const rol = r?.toUpperCase() || '';
                return rol === 'DOCENTE' || rol === 'ROLE_DOCENTE' || rol.includes('DOCENTE');
              });

              console.log('✅ Roles asignados desde JWT - Estudiante:', this.esEstudiante, 'Docente:', this.esDocente);
              return;
            }
          }
        } catch (e) {
          console.warn('⚠️ No se pudo decodificar el token');
        }
      }

      console.warn('⚠️ No se pudieron obtener roles de ninguna fuente');

    } catch (error) {
      console.error('❌ Error al obtener roles:', error);
    }
  }

  // ============================================
  // OBTENER VINCULACIÓN ACTIVA
  // ============================================
  obtenerVinculacionActiva(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    console.log('🔄 Obteniendo vinculación activa del estudiante...');

    this.vinculacionService.obtenerVinculacionActiva()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          console.log('✅ Vinculación activa obtenida:', data);
          if (data && data.id_vinculacion) {
            this.idVinculacion = Number(data.id_vinculacion);
            console.log('✅ ID de vinculación activa (prioridad 3):', this.idVinculacion);
            this.cargarInforme();
          } else {
            this.mostrarModal('Sin vinculación', 'No tienes una vinculación activa. Contacta al coordinador.', 'warning');
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          console.error('❌ Error al obtener vinculación activa:', err);
          this.mostrarModal('Error', 'No se pudo obtener tu vinculación activa. Verifica tu conexión.', 'error');
          this.cdr.markForCheck();
        }
      });
  }

  // ============================================
  // CARGAR INFORME
  // ============================================
  cargarInforme(): void {
    if (!this.idVinculacion || this.idVinculacion <= 0) {
      this.mostrarModal('Error', 'ID de vinculación no válido (debe ser mayor que 0)', 'error');
      this.loading = false;
      this.cdr.markForCheck();
      console.error('❌ Error: ID de vinculación inválido:', this.idVinculacion);
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    console.log('📄 Cargando informe con ID:', this.idVinculacion);

    Promise.all([
      this.informeFinalService.obtenerInformeFinal(this.idVinculacion).toPromise(),
      this.inicioActividadesService.obtenerInicioActividades(this.idVinculacion).toPromise()
    ])
      .then(([informeData, inicioActividadesData]) => {
        this.loading = false;
        this.informe = informeData;
        this.datosInicioActividades = inicioActividadesData;

        console.log('📄 Informe final cargado:', informeData);
        console.log('📄 Inicio Actividades cargado:', inicioActividadesData);

        if (!this.informe) {
          this.mostrarModal('Sin datos', 'No se encontró información para esta vinculación.', 'warning');
          this.cdr.markForCheck();
          return;
        }

        this.actividadesAgrupadas = this.procesarActividadesAgrupadas();
        this.asegurarFechas();
        this.cargarObjetivosDesdeLocalStorage();
        this.cargarObservacionesActividadDesdeLocalStorage();

        if (this.informe?.evaluacion_final?.parametros) {
          const p = this.informe.evaluacion_final.parametros;
          this.parametros.puntualidad = p.puntualidad ?? 0;
          this.parametros.trabajoAutonomo = p.trabajo_autonomo ?? 0;
          this.parametros.asistencia = p.asistencia ?? 0;
          this.parametros.eticaProfesional = p.etica_profesional ?? 0;
          this.parametros.cumpleTareas = p.cumple_tareas ?? 0;
          this.parametros.actitudProactiva = p.actitud_proactiva ?? 0;
          this.parametros.cooperaPermanentemente = p.coopera_permanentemente ?? 0;
          this.parametros.respetoAutoridad = p.respeto_autoridad ?? 0;
          this.parametros.constanciaPredisposicion = p.constancia_predisposicion ?? 0;
          this.parametros.responsabilidadEsmero = p.responsabilidad_esmero ?? 0;
          this.parametros.habilidadPractica = p.habilidad_practica ?? 0;
        } else {
          this.inicializarParametros();
          console.log('🔧 Parámetros inicializados a 0 (sin datos guardados)');
        }

        this.calcularPromedio();

        if (this.informe?.evaluacion_final?.observaciones) {
          this.observaciones = this.informe.evaluacion_final.observaciones;
        }

        if (this.informe?.evaluacion_final?.nota_final && this.informe.evaluacion_final.nota_final !== 'Sin calificar') {
          this.notaFinalCalculada = parseFloat(this.informe.evaluacion_final.nota_final);
          this.notaEnLetras = this.informe.evaluacion_final.nota_letras || this.convertirNotaALetras(this.notaFinalCalculada);
        } else {
          this.notaEnLetras = this.convertirNotaALetras(this.notaFinalCalculada);
        }

        this.cdr.markForCheck();
      })
      .catch((err) => {
        this.loading = false;
        console.error('❌ Error al cargar datos:', err);
        this.mostrarModal('Error', 'Error al cargar los datos. Por favor, intenta nuevamente.', 'error');
        this.cdr.markForCheck();
      });
  }

  // ============================================
  // PROCESAR ACTIVIDADES AGRUPADAS
  // ============================================
  procesarActividadesAgrupadas(): any[] {
    if (!this.informe?.resumen_actividades || this.informe.resumen_actividades.length === 0) {
      return [];
    }

    const mapa = new Map<string, any>();

    this.informe.resumen_actividades.forEach((act: any) => {
      const clave = (act.actividades || '').trim().toLowerCase();

      if (!mapa.has(clave)) {
        mapa.set(clave, {
          actividades: act.actividades,
          fechas: [act.fecha],
          horas: act.horas_cumplidas || 0,
          observaciones: act.observaciones || 'Sin observaciones',
          count: 1,
          id: act.id || Date.now() + Math.random() * 1000
        });
      } else {
        const grupo = mapa.get(clave)!;
        grupo.fechas.push(act.fecha);
        grupo.horas += (act.horas_cumplidas || 0);
        grupo.count++;
      }
    });

    return Array.from(mapa.values()).map((grupo, index) => {
      const fechasOrdenadas = grupo.fechas.sort((a: string, b: string) =>
        new Date(a).getTime() - new Date(b).getTime()
      );

      const fechaInicio = this.formatearFecha(fechasOrdenadas[0]);
      const fechaFin = this.formatearFecha(fechasOrdenadas[fechasOrdenadas.length - 1]);

      let fechaTexto = fechaInicio;
      if (fechasOrdenadas.length > 1) {
        fechaTexto = `${fechaInicio} al ${fechaFin} (${fechasOrdenadas.length} días)`;
      }

      return {
        nro: index + 1,
        id: grupo.id,
        fecha: fechaTexto,
        actividades: grupo.actividades,
        horas: grupo.horas,
        observaciones: grupo.observaciones
      };
    });
  }

  // ============================================
  // GUARDAR OBSERVACIONES DE ACTIVIDAD EN LOCALSTORAGE
  // ============================================
  guardarObservacionesActividadEnLocalStorage(): void {
    if (!this.actividadesAgrupadas || this.actividadesAgrupadas.length === 0) return;

    const key = `actividades_observaciones_${this.idVinculacion}`;
    const data = this.actividadesAgrupadas.map((act: any) => ({
      id: act.id,
      observaciones: act.observaciones
    }));
    localStorage.setItem(key, JSON.stringify(data));
    console.log('✅ Observaciones de actividades guardadas en localStorage');
  }

  cargarObservacionesActividadDesdeLocalStorage(): void {
    if (!this.actividadesAgrupadas || this.actividadesAgrupadas.length === 0) return;

    const key = `actividades_observaciones_${this.idVinculacion}`;
    const guardado = localStorage.getItem(key);

    if (guardado) {
      try {
        const data = JSON.parse(guardado);
        if (data && data.length > 0) {
          data.forEach((item: any) => {
            const actividad = this.actividadesAgrupadas.find((a: any) => a.id === item.id);
            if (actividad) {
              actividad.observaciones = item.observaciones || 'Sin observaciones';
            }
          });
          console.log('✅ Observaciones de actividades cargadas desde localStorage');
        }
      } catch (e) {
        console.error('❌ Error al parsear observaciones del localStorage:', e);
      }
    }
  }

  // ============================================
  // NUEVO: EDITAR OBSERVACIÓN DE ACTIVIDAD
  // ============================================
  editarObservacionActividad(index: number): void {
    if (!this.esEstudiante) {
      this.mostrarModal('Permisos insuficientes', 'Solo los estudiantes pueden editar observaciones.', 'warning');
      return;
    }
    const actividad = this.actividadesAgrupadas[index];
    if (!actividad) return;

    this.editandoObservacionActividad = index;
    this.observacionActividadEdit = actividad.observaciones || '';
    this.cdr.markForCheck();
  }

  guardarObservacionActividad(index: number): void {
    const actividad = this.actividadesAgrupadas[index];
    if (!actividad) return;

    actividad.observaciones = this.observacionActividadEdit || 'Sin observaciones';
    this.editandoObservacionActividad = null;
    this.observacionActividadEdit = '';

    this.guardarObservacionesActividadEnLocalStorage();

    this.mostrarModal('Guardado', 'Observación actualizada correctamente.', 'success');
    this.cdr.markForCheck();
  }

  cancelarEdicionObservacionActividad(): void {
    this.editandoObservacionActividad = null;
    this.observacionActividadEdit = '';
    this.cdr.markForCheck();
  }

  // ============================================
  // ASEGURAR FECHAS
  // ============================================
  asegurarFechas(): void {
    if (!this.informe) return;

    const fechaInicioAct = this.datosInicioActividades?.fecha_inicio;
    const fechaFinAct = this.datosInicioActividades?.fecha_fin;

    console.log('📅 Fechas desde inicio-actividades:', {
      fecha_inicio: fechaInicioAct,
      fecha_fin: fechaFinAct
    });

    if (!this.informe.datos_generales) {
      this.informe.datos_generales = {};
    }

    const fechaInicioActual = this.informe.datos_generales.fecha_inicio;
    const fechaInicioInvalida = !fechaInicioActual ||
      fechaInicioActual === 'Invalid Date' ||
      fechaInicioActual === 'N/A' ||
      fechaInicioActual === '';

    if (fechaInicioInvalida && fechaInicioAct) {
      console.log('📅 Asignando fecha_inicio desde inicio-actividades:', fechaInicioAct);
      this.informe.datos_generales.fecha_inicio = this.formatearFecha(fechaInicioAct);
    }

    const fechaFinalActual = this.informe.datos_generales.fecha_final;
    const fechaFinalInvalida = !fechaFinalActual ||
      fechaFinalActual === 'Invalid Date' ||
      fechaFinalActual === 'N/A' ||
      fechaFinalActual === '';

    if (fechaFinalInvalida && fechaFinAct) {
      console.log('📅 Asignando fecha_final desde inicio-actividades:', fechaFinAct);
      this.informe.datos_generales.fecha_final = this.formatearFecha(fechaFinAct);
    }

    if (!fechaInicioInvalida && !fechaFinalInvalida) {
      console.log('✅ Ambas fechas ya son válidas en el informe:', {
        fecha_inicio: this.informe.datos_generales.fecha_inicio,
        fecha_final: this.informe.datos_generales.fecha_final
      });
    }

    console.log('📅 Fechas finales en el informe:', {
      fecha_inicio: this.informe.datos_generales?.fecha_inicio,
      fecha_final: this.informe.datos_generales?.fecha_final
    });
  }

  obtenerFechaFinal(): string {
    if (!this.informe) return 'N/A';

    const fechaFinalInforme = this.informe.datos_generales?.fecha_final;
    if (fechaFinalInforme &&
      fechaFinalInforme !== 'Invalid Date' &&
      fechaFinalInforme !== 'N/A' &&
      fechaFinalInforme !== '') {
      return fechaFinalInforme;
    }

    if (this.datosInicioActividades?.fecha_fin) {
      return this.formatearFecha(this.datosInicioActividades.fecha_fin);
    }

    return 'N/A';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      let fechaStr = fecha;
      if (fechaStr.includes('T')) {
        fechaStr = fechaStr.split('T')[0];
      }
      if (fechaStr.endsWith('Z')) {
        fechaStr = fechaStr.slice(0, -1);
      }

      const date = new Date(fechaStr + 'T00:00:00');
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Fecha inválida:', fecha);
        return fecha;
      }

      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('❌ Error formateando fecha:', fecha, error);
      return fecha;
    }
  }

  inicializarParametros(): void {
    this.parametros.puntualidad = 0;
    this.parametros.trabajoAutonomo = 0;
    this.parametros.asistencia = 0;
    this.parametros.eticaProfesional = 0;
    this.parametros.cumpleTareas = 0;
    this.parametros.actitudProactiva = 0;
    this.parametros.cooperaPermanentemente = 0;
    this.parametros.respetoAutoridad = 0;
    this.parametros.constanciaPredisposicion = 0;
    this.parametros.responsabilidadEsmero = 0;
    this.parametros.habilidadPractica = 0;
  }

  // ============================================
  // OBJETIVOS
  // ============================================
  cargarObjetivosDesdeLocalStorage(): void {
    if (!this.informe) return;

    const key = `objetivos_editados_${this.idVinculacion}`;
    const guardado = localStorage.getItem(key);

    if (guardado) {
      try {
        const objetivosGuardados = JSON.parse(guardado);
        if (objetivosGuardados && objetivosGuardados.length > 0) {
          this.informe.objetivos_proyecto = objetivosGuardados;
          console.log('✅ Objetivos cargados desde localStorage:', objetivosGuardados);
        }
      } catch (e) {
        console.error('❌ Error al parsear objetivos del localStorage:', e);
      }
    }
  }

  guardarObjetivosEnLocalStorage(): void {
    if (!this.informe || !this.informe.objetivos_proyecto) return;

    const key = `objetivos_editados_${this.idVinculacion}`;
    localStorage.setItem(key, JSON.stringify(this.informe.objetivos_proyecto));
    console.log('✅ Objetivos guardados en localStorage');
  }

  activarEdicionObjetivos(): void {
    if (!this.esEstudiante) {
      this.mostrarModal('Permisos insuficientes', 'Solo estudiantes pueden editar objetivos.', 'warning');
      return;
    }
    if (!this.informe || !this.informe.objetivos_proyecto) {
      this.mostrarModal('Sin objetivos', 'No hay objetivos para editar.', 'warning');
      return;
    }

    this.editandoObjetivos = true;
    this.objetivosEditados = this.informe.objetivos_proyecto.map((obj: any) => ({ ...obj }));
    this.cdr.markForCheck();
  }

  guardarEdicionObjetivos(): void {
    if (!this.objetivosEditados) return;

    this.informe.objetivos_proyecto = this.objetivosEditados.map((obj: any) => ({ ...obj }));
    this.guardarObjetivosEnLocalStorage();
    this.editandoObjetivos = false;

    this.mostrarModal('Guardado', 'Objetivos actualizados correctamente.', 'success');

    this.cdr.markForCheck();
  }

  cancelarEdicionObjetivos(): void {
    this.editandoObjetivos = false;
    this.objetivosEditados = [];
    this.cdr.markForCheck();
  }

  actualizarObjetivo(index: number, campo: string, event: any): void {
    if (this.objetivosEditados && this.objetivosEditados[index]) {
      let valor = event.target.value;

      if (campo === 'avance') {
        valor = valor.replace(/%/g, '').trim();
        if (valor === '') {
          valor = '0';
        }
        const numero = parseInt(valor, 10);
        if (!isNaN(numero) && numero >= 0) {
          const valorFinal = Math.min(numero, 100);
          this.objetivosEditados[index][campo] = `${valorFinal}%`;
        } else {
          this.objetivosEditados[index][campo] = '0%';
        }
      } else {
        this.objetivosEditados[index][campo] = valor;
      }
      this.cdr.markForCheck();
    }
  }

  obtenerNumeroAvance(avance: string): string {
    if (!avance) return '0';
    return avance.replace(/%/g, '').trim();
  }

  agregarObjetivo(): void {
    if (!this.objetivosEditados) return;

    const nuevoObjetivo = {
      objetivo: '',
      actividades: '',
      avance: '0%',
      resultados: 'Pendiente'
    };

    this.objetivosEditados.push(nuevoObjetivo);
    this.cdr.markForCheck();
  }

  eliminarObjetivo(index: number): void {
    if (!this.objetivosEditados) return;

    this.objetivoAEliminar = index;
    this.mostrarModalConfirmacion(
      'Confirmar eliminación',
      '¿Estás seguro de eliminar este objetivo?',
      () => this.confirmarEliminarObjetivo()
    );
  }

  confirmarEliminarObjetivo(): void {
    if (this.objetivoAEliminar === null) return;
    this.objetivosEditados.splice(this.objetivoAEliminar, 1);
    this.objetivoAEliminar = null;
    this.cdr.markForCheck();
  }

  // ============================================
  // EVALUACIÓN
  // ============================================
  calcularPromedio(): void {
    const valores = [
      this.parametros.puntualidad,
      this.parametros.trabajoAutonomo,
      this.parametros.asistencia,
      this.parametros.eticaProfesional,
      this.parametros.cumpleTareas,
      this.parametros.actitudProactiva,
      this.parametros.cooperaPermanentemente,
      this.parametros.respetoAutoridad,
      this.parametros.constanciaPredisposicion,
      this.parametros.responsabilidadEsmero,
      this.parametros.habilidadPractica
    ];

    const suma = valores.reduce((acc, val) => acc + (val || 0), 0);

    if (suma === 0) {
      this.notaFinalCalculada = 0;
    } else {
      this.notaFinalCalculada = parseFloat((suma / valores.length).toFixed(2));
    }

    this.notaEnLetras = this.convertirNotaALetras(this.notaFinalCalculada);
  }

  convertirNotaALetras(nota: number): string {
    const notasEnLetras: Record<number, string> = {
      10: 'Diez',
      9: 'Nueve',
      8: 'Ocho',
      7: 'Siete',
      6: 'Seis',
      5: 'Cinco',
      4: 'Cuatro',
      3: 'Tres',
      2: 'Dos',
      1: 'Uno',
      0: 'Cero'
    };

    const entera = Math.floor(nota);
    const decimal = Math.round((nota - entera) * 100);

    let texto = notasEnLetras[entera] || entera.toString();
    if (decimal > 0) {
      texto += ` con ${decimal}/100`;
    }
    return texto;
  }

  guardarEvaluacion(): void {
    if (!this.idVinculacion || this.idVinculacion <= 0) {
      this.mostrarModal('Error', 'ID de vinculación no válido para guardar.', 'error');
      this.cdr.markForCheck();
      return;
    }

    const tieneValores = Object.values(this.parametros).some(val => val > 0);
    if (!tieneValores && !this.observaciones) {
      this.mostrarModal('Datos incompletos', 'Debes ingresar al menos un parámetro de evaluación o una observación.', 'warning');
      this.cdr.markForCheck();
      return;
    }

    this.guardando = true;
    this.error = null;
    this.mensajeExito = '';
    this.cdr.markForCheck();

    this.calcularPromedio();

    const datos = {
      notaFinal: this.notaFinalCalculada,
      observaciones: this.observaciones || '',
      puntualidad: this.parametros.puntualidad || 0,
      trabajo_autonomo: this.parametros.trabajoAutonomo || 0,
      asistencia: this.parametros.asistencia || 0,
      etica_profesional: this.parametros.eticaProfesional || 0,
      cumple_tareas: this.parametros.cumpleTareas || 0,
      actitud_proactiva: this.parametros.actitudProactiva || 0,
      coopera_permanentemente: this.parametros.cooperaPermanentemente || 0,
      respeto_autoridad: this.parametros.respetoAutoridad || 0,
      constancia_predisposicion: this.parametros.constanciaPredisposicion || 0,
      responsabilidad_esmero: this.parametros.responsabilidadEsmero || 0,
      habilidad_practica: this.parametros.habilidadPractica || 0
    };

    console.log('📤 Enviando evaluación al backend:', datos);

    this.informeFinalService.guardarEvaluacion(this.idVinculacion, datos)
      .pipe(finalize(() => {
        this.guardando = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (response) => {
          console.log('✅ Evaluación guardada en el backend:', response);
          this.mostrarModal('Guardado', 'Evaluación guardada correctamente.', 'success');

          this.cargarInforme();
          this.editandoEvaluacion = false;

          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al guardar evaluación:', err);
          this.mostrarModal('Error', 'Error al guardar la evaluación. Por favor, intenta nuevamente.', 'error');
          this.cdr.markForCheck();
        }
      });
  }

  toggleEditEvaluacion(): void {
    this.editandoEvaluacion = !this.editandoEvaluacion;
    if (!this.editandoEvaluacion) {
      this.cargarInforme();
    }
  }

  validarParametro(event: any, parametro: string): void {
    let valor = parseFloat(event.target.value);
    if (isNaN(valor) || valor < 0) {
      valor = 0;
    } else if (valor > 10) {
      valor = 10;
    }
    this.parametros[parametro as keyof typeof this.parametros] = valor;
    this.calcularPromedio();
    this.cdr.markForCheck();
  }

  obtenerValorParametro(key: string): number {
    const valor = this.parametros[key as keyof typeof this.parametros];
    return valor ?? 0;
  }

  reiniciarParametros(): void {
    Object.keys(this.parametros).forEach(key => {
      this.parametros[key as keyof typeof this.parametros] = 0;
    });
    this.observaciones = '';
    this.calcularPromedio();
    this.cdr.markForCheck();
  }

  volverALista(): void {
    this.router.navigate(['/vinculacion/docente/seleccionar'], {
      queryParams: {
        estudianteId: localStorage.getItem('estudiante_seleccionado_id')
      }
    });
  }

  getEstadoClase(estado: string): string {
    const clases: Record<string, string> = {
      'CALIFICADO': 'estado-calificado',
      'EN_PROCESO': 'estado-proceso',
      'PENDIENTE': 'estado-pendiente'
    };
    return clases[estado] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos: Record<string, string> = {
      'CALIFICADO': '✅ Calificado',
      'EN_PROCESO': '🔄 En proceso',
      'PENDIENTE': '⏳ Pendiente'
    };
    return textos[estado] || estado;
  }

  // ============================================
  // EXPORTAR A EXCEL
  // ============================================
  async exportarExcelIndividual(): Promise<void> {
    if (!this.idVinculacion || !this.informe) {
      this.mostrarModal('Sin datos', 'No hay datos para exportar.', 'warning');
      return;
    }
    try {
      await this.excelService.exportarHojaIndividual(
        this.idVinculacion,
        'Informe final',
        this.informe
      );
      this.mostrarModal('Éxito', 'Archivo Excel exportado correctamente.', 'success');
    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
      this.mostrarModal('Error', 'Error al exportar el archivo Excel.', 'error');
    }
  }

  async exportarExcelCompleto(): Promise<void> {
    if (!this.idVinculacion) {
      this.mostrarModal('Sin datos', 'No hay ID de vinculación para exportar.', 'warning');
      return;
    }
    try {
      await this.excelService.exportarExcelCompleto(this.idVinculacion);
      this.mostrarModal('Éxito', 'Archivo Excel completo exportado correctamente.', 'success');
    } catch (error) {
      console.error('❌ Error al exportar Excel completo:', error);
      this.mostrarModal('Error', 'Error al exportar el archivo Excel completo.', 'error');
    }
  }
}