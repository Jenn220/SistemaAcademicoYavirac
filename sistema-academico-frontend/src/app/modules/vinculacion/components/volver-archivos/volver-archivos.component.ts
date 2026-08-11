import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-volver-archivos',
  standalone: true,
  template: `
    <button (click)="volver()" class="btn-volver-archivos">
      ← Volver a los archivos
    </button>
  `,
  styles: [`
    .btn-volver-archivos {
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.4rem 1rem;
      cursor: pointer;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      transition: background 0.2s;
    }
    .btn-volver-archivos:hover {
      background: #5a6268;
    }
  `]
})
export class VolverArchivosComponent {
  private router = inject(Router);

  volver(): void {
    // ✅ Obtener el ID del estudiante guardado en localStorage
    const idEstudiante = localStorage.getItem('estudiante_seleccionado_id');
    
    // ✅ Si existe un ID, navegamos a la vista de documentos del estudiante
    if (idEstudiante) {
      // Navegamos a la ruta de selección con el parámetro del estudiante
      this.router.navigate(['/vinculacion/docente/seleccionar'], {
        queryParams: { estudianteId: idEstudiante }
      });
    } else {
      // ✅ Si no hay ID, vamos a la lista de estudiantes (fallback)
      this.router.navigate(['/vinculacion/docente/seleccionar']);
    }
  }
}