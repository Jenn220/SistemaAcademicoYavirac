import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InicioActividadesService } from '../../../services/inicio-actividades.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { VinculacionService } from '../../../services/vinculacion.service';
import { InicioActividadesResponse } from '../../../models';
import { finalize } from 'rxjs/operators';
import { VolverArchivosComponent } from '../../../components/volver-archivos/volver-archivos.component';

@Component({
  selector: 'app-inicio-actividades',
  standalone: true,
  imports: [CommonModule, FormsModule, VolverArchivosComponent],
  templateUrl: './inicio-actividades.component.html',
  styleUrls: ['./inicio-actividades.component.scss']
})
export class InicioActividadesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(InicioActividadesService);
  private authService = inject(AuthService);
  private vinculacionService = inject(VinculacionService);
  private cdr = inject(ChangeDetectorRef);

  // Datos principales
  data: InicioActividadesResponse | null = null;
  idVinculacion: number = 0;
  
  // Estados
  isLoading = true;
  error: string | null = null;
  
  // Roles
  isEstudiante = false;
  isDocente = false;
  
  // Edición
  editMode = false;
  isEditingEnabled = true;
  editedFields = {
    nombre_proyecto: '',
    fecha_inicio: '', // ✅ AGREGADO
    fecha_fin: ''
  };
  
  // Fecha original para validaciones
  fechaInicioOriginal: string = '';

  ngOnInit(): void {
    const roles = this.authService.roles();
    this.isEstudiante = roles.includes('ESTUDIANTE');
    this.isDocente = roles.includes('DOCENTE');

    // Validar permisos: solo ESTUDIANTE o DOCENTE
    const puedeVer = this.isEstudiante || this.isDocente;
    if (!puedeVer) {
      this.error = '⚠️ No tienes permisos para ver esta pantalla.';
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    const idParam = this.route.snapshot.params['id'];
    
    if (idParam && idParam > 0) {
      this.idVinculacion = Number(idParam);
      this.cargarDatos();
    } else {
      this.obtenerVinculacionActiva();
    }
  }

  obtenerVinculacionActiva(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    
    this.vinculacionService.obtenerVinculacionActiva()
      .pipe(finalize(() => {
        this.isLoading = false;
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
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();
    
    console.log('🔵 Cargando Inicio Actividades para vinculación:', this.idVinculacion);
    
    this.service.obtenerInicioActividades(this.idVinculacion)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (response) => {
          console.log('📦 Datos de Inicio Actividades recibidos:', response);
          this.data = response;
          
          // Guardar fecha de inicio original para validaciones
          this.fechaInicioOriginal = response.fecha_inicio || '';
          
          // Verificar si ya fue editado (localStorage)
          this.verificarEstadoEdicion();
          
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('❌ Error al cargar Inicio Actividades:', err);
          this.error = 'No se pudieron cargar los datos.';
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Verifica si el proyecto ya fue editado anteriormente
   * Usa localStorage para persistir el estado "una sola vez"
   */
  verificarEstadoEdicion(): void {
    if (!this.data) return;
    
    const key = `inicio_actividades_editado_${this.idVinculacion}`;
    const yaEditado = localStorage.getItem(key);
    
    if (yaEditado === 'true') {
      this.isEditingEnabled = false;
      console.log('🔒 Este proyecto ya fue editado anteriormente.');
    } else {
      this.isEditingEnabled = true;
      console.log('🔓 Este proyecto puede ser editado.');
    }
  }

  /**
   * Activar modo edición (solo para DOCENTE)
   */
  activarEdicion(): void {
    if (!this.isDocente || !this.isEditingEnabled || !this.data) {
      return;
    }
    
    this.editMode = true;
    this.editedFields = {
      nombre_proyecto: this.data.proyecto_nombre || '',
      fecha_inicio: this.data.fecha_inicio ? this.data.fecha_inicio.split('T')[0] : '', // ✅ AGREGADO
      fecha_fin: this.data.fecha_fin ? this.data.fecha_fin.split('T')[0] : ''
    };
    this.cdr.markForCheck();
  }

  /**
   * Cancelar edición
   */
  cancelarEdicion(): void {
    this.editMode = false;
    this.cdr.markForCheck();
  }

  /**
   * Validar campos antes de guardar
   */
  validarCambios(): boolean {
    // Validar nombre del proyecto
    if (!this.editedFields.nombre_proyecto?.trim()) {
      alert('El nombre del proyecto es obligatorio.');
      return false;
    }
    
    // ✅ Validar fecha de inicio
    if (!this.editedFields.fecha_inicio) {
      alert('La fecha de inicio es obligatoria.');
      return false;
    }
    
    // Validar fecha de finalización
    if (!this.editedFields.fecha_fin) {
      alert('La fecha de finalización es obligatoria.');
      return false;
    }
    
    const fechaInicio = new Date(this.editedFields.fecha_inicio);
    const fechaFin = new Date(this.editedFields.fecha_fin);
    
    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      alert('Las fechas no son válidas.');
      return false;
    }
    
    // ✅ Validar que fecha_inicio no sea anterior a hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaInicio < hoy) {
      alert('La fecha de inicio no puede ser anterior a la fecha actual.');
      return false;
    }
    
    // ✅ Validar que fecha_fin sea posterior a fecha_inicio
    if (fechaFin <= fechaInicio) {
      alert('La fecha de finalización debe ser posterior a la fecha de inicio.');
      return false;
    }
    
    return true;
  }

  /**
   * Guardar cambios en el backend
   */
  guardarCambios(): void {
    if (!this.validarCambios()) {
      return;
    }
    
    this.isLoading = true;
    this.cdr.markForCheck();
    
    // ✅ AGREGAR fecha_inicio al payload
    const payload = {
      nombre_proyecto: this.editedFields.nombre_proyecto.trim(),
      fecha_inicio: this.editedFields.fecha_inicio,
      fecha_fin: this.editedFields.fecha_fin
    };
    
    console.log('📤 Enviando actualización:', payload);
    
    this.service.actualizarInicioActividades(this.idVinculacion, payload)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (response) => {
          console.log('✅ Cambios guardados exitosamente:', response);
          
          // Marcar como editado en localStorage
          const key = `inicio_actividades_editado_${this.idVinculacion}`;
          localStorage.setItem(key, 'true');
          this.isEditingEnabled = false;
          this.editMode = false;
          
          // Recargar datos actualizados
          this.cargarDatos();
          
          alert('✅ Cambios guardados exitosamente.');
        },
        error: (err) => {
          console.error('❌ Error al guardar cambios:', err);
          this.error = 'Error al guardar los cambios. Por favor, intenta nuevamente.';
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Formatear fecha para mostrar
   */
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
}