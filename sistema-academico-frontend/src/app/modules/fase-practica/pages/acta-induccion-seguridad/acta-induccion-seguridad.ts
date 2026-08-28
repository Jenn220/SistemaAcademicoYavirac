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

  acta: ActaInduccionSeguridad = actaInduccionVacia();
  idPractica: number | undefined;

  ngOnInit(): void {
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
