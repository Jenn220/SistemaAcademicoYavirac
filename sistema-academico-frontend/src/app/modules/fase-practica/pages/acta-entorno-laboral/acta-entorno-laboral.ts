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

import { DocumentHeader } from '../../components/document-header/document-header';

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
  imports: [CommonModule, DocumentHeader],
  templateUrl: './acta-entorno-laboral.html',
  styleUrl: './acta-entorno-laboral.scss'
})
export class ActaEntornoLaboralPage implements OnInit {

  private documentos = inject(Documentos);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  acta: ActaEntornoLaboral = actaEntornoVacia();

  ngOnInit(): void {
    this.cargarActa();
  }

  private cargarActa(): void {

    const idPractica = Number(this.route.snapshot.paramMap.get('idPractica')) || undefined;

    forkJoin({
      acta: this.documentos.getActaEntornoLaboral(idPractica).pipe(catchError(() => of({} as ActaEntornoLaboral))),
      datos: this.documentos.obtenerDatosMaestra(idPractica).pipe(catchError(() => of({} as Record<string, any>)))
    }).subscribe({

      next: ({ acta, datos }) => {

        if (acta && acta.estudiantes?.length) {
          this.acta = acta;
        } else {
          this.completarConDatosMaestra(acta, datos);
        }
        this.cdr.detectChanges();

      },

      error: () => {
        this.acta = actaEntornoVacia();
        this.cdr.detectChanges();
        Swal.fire('Error', 'No fue posible cargar el acta de entorno laboral.', 'error');
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