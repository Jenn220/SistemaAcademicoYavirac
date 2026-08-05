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
import { DocumentHeader } from '../../components/document-header/document-header';

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
    StudentPresentation,
    DocumentHeader
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

        this.datosMaestros = datos ?? {};

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

      },

      error: (err) => {

        this.guardando = false;
        this.cdr.detectChanges();

        console.error('❌ Error guardando carta compromiso:', err);

        Swal.fire('Error', 'No fue posible guardar la carta compromiso.', 'error');

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