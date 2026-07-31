import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { RegistroAsistencia as Registro } from '../../interfaces';
import { Documentos } from '../../services/documentos';
import { exportarDocumentoWord } from '../../utils/exportar-word';

import { DocumentHeader } from '../../components/document-header/document-header';

function registroVacio(): Registro {
  return {
    estudiante: { nombre: '', cedula: '', email: '', telefono: '', tipoSangre: '' },
    empresa: '',
    carrera: '',
    curso: '',
    periodoAcademico: '',
    nucleoEstructurante: '',
    tutorAcademico: '',
    tutorEmpresarial: '',
    contactoEmergenciaNombre: '',
    contactoEmergenciaTelefono: '',
    registros: [],
    horasAutonomas: 0,
    subtotalHorasPractica: 0
  };
}

@Component({
  selector: 'app-registro-asistencia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DocumentHeader
  ],
  templateUrl: './registro-asistencia.html',
  styleUrl: './registro-asistencia.scss'
})
export class RegistroAsistencia implements OnInit {

  private documentos = inject(Documentos);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  registro: Registro = registroVacio();

  editando = false;

  ngOnInit(): void {

    this.cargarRegistro();

  }

  /**
   * El endpoint propio de registro-asistencia no manda carrera, curso,
   * período académico, núcleo estructurante, tutores, ni el teléfono/email/
   * tipo de sangre del estudiante, aunque el backend sí los tiene (los usa
   * en /documentos/datos y en el endpoint de Currículo). Se completan desde
   * ahí en vez de dejarlos en blanco.
   */
  private mapearRegistro(res: Record<string, any>, datos: Record<string, any>): Registro {

    const estudiante = res?.['estudiante'] ?? {};
    const datosEstudiante = datos?.['estudiante'] ?? {};
    const datosCarrera = datos?.['carrera'] ?? {};
    const datosPeriodo = datos?.['periodoAcademico'] ?? {};
    const datosEmpresa = datos?.['empresaBeneficiaria'] ?? {};

    return {
      estudiante: {
        nombre: estudiante.nombre ?? '',
        cedula: estudiante.cedula ?? '',
        email: estudiante.email ?? datosEstudiante.email ?? '',
        telefono: estudiante.telefono ?? datosEstudiante.telefono ?? '',
        tipoSangre: estudiante.tipoSangre ?? datosEstudiante.tipoSangre ?? ''
      },
      empresa: res?.['empresa'] ?? '',
      carrera: res?.['carrera'] ?? datosEstudiante.carrera ?? '',
      curso: res?.['curso'] ?? datosEstudiante.curso ?? '',
      periodoAcademico: res?.['periodoAcademico'] ?? datosPeriodo.nombre ?? '',
      nucleoEstructurante: res?.['nucleoEstructurante'] ?? datosCarrera.nucleoEstructurante ?? '',
      tutorAcademico: res?.['tutorAcademico'] ?? datosCarrera.tutorAcademico ?? '',
      tutorEmpresarial: res?.['tutorEmpresarial'] ?? datosEmpresa.tutorEmpresarial ?? '',
      contactoEmergenciaNombre: res?.['contactoEmergenciaNombre'] ?? datosEstudiante.contactoEmergenciaNombre ?? '',
      contactoEmergenciaTelefono: res?.['contactoEmergenciaTelefono'] ?? datosEstudiante.contactoEmergenciaTelefono ?? '',
      registros: res?.['registros'] ?? [],
      horasAutonomas: res?.['horasAutonomas'] ?? 0,
      subtotalHorasPractica: res?.['subtotalHorasPractica'] ?? 0
    };

  }

  cargarRegistro(): void {

    const idPractica = Number(this.route.snapshot.paramMap.get('idPractica')) || undefined;

    forkJoin({
      registro: this.documentos.obtenerRegistroAsistencia(idPractica),
      datos: this.documentos.obtenerDatosMaestra(idPractica).pipe(catchError(() => of({} as Record<string, any>)))
    }).subscribe({

      next: ({ registro, datos }) => {

        this.registro = this.mapearRegistro(registro as unknown as Record<string, any>, datos);
        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error('❌ Error obteniendo el registro de asistencia:', err);

        this.registro = registroVacio();
        this.cdr.detectChanges();

        Swal.fire('Error', 'No fue posible cargar el registro de asistencia desde el servidor.', 'error');

      }

    });

  }

  volver(): void {

    this.router.navigate(['/']);

  }

  descargarWord(): void {

    exportarDocumentoWord('documento-f05', 'Registro_Asistencia', 'portrait');

  }

  agregarRegistro(): void {

    this.registro.registros.push({
      fecha: '',
      horaIngreso: '',
      almuerzo: '',
      horaSalida: '',
      horasDia: 0,
      firma: '',
      observaciones: ''
    });

    this.editando = true;
    this.cdr.detectChanges();

  }

  eliminarRegistro(idx: number): void {

    this.registro.registros.splice(idx, 1);
    this.cdr.detectChanges();

  }

  guardarRegistro(): void {

    const idPractica = Number(this.route.snapshot.paramMap.get('idPractica')) || undefined;

    this.documentos.guardarRegistroAsistencia(this.registro, idPractica).subscribe({

      next: () => {

        this.editando = false;
        Swal.fire('Guardado', 'El registro de asistencia se guardó correctamente.', 'success');

      },

      error: (err) => {

        console.error('❌ Error guardando registro de asistencia:', err);
        Swal.fire('Error', 'No fue posible guardar el registro de asistencia.', 'error');

      }

    });

  }

  cancelarEdicion(): void {

    this.editando = false;
    this.cargarRegistro();

  }
}
