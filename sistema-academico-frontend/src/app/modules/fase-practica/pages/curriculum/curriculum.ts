import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import html2pdf from 'html2pdf.js';
import Swal from 'sweetalert2';

import { Documentos } from '../../services/documentos';
import { DocumentHeader } from '../../../../shared/components/document-header/document-header';
import { Curriculum as CurriculumModel } from '../../interfaces';
import { MOCK_CURRICULUM } from '../../services/mock-documentos.data';

@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentHeader],
  templateUrl: './curriculum.html',
  styleUrl: './curriculum.scss'
})
export class Curriculum implements OnInit {

  private documentos = inject(Documentos);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // TODO: quitar el mock cuando el login/JWT del frontend esté conectado
  curriculum: CurriculumModel = structuredClone(MOCK_CURRICULUM);

  cargando = false;

  guardando = false;

  ngOnInit(): void {

    this.cargar();

  }

  private mapearBase(res: Record<string, any>): CurriculumModel {

    const dp = res?.['datosPersonales'] ?? {};
    const da = res?.['datosAcademicos'] ?? {};
    const experiencia = (res?.['experienciaLaboral'] ?? []) as any[];
    const practicas = (res?.['practicasDualesPrevias'] ?? []) as any[];
    const infoAdicional = res?.['informacionAdicional'] ?? {};

    const logros: string[] = infoAdicional?.['logros'] ?? [];
    const idiomas: string[] = infoAdicional?.['idiomas'] ?? [];
    const habilidades: string[] = infoAdicional?.['habilidades'] ?? [];

    return {
      periodoAcademico: res?.['periodoAcademico'] ?? '',
      datosPersonales: {
        nombre: dp.nombre ?? '',
        cedula: dp.cedula ?? '',
        estadoCivil: dp.estadoCivil ?? '',
        telefono: dp.telefono ?? '',
        domicilio: dp.domicilio ?? '',
        emailInstitucional: dp.email ?? ''
      },
      datosAcademicos: da?.institucion ? [{
        anio: '',
        institucion: da.institucion ?? '',
        tituloMencion: da.carrera ?? '',
        notaFinal: da.promedio ?? ''
      }] : [],
      experienciaLaboral: experiencia.map((item) => ({
        anio: item.periodo ?? '',
        institucion: item.empresa ?? '',
        cargo: item.cargo ?? '',
        actividades: item.funciones ?? ''
      })),
      practicasDuales: practicas.map((item) => ({
        anio: item.periodo ?? '',
        institucion: item.empresa ?? '',
        puestoAprendizaje: '',
        actividades: ''
      })),
      informacionAdicional: [
        ...logros.map((logro) => ({ anio: '', institucion: '', logro, detalle: '' })),
        ...idiomas.map((idioma) => ({ anio: '', institucion: '', logro: 'Idioma', detalle: idioma })),
        ...habilidades.length ? [{ anio: '', institucion: '', logro: 'Habilidades técnicas', detalle: habilidades.join(', ') }] : []
      ]
    };

  }

  cargar(): void {

    this.cargando = true;

    this.documentos.obtenerCurriculumBase().subscribe({

      next: (res) => {

        this.curriculum = this.mapearBase(res);
        this.cargando = false;
        this.cdr.detectChanges();

      },

      error: () => {

        this.curriculum = structuredClone(MOCK_CURRICULUM);
        this.cargando = false;
        this.cdr.detectChanges();

      }

    });

  }

  agregarDatoAcademico(): void {

    this.curriculum.datosAcademicos.push({ anio: '', institucion: '', tituloMencion: '', notaFinal: '' });

  }

  quitarDatoAcademico(i: number): void {

    this.curriculum.datosAcademicos.splice(i, 1);

  }

  agregarExperiencia(): void {

    this.curriculum.experienciaLaboral.push({ anio: '', institucion: '', cargo: '', actividades: '' });

  }

  quitarExperiencia(i: number): void {

    this.curriculum.experienciaLaboral.splice(i, 1);

  }

  agregarPracticaDual(): void {

    this.curriculum.practicasDuales.push({ anio: '', institucion: '', puestoAprendizaje: '', actividades: '' });

  }

  quitarPracticaDual(i: number): void {

    this.curriculum.practicasDuales.splice(i, 1);

  }

  agregarInformacionAdicional(): void {

    this.curriculum.informacionAdicional.push({ anio: '', institucion: '', logro: '', detalle: '' });

  }

  quitarInformacionAdicional(i: number): void {

    this.curriculum.informacionAdicional.splice(i, 1);

  }

  volver(): void {

    this.router.navigate(['/']);

  }

  guardarEnBD(): void {

    if (this.guardando) return;

    if (!this.curriculum.datosPersonales.nombre || !this.curriculum.datosPersonales.cedula) {

      Swal.fire('Datos incompletos', 'Nombre y cédula son obligatorios.', 'warning');
      return;

    }

    this.guardando = true;

    this.documentos.guardarCurriculum(this.curriculum).subscribe({

      next: (res) => {

        this.guardando = false;
        this.cdr.detectChanges();

        Swal.fire({

          icon: 'success',
          title: 'Currículo guardado',
          html: `<b>ID:</b> ${res.id_documento}<br><b>Formato:</b> ${res.codigo_formato}<br><b>Fecha:</b> ${res.created_at}`

        });

      },

      error: () => {

        this.guardando = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'No fue posible guardar el currículo.', 'error');

      }

    });

  }

  descargarPDF(): void {

    const elemento = document.getElementById('documento-f02');

    if (!elemento) return;

    html2pdf()
      .set({

        margin: 0,

        filename: 'Curriculum_Estandarizado.pdf',

        image: { type: 'jpeg', quality: 1 },

        html2canvas: {
          scale: 2,
          onclone: (clonedDoc: Document) => {

            clonedDoc.querySelectorAll<HTMLElement>('.no-print').forEach((el) => {
              el.style.display = 'none';
            });

            clonedDoc.querySelectorAll<HTMLElement>('.solo-print').forEach((el) => {
              el.style.display = 'inline';
            });

          }
        },

        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }

      })
      .from(elemento)
      .save();

  }

}
