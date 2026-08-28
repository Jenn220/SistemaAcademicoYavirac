import { Component, OnInit, inject, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InformeFinalService } from '../../../services/informe-final.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { VolverArchivosComponent } from '../../../components/volver-archivos/volver-archivos.component';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../auth/services/auth.service';
import { ExcelExportService } from '../../../services/excel-export.service';
import { InicioActividadesService } from '../../../services/inicio-actividades.service';

@Component({
  selector: 'app-informe-final',
  standalone: true,
  imports: [CommonModule, FormsModule, VolverArchivosComponent],
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
        this.error = '⚠️ No se encontró un ID de vinculación. Por favor, selecciona un estudiante.';
        this.loading = false;
        this.cdr.markForCheck();
        return;
      }
      
      console.warn('⚠️ No se pudo determinar el rol, intentando obtener vinculación activa como fallback...');
      this.obtenerVinculacionActiva();
    });
  }

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
            this.error = '⚠️ No tienes una vinculación activa. Contacta al coordinador.';
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          console.error('❌ Error al obtener vinculación activa:', err);
          this.error = '⚠️ No se pudo obtener tu vinculación activa. Verifica tu conexión.';
          this.cdr.markForCheck();
        }
      });
  }

  cargarInforme(): void {
    if (!this.idVinculacion || this.idVinculacion <= 0) {
      this.error = '⚠️ ID de vinculación no válido (debe ser mayor que 0)';
      this.loading = false;
      this.cdr.markForCheck();
      console.error('❌ Error: ID de vinculación inválido:', this.idVinculacion);
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    console.log('📄 Cargando informe con ID:', this.idVinculacion);

    // Cargar informe final e inicio-actividades en paralelo
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
          this.error = '⚠️ No se encontró información para esta vinculación.';
          this.cdr.markForCheck();
          return;
        }

        // ✅ PROCESAR ACTIVIDADES AGRUPADAS
        this.actividadesAgrupadas = this.procesarActividadesAgrupadas();

        // ✅ CORREGIR: Asegurar que ambas fechas estén presentes
        this.asegurarFechas();

        this.cargarObjetivosDesdeLocalStorage();

        // ✅ INICIALIZAR PARÁMETROS: Si no vienen del backend, se ponen en 0
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
        this.error = 'Error al cargar los datos. Por favor, intenta nuevamente.';
        this.cdr.markForCheck();
      });
  }

  // ============================================
  // ✅ MÉTODO DE AGRUPACIÓN DE ACTIVIDADES
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
          count: 1
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
        fecha: fechaTexto,
        actividades: grupo.actividades,
        horas: grupo.horas,
        observaciones: grupo.observaciones
      };
    });
  }

  /**
   * ✅ CORREGIDO: Asegurar que ambas fechas (inicio y final) estén presentes
   * Si el informe no tiene fecha_inicio o fecha_final, las obtiene de inicio-actividades
   */
  asegurarFechas(): void {
    if (!this.informe) return;
    
    // Obtener fechas desde inicio-actividades
    const fechaInicioAct = this.datosInicioActividades?.fecha_inicio;
    const fechaFinAct = this.datosInicioActividades?.fecha_fin;
    
    console.log('📅 Fechas desde inicio-actividades:', {
      fecha_inicio: fechaInicioAct,
      fecha_fin: fechaFinAct
    });
    
    // Inicializar datos_generales si no existe
    if (!this.informe.datos_generales) {
      this.informe.datos_generales = {};
    }
    
    // --- ACTUALIZAR FECHA DE INICIO ---
    const fechaInicioActual = this.informe.datos_generales.fecha_inicio;
    const fechaInicioInvalida = !fechaInicioActual || 
                                 fechaInicioActual === 'Invalid Date' ||
                                 fechaInicioActual === 'N/A' ||
                                 fechaInicioActual === '';
    
    if (fechaInicioInvalida && fechaInicioAct) {
      console.log('📅 Asignando fecha_inicio desde inicio-actividades:', fechaInicioAct);
      this.informe.datos_generales.fecha_inicio = this.formatearFecha(fechaInicioAct);
    }
    
    // --- ACTUALIZAR FECHA FINAL ---
    const fechaFinalActual = this.informe.datos_generales.fecha_final;
    const fechaFinalInvalida = !fechaFinalActual || 
                                fechaFinalActual === 'Invalid Date' ||
                                fechaFinalActual === 'N/A' ||
                                fechaFinalActual === '';
    
    if (fechaFinalInvalida && fechaFinAct) {
      console.log('📅 Asignando fecha_final desde inicio-actividades:', fechaFinAct);
      this.informe.datos_generales.fecha_final = this.formatearFecha(fechaFinAct);
    }
    
    // --- SI AMBAS FECHAS SON VÁLIDAS, NO HACER NADA ---
    if (!fechaInicioInvalida && !fechaFinalInvalida) {
      console.log('✅ Ambas fechas ya son válidas en el informe:', {
        fecha_inicio: this.informe.datos_generales.fecha_inicio,
        fecha_final: this.informe.datos_generales.fecha_final
      });
    }
    
    // --- LOG FINAL PARA DEPURACIÓN ---
    console.log('📅 Fechas finales en el informe:', {
      fecha_inicio: this.informe.datos_generales?.fecha_inicio,
      fecha_final: this.informe.datos_generales?.fecha_final
    });
  }

  /**
   * ✅ Obtener la fecha final priorizando el informe, luego inicio-actividades
   */
  obtenerFechaFinal(): string {
    if (!this.informe) return 'N/A';
    
    // Priorizar fecha del informe
    const fechaFinalInforme = this.informe.datos_generales?.fecha_final;
    if (fechaFinalInforme && 
        fechaFinalInforme !== 'Invalid Date' &&
        fechaFinalInforme !== 'N/A' &&
        fechaFinalInforme !== '') {
      return fechaFinalInforme;
    }
    
    // Si no hay fecha en el informe, usar la de inicio-actividades
    if (this.datosInicioActividades?.fecha_fin) {
      return this.formatearFecha(this.datosInicioActividades.fecha_fin);
    }
    
    return 'N/A';
  }

  /**
   * ✅ Formatear fecha correctamente para mostrar en el HTML
   * Maneja fechas ISO y formatos comunes
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      // Limpiar la fecha: remover 'Z' y 'T'
      let fechaStr = fecha;
      if (fechaStr.includes('T')) {
        fechaStr = fechaStr.split('T')[0];
      }
      if (fechaStr.endsWith('Z')) {
        fechaStr = fechaStr.slice(0, -1);
      }
      
      // Crear fecha y verificar que sea válida
      const date = new Date(fechaStr + 'T00:00:00');
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Fecha inválida:', fecha);
        return fecha; // Retornar la fecha original si no se puede formatear
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
      console.warn('⚠️ Solo estudiantes pueden editar objetivos');
      return;
    }
    if (!this.informe || !this.informe.objetivos_proyecto) {
      console.warn('⚠️ No hay objetivos para editar');
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
    
    this.mensajeExito = '✅ Objetivos actualizados correctamente';
    setTimeout(() => {
      this.mensajeExito = '';
      this.cdr.markForCheck();
    }, 3000);
    
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
      this.error = '⚠️ ID de vinculación no válido para guardar.';
      this.cdr.markForCheck();
      return;
    }

    const tieneValores = Object.values(this.parametros).some(val => val > 0);
    if (!tieneValores && !this.observaciones) {
      this.error = '⚠️ Debes ingresar al menos un parámetro de evaluación o una observación.';
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
          this.mensajeExito = '✅ Evaluación guardada correctamente';
          
          this.cargarInforme();
          this.editandoEvaluacion = false;
          
          setTimeout(() => {
            this.mensajeExito = '';
            this.cdr.markForCheck();
          }, 3000);
          
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al guardar evaluación:', err);
          this.error = 'Error al guardar la evaluación. Por favor, intenta nuevamente.';
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
    
    if (confirm('¿Estás seguro de eliminar este objetivo?')) {
      this.objetivosEditados.splice(index, 1);
      this.cdr.markForCheck();
    }
  }

  async exportarExcelIndividual(): Promise<void> {
    if (!this.idVinculacion || !this.informe) {
      alert('No hay datos para exportar.');
      return;
    }
    try {
      await this.excelService.exportarHojaIndividual(
        this.idVinculacion,
        'Informe final',
        this.informe
      );
    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
      alert('Error al exportar el archivo Excel.');
    }
  }

  async exportarExcelCompleto(): Promise<void> {
    if (!this.idVinculacion) {
      alert('No hay ID de vinculación para exportar.');
      return;
    }
    try {
      await this.excelService.exportarExcelCompleto(this.idVinculacion);
    } catch (error) {
      console.error('❌ Error al exportar Excel completo:', error);
      alert('Error al exportar el archivo Excel completo.');
    }
  }
}