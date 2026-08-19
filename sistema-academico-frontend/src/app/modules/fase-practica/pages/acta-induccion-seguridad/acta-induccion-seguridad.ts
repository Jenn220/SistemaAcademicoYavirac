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

import { ActaInduccionSeguridad } from '../../interfaces';
import { Documentos } from '../../services/documentos';
import { exportarDocumentoWord } from '../../utils/exportar-word';
import { AuthService } from '../../../auth/services/auth.service';

function actaInduccionVacia(): ActaInduccionSeguridad {
  return {
    lugarFecha: '',
    estudiante: { nombre: '', cedula: '', nivel: '', carrera: '' },
    empresa: { razonSocial: '' },
    textoLegal: [],
    firmaEstudiante: ''
  };
}

@Component({
  selector: 'app-acta-induccion-seguridad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acta-induccion-seguridad.html',
  styleUrl: './acta-induccion-seguridad.scss'
})
export class ActaInduccionSeguridadPage implements OnInit {

  private documentos = inject(Documentos);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);

  acta: ActaInduccionSeguridad = actaInduccionVacia();
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
      acta: this.documentos.getActaInduccionSeguridad(this.idPractica).pipe(catchError(() => of({} as ActaInduccionSeguridad))),
      datos: this.documentos.obtenerDatosMaestra(this.idPractica).pipe(catchError(() => of({} as Record<string, any>)))
    }).subscribe({

      next: ({ acta, datos }) => {

        if (acta && acta.estudiante?.nombre) {
          this.acta = acta;
        } else {
          this.completarConDatosMaestra(acta, datos);
        }
        this.cdr.detectChanges();
        this.cargarIdDocumento('F10');

      },

      error: () => {
        this.acta = actaInduccionVacia();
        this.cdr.detectChanges();
        Swal.fire('Error', 'No fue posible cargar el acta de inducción de seguridad.', 'error');
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

  guardarEnBD(): void {

    if (!this.idPractica) {
      Swal.fire('Error', 'No se pudo determinar la práctica.', 'error');
      return;
    }

    this.guardando = true;

    this.documentos.guardarActaInduccionSeguridad(this.acta, this.idPractica).subscribe({

      next: () => {

        this.guardando = false;
        this.cdr.detectChanges();

        Swal.fire({
          icon: 'success',
          title: 'Guardado',
          text: 'El acta de inducción de seguridad se guardó correctamente.'
        });

        this.cargarEstadoDocumento();

      },

      error: (err) => {

        this.guardando = false;
        this.cdr.detectChanges();

        console.error('❌ Error guardando acta de inducción:', err);

        Swal.fire('Error', 'No fue posible guardar el acta de inducción de seguridad.', 'error');

      }

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
        this.documentos.actualizarEstadoDocumento(this.idDocumento!, 'pendiente_revision', '').subscribe({
          next: () => {
            this.estadoDocumento = 'pendiente_revision';
            this.comentariosDocumento = '';
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

  private completarConDatosMaestra(acta: ActaInduccionSeguridad, datos: Record<string, any>): void {

    const datosEstudiante = datos?.['estudiante'] ?? {};
    const datosCarrera = datos?.['carrera'] ?? {};
    const datosEmpresa = datos?.['empresaBeneficiaria'] ?? {};

    this.acta = {
      ...acta,
      lugarFecha: acta.lugarFecha || `Quito D.M. ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      estudiante: {
        nombre: datosEstudiante.nombre ?? '',
        cedula: datosEstudiante.cedula ?? '',
        nivel: datosEstudiante.nivel ?? '',
        carrera: datosEstudiante.carrera ?? datosCarrera.nucleoEstructurante ?? ''
      },
      empresa: { razonSocial: datosEmpresa.razonSocial ?? '' },
      // Mismo texto legal (7 puntos) que ya arma DocumentoPlantillaService.getActaInduccionSeguridad
      // en el backend; este fallback solo aplica si esa llamada falla o no
      // encuentra al estudiante.
      textoLegal: acta.textoLegal?.length ? acta.textoLegal : [
        'Reconozco que toda actividad puede tener riesgos y peligros, por tal razón, he recibido una inducción sobre los potenciales riesgos de la actividad que voy a realiza en la empresa formadora-receptora, sobre la identificación de situaciones potencialmente peligrosas, así como las orientaciones sobre las medidas de prevención y normas de seguridad para prevenir accidentes.',
        'He entendido la orientación sobre los riesgos potenciales de esa actividad y sobre sus normas de seguridad para evitarlos o prevenirlos. Por esto, de manera libre y voluntaria, acepto los mismos y me comprometo a cumplir las exigencias de seguridad, protocolos y uso correcto de equipamientos que logren mitigarlos o evitarlos, durante toda mi permanencia en la empresa formadora-receptora.',
        'Tengo conocimiento sobre la actividad que voy a realizar y he recibido medios de protección a ser usados por mí en las actividades designadas en la empresa formadora-receptora.',
        'En caso que tenga una discapacidad física o mental, temporal o permanente, que pueda influir en mi seguridad personal o de un tercero, reportaré de inmediato a mis superiores o encargados, tanto de la empresa formadora-receptora, como del Instituto.',
        'En caso que identifique una situación que considere como potencialmente peligrosa o un incidente de seguridad, reportaré de inmediato a mis superiores o encargados, tanto de la empresa formadora-receptora, como del Instituto.',
        'No realizaré actividades que no estén detalladas en mis actividades, o que no cuenten con el respectivo análisis de riesgos, medidas de seguridad y procedimientos de emergencia establecidos.',
        'Reportaré de inmediato a mis superiores o encargados, tanto de la empresa formadora-receptora, como del Instituto, sobre la pérdida o daño en el equipamiento de protección personal que haya recibido.',
      ],
      firmaEstudiante: acta.firmaEstudiante || '______________________________'
    };
    this.cdr.detectChanges();
  }

  volver(): void {

    this.router.navigate(['/fase-practica/plan-formacion'], { queryParams: { modo: 'acta-induccion-seguridad' } });

  }

  imprimir(): void {

    window.print();

  }

  descargarWord(): void {

    exportarDocumentoWord('acta-induccion-seguridad', 'Acta_Induccion_Seguridad', 'portrait');

  }

}
