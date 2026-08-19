import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VinculacionService } from '../../../services/vinculacion.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { EstudianteDocente } from '../../../models/vinculacion.model';
import { finalize } from 'rxjs/operators';
import { InformeFinalService } from '../../../services/informe-final.service';

@Component({
  selector: 'app-seleccionar-estudiante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seleccionar-estudiante.component.html',
  styleUrls: ['./seleccionar-estudiante.component.scss']
})
export class SeleccionarEstudianteComponent implements OnInit {
  private service = inject(VinculacionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private informeFinalService = inject(InformeFinalService);

  estudiantes: EstudianteDocente[] = [];
  filtered: EstudianteDocente[] = [];
  loading = true;
  error: string | null = null;
  terminoBusqueda: string = '';

  estudianteSeleccionado: EstudianteDocente | null = null;
  mostrandoDocumentos = false;

  documentos = [
    { 
      id: 'inicio-actividades', 
      nombre: '📋 Inicio de Actividades', 
      descripcion: 'Ver y editar proyecto y fechas', 
      ruta: 'inicio-actividades' 
    },
    { 
      id: 'control-asistencia', 
      nombre: '📋 Control de Asistencia', 
      descripcion: 'Ver y editar observaciones', 
      ruta: 'control-asistencia' 
    },
    { 
      id: 'registro-asistencia-tutor', 
      nombre: '📝 Registro Asistencia Tutor', 
      descripcion: 'Ver y editar todo el recuadro', 
      ruta: 'registro-asistencia-tutor' 
    },
    { 
      id: 'informe-final', 
      nombre: '📄 Informe Final', 
      descripcion: 'Ver y editar evaluación final', 
      ruta: 'informe-final' 
    }
  ];

  ngOnInit(): void {
    if (!this.authService.tieneAlgunRol(['DOCENTE'])) {
      this.error = '⚠️ No tienes permisos para ver esta pantalla. Solo docentes pueden acceder.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }
    
    this.verificarCambiosPendientes();
    this.cargarEstudiantes();
  }

  private verificarCambiosPendientes(): void {
    const keys = Object.keys(localStorage);
    const cambiados = keys.filter(key => key.startsWith('estado_cambiado_'));
    
    cambiados.forEach(key => {
      const idVinculacion = key.replace('estado_cambiado_', '');
      console.log(`🔄 Hay cambio pendiente para vinculación ${idVinculacion}`);
      localStorage.setItem(`actualizar_estado_${idVinculacion}`, 'true');
    });
  }

  private aplicarActualizacionesPendientes(): void {
    const keys = Object.keys(localStorage);
    const actualizarKeys = keys.filter(key => key.startsWith('actualizar_estado_'));
    
    actualizarKeys.forEach(key => {
      const idVinculacion = Number(key.replace('actualizar_estado_', ''));
      console.log(`🔄 Actualizando estado para vinculación ${idVinculacion}`);
      
      const estudiante = this.estudiantes.find(e => e.id_vinculacion === idVinculacion);
      if (estudiante) {
        const calificado = localStorage.getItem(`estudiante_calificado_${idVinculacion}`);
        if (calificado === 'true') {
          estudiante.estado_informe = 'CALIFICADO';
          const notaGuardada = localStorage.getItem(`nota_estudiante_${idVinculacion}`);
          estudiante.nota_final = notaGuardada ? parseFloat(notaGuardada) : 0;
        } else {
          estudiante.estado_informe = 'PENDIENTE';
          estudiante.nota_final = null;
        }
      }
      
      localStorage.removeItem(key);
      localStorage.removeItem(`estado_cambiado_${idVinculacion}`);
      localStorage.removeItem(`estudiante_calificado_${idVinculacion}`);
      localStorage.removeItem(`nota_estudiante_${idVinculacion}`);
    });
    
    this.filtered = [...this.estudiantes];
  }

  cargarEstudiantes(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();
    
    this.service.obtenerEstudiantesAsignados()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          console.log('📊 Lista de estudiantes cargada:', data);
          this.estudiantes = data;
          this.filtered = data;
          
          // ✅ VERIFICAR EL ESTADO REAL DE CADA ESTUDIANTE
          this.verificarEstadoEstudiantes();
          
          // ✅ APLICAR ACTUALIZACIONES PENDIENTES
          this.aplicarActualizacionesPendientes();
          
          this.cdr.markForCheck();
          this.verificarEstudianteDesdeQueryParams();
        },
        error: (err) => {
          console.error('❌ Error al cargar estudiantes:', err);
          this.error = 'No se pudieron cargar los estudiantes.';
          this.cdr.markForCheck();
        }
      });
  }

  // ✅ VERIFICAR ESTADO REAL CONSULTANDO EL INFORME FINAL
  verificarEstadoEstudiantes(): void {
    // Para cada estudiante, consultar el informe final real
    this.estudiantes.forEach(estudiante => {
      this.consultarEstadoReal(estudiante);
    });
  }

  // ✅ CONSULTAR EL INFORME FINAL PARA OBTENER EL ESTADO REAL
  consultarEstadoReal(estudiante: EstudianteDocente): void {
    const idVinculacion = estudiante.id_vinculacion;
    
    this.informeFinalService.obtenerInformeFinal(idVinculacion).subscribe({
      next: (informe) => {
        // ✅ OBTENER LA NOTA DEL INFORME FINAL
        const nota = informe?.evaluacion_final?.nota_final;
        const parametros = informe?.evaluacion_final?.parametros;
        
        // ✅ VERIFICAR SI HAY NOTA VÁLIDA
        const tieneNotaValida = nota && 
                               nota !== 'Sin calificar' && 
                               nota !== 'N/A' && 
                               parseFloat(nota) > 0;
        
        // ✅ VERIFICAR SI HAY PARÁMETROS CON VALORES > 0
        let tieneParametrosValidos = false;
        if (parametros) {
          tieneParametrosValidos = Object.values(parametros).some((val: any) => Number(val) > 0);
        }
        
        // ✅ SI TIENE NOTA O PARÁMETROS, ESTÁ CALIFICADO
        const estaCalificado = tieneNotaValida || tieneParametrosValidos;
        
        if (estaCalificado) {
          estudiante.estado_informe = 'CALIFICADO';
          estudiante.nota_final = tieneNotaValida ? parseFloat(nota) : 0;
          console.log(`✅ Estudiante ${estudiante.estudiante} - CALIFICADO (Nota: ${estudiante.nota_final})`);
        } else {
          estudiante.estado_informe = 'PENDIENTE';
          estudiante.nota_final = null;
          console.log(`❌ Estudiante ${estudiante.estudiante} - SIN CALIFICAR`);
        }
        
        // Actualizar el filtro
        this.filtered = [...this.estudiantes];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(`❌ Error al consultar informe para ${estudiante.estudiante}:`, err);
        // Si hay error, mantener el estado como pendiente
        estudiante.estado_informe = 'PENDIENTE';
        estudiante.nota_final = null;
        this.filtered = [...this.estudiantes];
        this.cdr.markForCheck();
      }
    });
  }

  // ✅ VERIFICAR ESTADO DE UN ESTUDIANTE ESPECÍFICO
  verificarEstadoEstudiante(estudiante: EstudianteDocente): void {
    // Consultar el informe final
    this.informeFinalService.obtenerInformeFinal(estudiante.id_vinculacion).subscribe({
      next: (informe) => {
        const nota = informe?.evaluacion_final?.nota_final;
        const parametros = informe?.evaluacion_final?.parametros;
        
        const tieneNotaValida = nota && 
                               nota !== 'Sin calificar' && 
                               nota !== 'N/A' && 
                               parseFloat(nota) > 0;
        
        let tieneParametrosValidos = false;
        if (parametros) {
          tieneParametrosValidos = Object.values(parametros).some((val: any) => Number(val) > 0);
        }
        
        const estaCalificado = tieneNotaValida || tieneParametrosValidos;
        
        if (estaCalificado) {
          estudiante.estado_informe = 'CALIFICADO';
          estudiante.nota_final = tieneNotaValida ? parseFloat(nota) : 0;
        } else {
          estudiante.estado_informe = 'PENDIENTE';
          estudiante.nota_final = null;
        }
        
        // Actualizar el estudiante seleccionado si es el mismo
        if (this.estudianteSeleccionado && this.estudianteSeleccionado.id_vinculacion === estudiante.id_vinculacion) {
          this.estudianteSeleccionado = { ...estudiante };
        }
        
        this.filtered = [...this.estudiantes];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Error al verificar estado:', err);
        estudiante.estado_informe = 'PENDIENTE';
        estudiante.nota_final = null;
        this.filtered = [...this.estudiantes];
        this.cdr.markForCheck();
      }
    });
  }

  verificarEstudianteDesdeQueryParams(): void {
    const estudianteId = this.route.snapshot.queryParamMap.get('estudianteId');
    
    if (estudianteId) {
      const estudiante = this.estudiantes.find(
        est => String(est.id_vinculacion) === estudianteId
      );
      
      if (estudiante) {
        this.seleccionarEstudiante(estudiante);
      } else {
        this.router.navigate([], {
          queryParams: { estudianteId: null },
          queryParamsHandling: 'merge'
        });
      }
    }
  }

  buscar(): void {
    const term = this.terminoBusqueda.toLowerCase().trim();
    if (!term) {
      this.filtered = this.estudiantes;
    } else {
      this.filtered = this.estudiantes.filter(est =>
        est.estudiante?.toLowerCase().includes(term) ||
        est.cedula?.includes(term) ||
        est.entidad_beneficiaria?.toLowerCase().includes(term) ||
        est.carrera?.toLowerCase().includes(term)
      );
    }
    this.cdr.markForCheck();
  }

  seleccionarEstudiante(estudiante: EstudianteDocente): void {
    // ✅ Verificar estado antes de seleccionar
    this.verificarEstadoEstudiante(estudiante);
    
    localStorage.setItem('estudiante_seleccionado_id', String(estudiante.id_vinculacion));
    localStorage.setItem('estudiante_seleccionado_nombre', estudiante.estudiante);
    
    this.estudianteSeleccionado = estudiante;
    this.mostrandoDocumentos = true;
    this.cdr.markForCheck();
  }

  volverALista(): void {
    localStorage.removeItem('estudiante_seleccionado_id');
    localStorage.removeItem('estudiante_seleccionado_nombre');
    
    this.router.navigate([], {
      queryParams: { estudianteId: null },
      queryParamsHandling: 'merge'
    });
    
    this.estudianteSeleccionado = null;
    this.mostrandoDocumentos = false;
    
    this.cargarEstudiantes();
    this.cdr.markForCheck();
  }

  irADocumento(ruta: string): void {
    if (!this.estudianteSeleccionado) return;
    const id = this.estudianteSeleccionado.id_vinculacion;
    this.router.navigate(['/vinculacion/docente/estudiante', id, ruta]);
  }

  getEstadoInforme(estado: string): string {
    if (estado === 'CALIFICADO') {
      return '✅ Calificado';
    }
    return '❌ Sin calificar';
  }

  getEstadoClase(estado: string): string {
    if (estado === 'CALIFICADO') {
      return 'estado-calificado';
    }
    return 'estado-pendiente';
  }
}