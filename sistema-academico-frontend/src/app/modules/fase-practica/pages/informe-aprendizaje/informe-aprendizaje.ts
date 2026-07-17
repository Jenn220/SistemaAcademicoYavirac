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
import { InformeAprendizajeDocumento } from '../../interfaces';
import { MOCK_INFORME_APRENDIZAJE } from '../../services/mock-documentos.data';

@Component({
  selector: 'app-informe-aprendizaje',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentHeader],
  templateUrl: './informe-aprendizaje.html',
  styleUrl: './informe-aprendizaje.scss'
})
export class InformeAprendizaje implements OnInit {

  private documentos = inject(Documentos);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // TODO: quitar el mock cuando el login/JWT del frontend esté conectado
  informe: InformeAprendizajeDocumento = structuredClone(MOCK_INFORME_APRENDIZAJE);

  cargando = false;

  guardando = false;

  ngOnInit(): void {

    this.cargar();

  }

  private mapearBase(res: Record<string, any>): InformeAprendizajeDocumento {

    const estudiante = res?.['estudiante'] ?? {};
    const encabezado = res?.['encabezado'] ?? {};
    const semanas = (res?.['semanas'] ?? []) as any[];

    return {
      estudiante: {
        nombre: estudiante.nombre ?? '',
        cedula: estudiante.cedula ?? ''
      },
      encabezado: {
        empresaFormadora: encabezado.empresaFormadora ?? '',
        nivel: encabezado.nivel ?? '',
        cicloAcademico: encabezado.cicloAcademico ?? '',
        fechaInicioFasePractica: encabezado.fechaInicioFasePractica ?? '',
        fechaFinFasePractica: encabezado.fechaFinFasePractica ?? '',
        tutorAcademico: encabezado.tutorAcademico ?? '',
        nucleoEstructurante: encabezado.nucleoEstructurante ?? '',
        tutorEmpresarial: encabezado.tutorEmpresarial ?? '',
        carrera: encabezado.carrera ?? '',
        objetivoNucleoEstructurante: encabezado.objetivoNucleoEstructurante ?? ''
      },
      semanas: semanas.map((s) => ({
        semana: s.semana ?? 0,
        fechaInicio: s.fechaInicio ?? '',
        fechaFin: s.fechaFin ?? '',
        puestoAprendizaje: s.puestoAprendizaje ?? '',
        actividadesRealizadas: s.actividadesRealizadas ?? '',
        actividadesAutonomas: s.actividadesAutonomas ?? ''
      })),
      reflexionAprendizaje: semanas[0]?.reflexion ?? '',
      observacionesEmpresa: semanas[0]?.observacionesEmpresa ?? ''
    };

  }

  cargar(): void {

    this.cargando = true;

    this.documentos.obtenerInformeAprendizajeBase().subscribe({

      next: (res) => {

        this.informe = this.mapearBase(res);
        this.cargando = false;
        this.cdr.detectChanges();

      },

      error: () => {

        this.informe = structuredClone(MOCK_INFORME_APRENDIZAJE);
        this.cargando = false;
        this.cdr.detectChanges();

      }

    });

  }

  agregarSemana(): void {

    const numero = this.informe.semanas.length + 1;

    this.informe.semanas.push({
      semana: numero,
      fechaInicio: '',
      fechaFin: '',
      puestoAprendizaje: '',
      actividadesRealizadas: '',
      actividadesAutonomas: ''
    });

  }

  quitarSemana(i: number): void {

    this.informe.semanas.splice(i, 1);

  }

  volver(): void {

    this.router.navigate(['/']);

  }

  guardarEnBD(): void {

    if (this.guardando) return;

    if (!this.informe.estudiante.nombre || !this.informe.estudiante.cedula) {

      Swal.fire('Datos incompletos', 'Nombre y cédula del estudiante son obligatorios.', 'warning');
      return;

    }

    this.guardando = true;

    this.documentos.guardarInformeAprendizaje(this.informe).subscribe({

      next: (res) => {

        this.guardando = false;
        this.cdr.detectChanges();

        Swal.fire({

          icon: 'success',
          title: 'Informe guardado',
          html: `<b>ID:</b> ${res.id_documento}<br><b>Formato:</b> ${res.codigo_formato}<br><b>Fecha:</b> ${res.created_at}`

        });

      },

      error: () => {

        this.guardando = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'No fue posible guardar el informe.', 'error');

      }

    });

  }

  descargarPDF(): void {

    const elemento = document.getElementById('documento-f06');

    if (!elemento) return;

    html2pdf()
      .set({

        margin: 0,

        filename: 'Informe_Aprendizaje.pdf',

        image: { type: 'jpeg', quality: 1 },

        html2canvas: {
          scale: 2,
          onclone: (clonedDoc: Document) => {

            clonedDoc.querySelectorAll<HTMLElement>('.no-print').forEach((el) => {
              el.style.display = 'none';
            });

          }
        },

        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }

      })
      .from(elemento)
      .save();

  }

}
