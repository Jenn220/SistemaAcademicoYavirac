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

import { ActaEntornoLaboral } from '../../interfaces';
import { Documentos } from '../../services/documentos';
import { exportarDocumentoWord } from '../../utils/exportar-word';
import { AuthService } from '../../../auth/services/auth.service';

import { DocumentHeader } from '../../components/document-header/document-header';

function actaEntornoVacia(): ActaEntornoLaboral {
  return {
    encabezado: {
      instituto: 'INSTITUTO TÉCNICO YAVIRAC',
      titulo: 'ACTA DE FORMACIÓN PRÁCTICA EN EL ENTORNO LABORAL REAL',
      fecha: '',
      estudianteNombre: '',
      estudianteCedula: '',
      carrera: '',
      nivel: '',
      periodoAcademico: '',
      entidadReceptora: '',
      tutorAcademico: '',
      coordinador: '',
      tutorEmpresarial: ''
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
  imports: [CommonModule, FormsModule, DocumentHeader],
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
  mostrarFormularioCompanero = false;
  nuevoCompanero: { nombre: string; cedula: string; nivel: string } = { nombre: '', cedula: '', nivel: '' };

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

        this.completarConDatosMaestra(acta, datos);
        this.cdr.detectChanges();

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

      },

      error: (err) => {

        this.guardando = false;
        this.cdr.detectChanges();

        console.error('❌ Error guardando acta de entorno laboral:', err);

        Swal.fire('Error', 'No fue posible guardar el acta de entorno laboral.', 'error');

      }

    });

  }

  private completarConDatosMaestra(acta: ActaEntornoLaboral, datos: Record<string, any>): void {

    const datosEstudiante = datos?.['estudiante'] ?? {};
    const datosCarrera = datos?.['carrera'] ?? {};
    const datosPeriodo = datos?.['periodoAcademico'] ?? {};
    const datosEmpresa = datos?.['empresaBeneficiaria'] ?? {};

    console.log('datosMaestra en acta-entorno-laboral:', datos);
    console.log('datosEstudiante:', datosEstudiante);
    console.log('datosCarrera:', datosCarrera);
    console.log('datosPeriodo:', datosPeriodo);
    console.log('datosEmpresa:', datosEmpresa);

    this.acta = {
      ...acta,
      encabezado: {
        ...acta.encabezado,
        estudianteNombre: datosEstudiante.nombre ?? '',
        estudianteCedula: datosEstudiante.cedula ?? '',
        carrera: datosEstudiante.carrera ?? datosCarrera.nucleoEstructurante ?? '',
        nivel: datosEstudiante.nivel ?? '',
        periodoAcademico: datosPeriodo.nombre ?? '',
        entidadReceptora: datosEmpresa.razonSocial ?? '',
        tutorAcademico: datosCarrera.tutorAcademico ?? '',
        coordinador: datosCarrera.coordinador ?? '',
        tutorEmpresarial: datosEmpresa.tutorEmpresarial ?? ''
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
    console.log('acta final en acta-entorno-laboral:', this.acta);
    this.cdr.detectChanges();
  }

  volver(): void {
    this.router.navigate(['/fase-practica/plan-formacion'], { queryParams: { modo: 'acta-entorno-laboral' } });
  }

  descargarWord(): void {
    exportarDocumentoWord('acta-entorno-laboral', 'Acta_Entorno_Laboral', 'portrait');
  }

  agregarCompanero(): void {
    if (!this.nuevoCompanero.nombre || !this.nuevoCompanero.cedula || !this.nuevoCompanero.nivel) {
      Swal.fire('Faltan datos', 'Completa al menos nombre, cédula y nivel del compañero.', 'warning');
      return;
    }

    this.acta.estudiantes.push({
      no: this.acta.estudiantes.length + 1,
      nombre: this.nuevoCompanero.nombre,
      cedula: this.nuevoCompanero.cedula,
      nivel: this.nuevoCompanero.nivel,
      nota: '',
      firma: ''
    });

    this.nuevoCompanero = { nombre: '', cedula: '', nivel: '' };
    this.mostrarFormularioCompanero = false;
    this.cdr.detectChanges();
  }
}