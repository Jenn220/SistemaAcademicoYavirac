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
import { AuthService } from '../../../auth/services/auth.service';

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
    FormsModule
  ],
  templateUrl: './registro-asistencia.html',
  styleUrl: './registro-asistencia.scss'
})
export class RegistroAsistencia implements OnInit {

  private documentos = inject(Documentos);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);

  registro: Registro = registroVacio();

  editando = false;
  idPractica: number | undefined;
  esEstudiante = false;

  estadoDocumento: string = 'borrador';
  comentariosDocumento: string = '';
  idDocumento: number | undefined;

  get soloLectura(): boolean {
    return !this.esEstudiante;
  }

  get esDocente(): boolean {
    return this.auth.tieneAlgunRol(['DOCENTE']);
  }

  get esCoordinador(): boolean {
    return this.auth.tieneAlgunRol(['COORDINADOR']);
  }

  get esTutorEmpresarial(): boolean {
    return this.auth.tieneAlgunRol(['TUTOR_EMPRESARIAL']);
  }

  get puedeEnviarRevision(): boolean {
    return this.esEstudiante && (this.estadoDocumento === 'borrador' || this.estadoDocumento === 'rechazado');
  }

  get puedeAprobar(): boolean {
    return this.esDocente && this.estadoDocumento === 'pendiente_revision';
  }

  get puedeSolicitarCorrecciones(): boolean {
    return this.esDocente && this.estadoDocumento === 'pendiente_revision';
  }

  get mostrarComentarios(): boolean {
    return this.estadoDocumento === 'rechazado' && !!this.comentariosDocumento;
  }

  ngOnInit(): void {

    this.esEstudiante = this.auth.usuario()?.roles?.includes('ESTUDIANTE') ?? false;
    this.cargarIdPractica();

  }

  private cargarIdPractica(): void {

    const idPracticaRuta = Number(this.route.snapshot.paramMap.get('idPractica')) || undefined;

    if (idPracticaRuta) {
      this.idPractica = idPracticaRuta;
      this.cargarRegistro();
      return;
    }

    this.documentos.obtenerMiPractica().subscribe({
      next: (resp) => {
        this.idPractica = resp.id_practica;
        this.cargarRegistro();
      },
      error: () => {
        Swal.fire('Error', 'No fue posible obtener la práctica.', 'error');
      }
    });

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

    if (!this.idPractica) return;

    forkJoin({
      registro: this.documentos.obtenerRegistroAsistencia(this.idPractica),
      datos: this.documentos.obtenerDatosMaestra(this.idPractica).pipe(catchError(() => of({} as Record<string, any>)))
    }).subscribe({

      next: ({ registro, datos }) => {

        this.registro = this.mapearRegistro(registro as unknown as Record<string, any>, datos);
        this.cdr.detectChanges();
        this.cargarIdDocumento('F05');

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

    if (!this.esEstudiante) return;

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

    if (!this.esEstudiante) return;

    this.registro.registros.splice(idx, 1);
    this.cdr.detectChanges();

  }

  guardarRegistro(): void {

    if (!this.esEstudiante || !this.idPractica) return;

    this.documentos.guardarRegistroAsistencia(this.registro, this.idPractica).subscribe({

      next: (resp) => {

        if (resp?.id_documento) {
          this.idDocumento = resp.id_documento;
        }

        this.editando = false;
        this.cargarRegistro();
        Swal.fire('Guardado', 'El registro de asistencia se guardó correctamente.', 'success');
        this.cargarEstadoDocumento();

      },

      error: (err) => {

        console.error('❌ Error guardando registro de asistencia:', err);
        const mensaje = err?.error?.message || err.message || 'No fue posible guardar el registro de asistencia.';
        Swal.fire('Error', mensaje, 'error');

      }

    });

  }

  private cargarEstadoDocumento(): void {
    if (!this.idDocumento) {
      return;
    }

    this.documentos.obtenerDocumentoPorId(this.idDocumento).subscribe({
      next: (doc) => {
        this.estadoDocumento = doc?.estado ?? 'borrador';
        this.comentariosDocumento = doc?.comentarios ?? '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });
  }

  private cargarIdDocumento(codigoFormato: string): void {
    if (this.idDocumento || !this.idPractica) {
      return;
    }

    this.documentos.obtenerIdDocumento(this.idPractica, codigoFormato).subscribe({
      next: (resp) => {
        this.idDocumento = resp?.id_documento ?? undefined;
        this.cargarEstadoDocumento();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });
  }

  enviarARevision(): void {
    if (!this.idDocumento) {
      Swal.fire('Error', 'Primero debe guardar el registro de asistencia.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Enviar a revisión',
      text: '¿Está seguro de enviar este registro a revisión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentos.actualizarEstadoDocumento(this.idDocumento!, 'pendiente_revision', '').subscribe({
          next: () => {
            this.estadoDocumento = 'pendiente_revision';
            this.comentariosDocumento = '';
            this.cdr.detectChanges();
            Swal.fire('Enviado', 'El registro se envió a revisión correctamente.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No fue posible enviar el registro a revisión.', 'error');
          },
        });
      }
    });
  }

  aprobar(): void {
    if (!this.idDocumento) return;

    Swal.fire({
      title: 'Aprobar registro',
      text: '¿Está seguro de aprobar este registro?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Aprobar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentos.actualizarEstadoDocumento(this.idDocumento!, 'aprobado').subscribe({
          next: () => {
            this.estadoDocumento = 'aprobado';
            this.cdr.detectChanges();
            Swal.fire('Aprobado', 'El registro fue aprobado correctamente.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No fue posible aprobar el registro.', 'error');
          },
        });
      }
    });
  }

  solicitarCorrecciones(): void {
    if (!this.idDocumento) return;

    Swal.fire({
      title: 'Solicitar correcciones',
      input: 'textarea',
      inputLabel: 'Comentarios de corrección (obligatorio)',
      inputPlaceholder: 'Describa los cambios que debe realizar el estudiante...',
      inputValidator: (value: string) => {
        if (!value) {
          return 'Debe ingresar comentarios de corrección';
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: 'Solicitar correcciones',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.documentos.actualizarEstadoDocumento(this.idDocumento!, 'rechazado', result.value).subscribe({
          next: () => {
            this.estadoDocumento = 'rechazado';
            this.comentariosDocumento = result.value;
            this.cdr.detectChanges();
            Swal.fire('Correcciones solicitadas', 'El estudiante deberá realizar las correcciones indicadas.', 'info');
          },
          error: () => {
            Swal.fire('Error', 'No fue posible solicitar correcciones.', 'error');
          },
        });
      }
    });
  }

  cancelarEdicion(): void {

    if (!this.esEstudiante) return;

    this.editando = false;
    this.cargarRegistro();

  }
}
