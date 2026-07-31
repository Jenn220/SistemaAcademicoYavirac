import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

import { PlanFormacion } from '../../services/plan-formacion';
import { Asignaciones as AsignacionesService, DocenteOpcion, TutorEmpresarialOpcion } from '../../services/asignaciones';
import { PracticaSelector } from '../../interfaces';

interface FilaAsignacion {
  practica: PracticaSelector;
  idDocenteSeleccionado: number | null;
  idTutorSeleccionado: number | null;
  guardando: boolean;
}

/**
 * Pantalla exclusiva de COORDINADOR para asignar/reasignar el docente
 * académico y el tutor empresarial de cada práctica. Antes esto solo se
 * podía hacer a mano en la base de datos (por migración/seed) — sin esto,
 * DOCENTE/TUTOR_EMPRESARIAL no tenían forma de que se les asignaran
 * estudiantes, y el filtro por rol del selector (fase-practica/plan-
 * formacion) nunca les mostraría a nadie.
 */
@Component({
  selector: 'app-asignaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignaciones.html',
  styleUrl: './asignaciones.scss'
})
export class AsignacionesPage implements OnInit {

  private planFormacion = inject(PlanFormacion);
  private asignacionesService = inject(AsignacionesService);
  private router = inject(Router);

  filas = signal<FilaAsignacion[]>([]);
  docentes = signal<DocenteOpcion[]>([]);
  tutores = signal<TutorEmpresarialOpcion[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  busqueda = signal('');

  filasFiltradas = computed(() => {

    const texto = this.busqueda().trim().toLowerCase();

    if (!texto) return this.filas();

    return this.filas().filter((fila) => {
      const nombre = fila.practica.estudiante?.nombre?.toLowerCase() ?? '';
      const cedula = fila.practica.estudiante?.cedula?.toLowerCase() ?? '';
      return nombre.includes(texto) || cedula.includes(texto);
    });

  });

  ngOnInit(): void {

    this.cargar();

  }

  cargar(): void {

    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      practicas: this.planFormacion.listarPracticas(),
      docentes: this.asignacionesService.listarDocentes(),
      tutores: this.asignacionesService.listarTutoresEmpresariales()
    }).subscribe({

      next: ({ practicas, docentes, tutores }) => {

        this.docentes.set(docentes);
        this.tutores.set(tutores);

        this.filas.set(practicas.map((practica) => ({
          practica,
          idDocenteSeleccionado: practica.id_docente ?? null,
          idTutorSeleccionado: practica.tutor_empresarial?.id_tutor_empresarial ?? null,
          guardando: false
        })));

        this.cargando.set(false);

      },

      error: () => {
        this.error.set('No fue posible cargar las prácticas, docentes o tutores empresariales.');
        this.cargando.set(false);
      }

    });

  }

  nombreEmpresaActual(practica: PracticaSelector): string {
    return practica.empresa?.razon_social ?? 'Sin empresa asignada';
  }

  guardar(fila: FilaAsignacion): void {

    if (fila.guardando) return;

    const tutorSeleccionado = this.tutores().find((t) => t.id_tutor_empresarial === fila.idTutorSeleccionado);

    if (fila.idTutorSeleccionado && !tutorSeleccionado) {
      Swal.fire('Error', 'El tutor empresarial seleccionado ya no existe.', 'error');
      return;
    }

    fila.guardando = true;
    this.filas.set([...this.filas()]);

    this.asignacionesService.asignar(fila.practica.id_practica, {
      id_docente: fila.idDocenteSeleccionado ?? undefined,
      id_tutor_empresarial: fila.idTutorSeleccionado ?? undefined,
      // La empresa de la práctica se toma del tutor elegido, para que nunca
      // quede desalineada (antes podía guardarse un tutor de una empresa
      // distinta a la de la práctica).
      id_empresa: tutorSeleccionado?.id_empresa
    }).subscribe({

      next: () => {

        fila.guardando = false;
        this.filas.set([...this.filas()]);

        Swal.fire({
          icon: 'success',
          title: 'Asignación guardada',
          text: `Docente y tutor empresarial actualizados para ${fila.practica.estudiante?.nombre ?? 'el estudiante'}.`,
          timer: 1800,
          showConfirmButton: false
        });

        this.cargar();

      },

      error: () => {
        fila.guardando = false;
        this.filas.set([...this.filas()]);
        Swal.fire('Error', 'No fue posible guardar la asignación.', 'error');
      }

    });

  }

  volver(): void {
    this.router.navigate(['/']);
  }

}
