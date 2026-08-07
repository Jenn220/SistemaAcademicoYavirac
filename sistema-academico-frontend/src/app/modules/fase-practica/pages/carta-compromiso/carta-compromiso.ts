import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { StudentPresentation } from '../../components/student-presentation/student-presentation';

import { CartaCompromiso as Carta } from '../../interfaces';
import { Documentos } from '../../services/documentos';
import { exportarDocumentoWord } from '../../utils/exportar-word';
import { AuthService } from '../../../auth/services/auth.service';

function cartaVacia(): Carta {
  return {
    encabezado: '',
    cuerpo: [],
    prohibicionesIntro: '',
    prohibiciones: [],
    compromisosIntro: '',
    compromisosConfidencialidad: [],
    cierre: [],
    estudiante: { nombre: '', cedula: '', carrera: '', curso: '' },
    empresaAsignada: '',
    espacioFirma: { lugar: '', fecha: '' }
  };
}

@Component({
  selector: 'app-carta-compromiso',
  standalone: true,
  imports: [
    CommonModule,
    StudentPresentation
  ],
  templateUrl: './carta-compromiso.html',
  styleUrl: './carta-compromiso.scss'
})
export class CartaCompromiso implements OnInit {

  private documentos = inject(Documentos);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);

  carta: Carta = cartaVacia();
  datosMaestros: any = {};
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

    this.cargarIdPractica();

  }

  private cargarIdPractica(): void {

    const idPracticaRuta = Number(this.route.snapshot.paramMap.get('idPractica')) || undefined;

    if (idPracticaRuta) {
      this.idPractica = idPracticaRuta;
      this.cargarCarta();
      return;
    }

    this.documentos.obtenerMiPractica().subscribe({
      next: (resp) => {
        this.idPractica = resp.id_practica;
        this.cargarCarta();
      },
      error: () => {
        Swal.fire('Error', 'No fue posible obtener la práctica.', 'error');
      }
    });

  }

  cargarCarta(): void {

    if (!this.idPractica) return;

    const usuario = this.auth.usuario();
    this.soloLectura = !usuario?.roles?.includes('ESTUDIANTE');

    forkJoin({
      carta: this.documentos.obtenerCartaCompromiso(this.idPractica),
      datos: this.documentos.obtenerDatosMaestra(this.idPractica).pipe(catchError(() => of({} as Record<string, any>)))
    }).subscribe({

      next: ({ carta, datos }) => {

        const res = carta as unknown as Record<string, any>;
        const estudiante = res?.['estudiante'] ?? {};
        const espacioFirma = res?.['espacioFirma'] ?? {};

        const datosEstudiante = datos?.['estudiante'] ?? {};
        const proyectoEmpresarial = datos?.['proyectoEmpresarial'] ?? {};

        this.carta = {
          encabezado: res?.['encabezado'] ?? '',
          cuerpo: res?.['cuerpo'] ?? [],
          prohibicionesIntro: res?.['prohibicionesIntro'] ?? '',
          prohibiciones: res?.['prohibiciones'] ?? [],
          compromisosIntro: res?.['compromisosIntro'] ?? '',
          compromisosConfidencialidad: res?.['compromisosConfidencialidad'] ?? [],
          cierre: res?.['cierre'] ?? [],
          estudiante: {
            nombre: estudiante.nombre ?? '',
            cedula: estudiante.cedula ?? '',
            carrera: estudiante.carrera ?? datosEstudiante.carrera ?? '',
            curso: estudiante.curso ?? datosEstudiante.curso ?? ''
          },
          empresaAsignada: res?.['empresaAsignada'] ?? proyectoEmpresarial.empresaAsignada ?? '',
          espacioFirma: {
            lugar: espacioFirma.lugar ?? '',
            fecha: espacioFirma.fecha ?? ''
          }
        };

        this.cdr.detectChanges();
        this.cargarIdDocumento('F01');

      },

      error: (err) => {

        console.error('❌ Error obteniendo la carta compromiso:', err);

        this.carta = cartaVacia();
        this.cdr.detectChanges();

        Swal.fire('Error', 'No fue posible cargar la carta compromiso desde el servidor.', 'error');

      }

    });

  }

  guardarEnBD(): void {

    if (!this.idPractica) {
      Swal.fire('Error', 'No se pudo determinar la práctica.', 'error');
      return;
    }

    this.guardando = true;

    this.documentos.guardarCartaCompromiso(this.carta, this.idPractica).subscribe({

      next: () => {

        this.guardando = false;
        this.cdr.detectChanges();

        Swal.fire({
          icon: 'success',
          title: 'Guardado',
          text: 'La carta compromiso se guardó correctamente.'
        });

        this.cargarEstadoDocumento();

      },

      error: (err) => {

        this.guardando = false;
        this.cdr.detectChanges();

        console.error('❌ Error guardando carta compromiso:', err);

        Swal.fire('Error', 'No fue posible guardar la carta compromiso.', 'error');

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
      Swal.fire('Error', 'Primero debe guardar la carta.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Enviar a revisión',
      text: '¿Está seguro de enviar esta carta a revisión?',
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
            Swal.fire('Enviado', 'La carta se envió a revisión correctamente.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No fue posible enviar la carta a revisión.', 'error');
          },
        });
      }
    });
  }

  aprobar(): void {
    if (!this.idDocumento) return;

    Swal.fire({
      title: 'Aprobar carta',
      text: '¿Está seguro de aprobar esta carta?',
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
            Swal.fire('Aprobado', 'La carta fue aprobada correctamente.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No fue posible aprobar la carta.', 'error');
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

  volver(): void {

    this.router.navigate(['/']);

  }

  imprimir(): void {

    window.print();

  }

  descargarWord(): void {

    exportarDocumentoWord('documento-f01', 'Carta_Compromiso', 'portrait');

  }

}