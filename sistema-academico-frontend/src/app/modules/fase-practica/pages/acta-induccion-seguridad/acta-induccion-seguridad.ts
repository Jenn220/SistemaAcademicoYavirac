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

import { DocumentHeader } from '../../components/document-header/document-header';

function actaInduccionVacia(): ActaInduccionSeguridad {
  return {
    lugarFecha: '',
    estudiante: { nombre: '', cedula: '', nivel: '', carrera: '' },
    empresa: { razonSocial: '' },
    textoLegal: [],
    firmaEstudiante: '',
    periodo: '',
    nucleo: '',
    tutorAcademico: '',
    coordinador: '',
    tutorEmpresarial: ''
  };
}

@Component({
  selector: 'app-acta-induccion-seguridad',
  standalone: true,
  imports: [CommonModule, DocumentHeader],
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

      },

      error: () => {
        this.acta = actaInduccionVacia();
        this.cdr.detectChanges();
        Swal.fire('Error', 'No fue posible cargar el acta de inducción de seguridad.', 'error');
      }

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

      },

      error: (err) => {

        this.guardando = false;
        this.cdr.detectChanges();

        console.error('❌ Error guardando acta de inducción:', err);

        Swal.fire('Error', 'No fue posible guardar el acta de inducción de seguridad.', 'error');

      }

    });

  }

  private completarConDatosMaestra(acta: ActaInduccionSeguridad, datos: Record<string, any>): void {

    const datosEstudiante = datos?.['estudiante'] ?? {};
    const datosCarrera = datos?.['carrera'] ?? {};
    const datosPeriodo = datos?.['periodoAcademico'] ?? {};
    const datosEmpresa = datos?.['empresaBeneficiaria'] ?? {};

    this.acta = {
      ...acta,
      lugarFecha: acta.lugarFecha || `Quito D.M., ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      estudiante: {
        nombre: datosEstudiante.nombre ?? '',
        cedula: datosEstudiante.cedula ?? '',
        nivel: datosEstudiante.nivel ?? '',
        carrera: datosEstudiante.carrera ?? datosCarrera.nucleoEstructurante ?? ''
      },
      empresa: { razonSocial: datosEmpresa.razonSocial ?? '' },
      periodo: datosPeriodo.nombre ?? '',
      nucleo: datosCarrera.nucleoEstructurante ?? '',
      tutorAcademico: datosCarrera.tutorAcademico ?? '',
      coordinador: datosCarrera.coordinador ?? '',
      tutorEmpresarial: datosEmpresa.tutorEmpresarial ?? '',
      textoLegal: acta.textoLegal?.length ? acta.textoLegal : [
        '1. Se informa al estudiante sobre los riesgos inherentes al entorno laboral.',
        '2. Se dan a conocer las medidas de prevención y protección personal.',
        '3. Se instruye sobre el uso correcto de equipos de protección individual (EPI).',
        '4. Se explican los procedimientos ante situaciones de emergencia.'
      ],
      firmaEstudiante: acta.firmaEstudiante || '______________________________'
    };
    this.cdr.detectChanges();
  }

  volver(): void {
    this.router.navigate(['/fase-practica/plan-formacion'], { queryParams: { modo: 'acta-induccion-seguridad' } });
  }

  descargarWord(): void {
    exportarDocumentoWord('acta-induccion-seguridad', 'Acta_Induccion_Seguridad', 'portrait');
  }
}