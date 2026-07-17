import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import html2pdf from 'html2pdf.js';

import { StudentPresentation } from '../../components/student-presentation/student-presentation';
import { DocumentHeader } from '../../../../shared/components/document-header/document-header';

import { CartaCompromiso as Carta } from '../../interfaces';
import { Documentos } from '../../services/documentos';
import { MOCK_CARTA_COMPROMISO } from '../../services/mock-documentos.data';

@Component({
  selector: 'app-carta-compromiso',
  standalone: true,
  imports: [
    CommonModule,
    DocumentHeader,
    StudentPresentation
  ],
  templateUrl: './carta-compromiso.html',
  styleUrl: './carta-compromiso.scss'
})
export class CartaCompromiso implements OnInit {

  private documentos = inject(Documentos);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // TODO: quitar el mock cuando el login/JWT del frontend esté conectado
  carta: Carta = structuredClone(MOCK_CARTA_COMPROMISO);

  ngOnInit(): void {

    this.cargarCarta();

  }

  cargarCarta(): void {

    this.documentos.obtenerCartaCompromiso().subscribe({

      next: (res: Record<string, any>) => {

        const estudiante = res?.['estudiante'] ?? {};
        const espacioFirma = res?.['espacioFirma'] ?? {};

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
            carrera: estudiante.carrera ?? '',
            curso: estudiante.curso ?? ''
          },
          empresaAsignada: res?.['empresaAsignada'] ?? '',
          espacioFirma: {
            lugar: espacioFirma.lugar ?? '',
            fecha: espacioFirma.fecha ?? ''
          }
        };

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error('❌ Error obteniendo carta (usando datos moqueados):', err);

        this.carta = structuredClone(MOCK_CARTA_COMPROMISO);
        this.cdr.detectChanges();

      }

    });

  }

  volver(): void {

    this.router.navigate(['/']);

  }

  imprimir(): void {

    window.print();

  }

  descargarPDF(): void {

    const elemento = document.getElementById('documento-f01');

    if (!elemento) return;

    html2pdf()
      .set({

        margin: 0,

        filename: 'Carta_Compromiso.pdf',

        image: {
          type: 'jpeg',
          quality: 1
        },

        html2canvas: {
          scale: 2
        },

        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }

      })
      .from(elemento)
      .save();

  }

}