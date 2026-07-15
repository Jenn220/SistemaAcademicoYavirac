import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import html2pdf from 'html2pdf.js';

import { RegistroAsistencia as Registro } from '../../interfaces';
import { Documentos } from '../../services/documentos';

import { DocumentHeader } from '../../../../shared/components/document-header/document-header';

@Component({
  selector: 'app-registro-asistencia',
  standalone: true,
  imports: [
    CommonModule,
    DocumentHeader
  ],
  templateUrl: './registro-asistencia.html',
  styleUrl: './registro-asistencia.scss'
})
export class RegistroAsistencia implements OnInit {

  private documentos = inject(Documentos);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  registro?: Registro;

  ngOnInit(): void {

    this.cargarRegistro();

  }

  cargarRegistro(): void {

    this.documentos.obtenerRegistroAsistencia().subscribe({

      next: (res) => {

        console.log('✅ Registro recibido:', res);

        this.registro = { ...res };

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error('❌ Error obteniendo registro:', err);

      }

    });

  }

  volver(): void {

    this.router.navigate(['/']);

  }

  descargarPDF(): void {

    const elemento = document.getElementById('documento-f05');

    if (!elemento) return;

    html2pdf()
      .set({

        margin: 0,

        filename: 'Registro_Asistencia.pdf',

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