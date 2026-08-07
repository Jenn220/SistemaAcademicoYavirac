import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { ActaEntornoLaboral } from '../../interfaces';
import { Documentos } from '../../services/documentos';
import { exportarDocumentoWord } from '../../utils/exportar-word';
import { AuthService } from '../../../auth/services/auth.service';

function actaEntornoVacia(): ActaEntornoLaboral {
  return {
    encabezado: {
      instituto: 'INSTITUTO TÉCNICO YAVIRAC',
      titulo: 'ACTA DE FORMACIÓN PRÁCTICA EN EL ENTORNO LABORAL REAL',
      fecha: '',
      carrera: '',
      periodoAcademico: '',
      entidadReceptora: ''
    },
    textoLegal: [],
    anexos: [
      'Listado de estudiantes',
      'Plan de formación',
      'Registro de asistencia',
      'Informe de aprendizaje',
      'Ficha de evaluación instituto',
      'Ficha de evaluación empresa'
    ],
    estudiantes: [],
    firmas: {
      tutorEmpresarial: { nombre: '', cedula: '' },
      coordinador: { nombre: '', cedula: '' },
      tutorAcademico: { nombre: '', cedula: '' }
    }
  };
}

@Component({
  selector: 'app-acta-entorno-laboral',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acta-entorno-laboral.html',
  styleUrl: './acta-entorno-laboral.scss'
})
export class ActaEntornoLaboralPage implements OnInit {

  private documentos = inject(Documentos);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);

  acta: ActaEntornoLaboral = actaEntornoVacia();
  guardando = false;
  soloLectura = false;
  idPractica: number | undefined;

  estadoDocumento: string = 'borrador';
  comentariosDocumento: string = '';
  idDocumento: number | undefined;

  get esEstudiante(): boolean {
    return this.auth.tieneAlgunRol(['ESTUDIANTE']);
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
    return this.esEstudiante && this.estadoDocumento === 'borrador';
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
    const usuario = this.auth.usuario();
    this.soloLectura = !usuario?.roles?.includes('ESTUDIANTE');
    this.cargarIdPractica();
  }

  private cargarIdPractica(): void {
    const idPracticaRuta = Number(this.route.snapshot.paramMap.get('idPractica')) || undefined;

    if (idPracticaRuta) {
      this.idPractica = idPracticaRuta;
      this.cargarActa();
      return;
    }

    this.documentos.obtenerMiPractica().subscribe({
      next: (resp) => {
        this.idPractica = resp.id_practica;
        this.cargarActa();
      },
      error: () => {
        Swal.fire('Error', 'No fue posible obtener la práctica.', 'error');
      }
    });
  }

  private cargarActa(): void {

    if (!this.idPractica) return;

    forkJoin({
      acta: this.documentos.getActaEntornoLaboral(this.idPractica).pipe(catchError(() => of({} as ActaEntornoLaboral))),
      datos: this.documentos.obtenerDatosMaestra(this.idPractica).pipe(catchError(() => of({} as Record<string, any>)))
    }).subscribe({

      next: ({ acta, datos }) => {

        if (acta && acta.estudiantes?.length) {
          this.acta = acta;
        } else {
          this.completarConDatosMaestra(acta, datos);
        }
        this.cdr.detectChanges();
        this.cargarIdDocumento('F11');

      },

      error: () => {
        this.acta = actaEntornoVacia();
        this.cdr.detectChanges();
        Swal.fire('Error', 'No fue posible cargar el acta de entorno laboral.', 'error');
      }

    });
  }

  guardarEnBD(): void {

    if (!this.idPractica) {
      Swal.fire('Error', 'No se pudo determinar la práctica.', 'error');
      return;
    }

    this.guardando = true;

    this.documentos.guardarActaEntornoLaboral(this.acta, this.idPractica).subscribe({

      next: () => {

        this.guardando = false;
        this.cdr.detectChanges();

        Swal.fire({
          icon: 'success',
          title: 'Guardado',
          text: 'El acta de entorno laboral se guardó correctamente.'
        });

        this.cargarEstadoDocumento();

      },

      error: (err) => {

        this.guardando = false;
        this.cdr.detectChanges();

        console.error('❌ Error guardando acta de entorno laboral:', err);

        Swal.fire('Error', 'No fue posible guardar el acta de entorno laboral.', 'error');

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
      Swal.fire('Error', 'Primero debe guardar el acta.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Enviar a revisión',
      text: '¿Está seguro de enviar esta acta a revisión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentos.actualizarEstadoDocumento(this.idDocumento!, 'pendiente_revision').subscribe({
          next: () => {
            this.estadoDocumento = 'pendiente_revision';
            this.cdr.detectChanges();
            Swal.fire('Enviado', 'La acta se envió a revisión correctamente.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No fue posible enviar la acta a revisión.', 'error');
          },
        });
      }
    });
  }

  aprobar(): void {
    if (!this.idDocumento) return;

    Swal.fire({
      title: 'Aprobar acta',
      text: '¿Está seguro de aprobar esta acta?',
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
            Swal.fire('Aprobado', 'La acta fue aprobada correctamente.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No fue posible aprobar la acta.', 'error');
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

  private completarConDatosMaestra(acta: ActaEntornoLaboral, datos: Record<string, any>): void {

    const datosEstudiante = datos?.['estudiante'] ?? {};
    const datosCarrera = datos?.['carrera'] ?? {};
    const datosPeriodo = datos?.['periodoAcademico'] ?? {};
    const datosEmpresa = datos?.['empresaBeneficiaria'] ?? {};

    this.acta = {
      ...acta,
      encabezado: {
        ...acta.encabezado,
        fecha: acta.encabezado.fecha || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
        carrera: datosEstudiante.carrera ?? datosCarrera.nucleoEstructurante ?? '',
        periodoAcademico: datosPeriodo.nombre ?? '',
        entidadReceptora: datosEmpresa.razonSocial ?? ''
      },
      textoLegal: acta.textoLegal?.length ? acta.textoLegal : [
        'Por medio de la presente se deja constancia de que la estudiante ha cumplido con el programa de formación práctica en el entorno laboral real, de acuerdo con los objetivos y actividades programadas.',
        'La práctica se realizó en la entidad receptora indicada, bajo la supervisión del tutor empresarial y el tutor académico asignado.',
        'Se da por cerrada la etapa de formación práctica con las observaciones que constan en los documentos anexos.'
      ],
      firmas: acta.firmas?.tutorEmpresarial?.nombre ? acta.firmas : {
        tutorEmpresarial: { nombre: datosEmpresa.tutorEmpresarial ?? '', cedula: '' },
        coordinador: { nombre: datosCarrera.coordinador ?? '', cedula: '' },
        tutorAcademico: { nombre: datosCarrera.tutorAcademico ?? '', cedula: '' }
      }
    };
    this.cdr.detectChanges();
  }

  volver(): void {
    this.router.navigate(['/fase-practica/plan-formacion'], { queryParams: { modo: 'acta-entorno-laboral' } });
  }

  descargarWord(): void {
    exportarDocumentoWord('acta-entorno-laboral', 'Acta_Entorno_Laboral', 'portrait');
  }
}