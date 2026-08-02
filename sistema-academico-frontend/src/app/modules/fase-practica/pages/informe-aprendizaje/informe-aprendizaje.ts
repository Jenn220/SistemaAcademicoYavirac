import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { Documentos } from '../../services/documentos';
import { InformeAprendizajeApi, BitacoraSemanalReal } from '../../services/informe-aprendizaje-real';
import { AuthService } from '../../../auth/services/auth.service';
import { DocumentHeader } from '../../components/document-header/document-header';
import { InformeAprendizajeDocumento } from '../../interfaces';
import { exportarDocumentoWord } from '../../utils/exportar-word';

function informeVacio(): InformeAprendizajeDocumento {
  return {
    estudiante: { nombre: '', cedula: '' },
    encabezado: {
      empresaFormadora: '', nivel: '', cicloAcademico: '',
      fechaInicioFasePractica: '', fechaFinFasePractica: '',
      tutorAcademico: '', nucleoEstructurante: '', tutorEmpresarial: '',
      carrera: '', objetivoNucleoEstructurante: ''
    },
    semanas: [],
    reflexionAprendizaje: '',
    observacionesEmpresa: ''
  };
}

@Component({
  selector: 'app-informe-aprendizaje',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentHeader],
  templateUrl: './informe-aprendizaje.html',
  styleUrl: './informe-aprendizaje.scss'
})
export class InformeAprendizaje implements OnInit {

  private documentos = inject(Documentos);
  private informeApi = inject(InformeAprendizajeApi);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  informe: InformeAprendizajeDocumento = informeVacio();

  private idPractica: number | undefined;

  cargando = false;

  guardando = false;

  /** ESTUDIANTE edita bitácora + reflexión; TUTOR_EMPRESARIAL edita observaciones de empresa; DOCENTE/COORDINADOR solo consultan. */
  get esEstudiante(): boolean {
    return this.authService.tieneAlgunRol(['ESTUDIANTE']);
  }

  get esTutorEmpresarial(): boolean {
    return this.authService.tieneAlgunRol(['TUTOR_EMPRESARIAL']);
  }

  get soloLectura(): boolean {
    return !this.esEstudiante && !this.esTutorEmpresarial;
  }

  ngOnInit(): void {

    this.cargar();

  }

  /**
   * El backend anida al estudiante DENTRO de encabezado (no en la raíz), y
   * usa otros nombres de campo: "empresa" (no empresaFormadora),
   * "cicloAcademico" (no periodoAcademico), "fechaInicio"/"fechaFin" (no
   * fechaInicioFasePractica/fechaFinFasePractica). Se completa con
   * /documentos/datos cuando el propio endpoint no trae el valor.
   */
  private mapearBase(res: Record<string, any>, datos: Record<string, any>): InformeAprendizajeDocumento {

    const encabezado = res?.['encabezado'] ?? {};
    const estudiante = encabezado?.['estudiante'] ?? {};

    const datosEstudiante = datos?.['estudiante'] ?? {};
    const datosCarrera = datos?.['carrera'] ?? {};
    const datosPeriodo = datos?.['periodoAcademico'] ?? {};
    const datosProyecto = datos?.['proyectoEmpresarial'] ?? {};
    const datosEmpresa = datos?.['empresaBeneficiaria'] ?? {};

    return {
      estudiante: {
        nombre: estudiante.nombre ?? datosEstudiante.nombre ?? '',
        cedula: estudiante.cedula ?? datosEstudiante.cedula ?? ''
      },
      encabezado: {
        empresaFormadora: encabezado.empresa || datosProyecto.empresaAsignada || '',
        nivel: encabezado.nivel || datosEstudiante.nivel || '',
        cicloAcademico: encabezado.cicloAcademico || datosPeriodo.nombre || '',
        fechaInicioFasePractica: encabezado.fechaInicio || datosProyecto.fechaInicio || '',
        fechaFinFasePractica: encabezado.fechaFin || datosProyecto.fechaFin || '',
        tutorAcademico: encabezado.tutorAcademico || datosCarrera.tutorAcademico || '',
        nucleoEstructurante: encabezado.nucleoEstructurante || datosCarrera.nucleoEstructurante || '',
        tutorEmpresarial: encabezado.tutorEmpresarial || datosEmpresa.tutorEmpresarial || '',
        carrera: encabezado.carrera || datosEstudiante.carrera || '',
        objetivoNucleoEstructurante: encabezado.objetivoNucleoEstructurante || datosCarrera.objetivoNucleoEstructurante || ''
      },
      // Semanas/reflexión/observaciones se sobrescriben en cargarInformeReal()
      // con lo que de verdad hay guardado en informe_aprendizaje/bitacora_semanal.
      semanas: [],
      reflexionAprendizaje: '',
      observacionesEmpresa: ''
    };

  }

  cargar(): void {

    this.cargando = true;

    const idPracticaRuta = Number(this.route.snapshot.paramMap.get('idPractica')) || undefined;

    if (idPracticaRuta) {
      this.idPractica = idPracticaRuta;
      this.ejecutarCargaInforme();
      return;
    }

    this.documentos.obtenerMiPractica().subscribe({
      next: (resp) => {
        this.idPractica = resp.id_practica;
        this.ejecutarCargaInforme();
      },
      error: () => {
        this.informe = informeVacio();
        this.cargando = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'No fue posible cargar el informe de aprendizaje desde el servidor.', 'error');
      }
    });

  }

  private ejecutarCargaInforme(): void {

    if (!this.idPractica) return;

    forkJoin({
      informe: this.documentos.obtenerInformeAprendizajeBase(this.idPractica),
      datos: this.documentos.obtenerDatosMaestra(this.idPractica).pipe(catchError(() => of({} as Record<string, any>)))
    }).subscribe({

      next: ({ informe, datos }) => {

        this.informe = this.mapearBase(informe, datos);
        this.cargarInformeReal(datos);

      },

      error: () => {

        this.informe = informeVacio();
        this.cargando = false;
        this.cdr.detectChanges();

        Swal.fire('Error', 'No fue posible cargar el informe de aprendizaje desde el servidor.', 'error');

      }

    });

  }

  /**
   * idPractica lo resuelve el back para ESTUDIANTE/TUTOR_EMPRESARIAL vía
   * JWT; para DOCENTE/COORDINADOR viene de la ruta. /documentos/datos ya
   * expone idPractica (igual que en evaluaciones) — se usa para no volver
   * a resolverlo por separado.
   */
  private cargarInformeReal(datos: Record<string, any>): void {

    const idPractica = this.idPractica ?? datos?.['idPractica'];

    if (!idPractica) {
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    this.idPractica = idPractica;

    this.informeApi.listarPorPractica(idPractica).subscribe({

      next: (informes) => {

        const principal = informes[0];

        if (!principal?.id_informe) {
          this.cargando = false;
          this.cdr.detectChanges();
          return;
        }

        this.informe.idInforme = principal.id_informe;
        this.informe.reflexionAprendizaje = principal.reflexion_aprendizaje ?? '';
        this.informe.observacionesEmpresa = principal.observaciones_empresa ?? '';

        this.informeApi.listarBitacoras(principal.id_informe).subscribe({

          next: (bitacoras) => {

            this.informe.semanas = bitacoras
              .sort((a, b) => a.semana - b.semana)
              .map((b) => ({
                id: b.id_bitacora,
                semana: b.semana,
                fechaInicio: b.fecha_inicio_semana ?? '',
                fechaFin: b.fecha_fin_semana ?? '',
                puestoAprendizaje: b.puesto_aprendizaje ?? '',
                actividadesRealizadas: b.actividades_realizadas ?? '',
                actividadesAutonomas: b.actividades_autonomas ?? ''
              }));

            this.cargando = false;
            this.cdr.detectChanges();

          },

          error: () => {
            this.cargando = false;
            this.cdr.detectChanges();
          }

        });

      },

      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }

    });

  }

  agregarSemana(): void {

    if (!this.esEstudiante) return;

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

    if (!this.esEstudiante) return;

    const fila = this.informe.semanas[i];

    if (!fila.id) {
      this.informe.semanas.splice(i, 1);
      return;
    }

    this.informeApi.eliminarBitacora(fila.id).subscribe({
      next: () => {
        this.informe.semanas.splice(i, 1);
        this.cdr.detectChanges();
      },
      error: () => Swal.fire('Error', 'No fue posible eliminar la semana.', 'error')
    });

  }

  volver(): void {

    this.router.navigate(['/']);

  }

  guardarEnBD(): void {

    if (this.guardando || this.soloLectura) return;

    if (!this.informe.estudiante.nombre || !this.informe.estudiante.cedula) {

      Swal.fire('Datos incompletos', 'Nombre y cédula del estudiante son obligatorios.', 'warning');
      return;

    }

    if (!this.idPractica) {

      Swal.fire('Error', 'No fue posible determinar la práctica de este informe.', 'error');
      return;

    }

    this.guardando = true;

    const idInforme$: Observable<number> = this.informe.idInforme
      ? this.informeApi.actualizar(this.informe.idInforme, {
          reflexion_aprendizaje: this.informe.reflexionAprendizaje,
          observaciones_empresa: this.informe.observacionesEmpresa
        }).pipe(map((i) => i.id_informe!))
      : this.informeApi.crear({
          id_practica: this.idPractica,
          reflexion_aprendizaje: this.informe.reflexionAprendizaje,
          observaciones_empresa: this.informe.observacionesEmpresa
        }).pipe(map((i) => i.id_informe!));

    idInforme$
      .pipe(
        switchMap((idInforme) => this.guardarBitacoras(idInforme).pipe(map(() => idInforme))),
        switchMap((idInforme) =>
          this.documentos.guardarInformeAprendizaje(this.informe, this.idPractica).pipe(
            catchError(() => of(null)),
            map(() => idInforme)
          )
        )
      )
      .subscribe({

        next: (idInforme) => {

          this.informe.idInforme = idInforme;
          this.guardando = false;
          this.cdr.detectChanges();

          Swal.fire('Informe guardado', 'El informe de aprendizaje se guardó correctamente.', 'success');

        },

        error: () => {

          this.guardando = false;
          this.cdr.detectChanges();
          Swal.fire('Error', 'No fue posible guardar el informe.', 'error');

        }

      });

  }

  /**
   * Solo ESTUDIANTE gestiona bitácoras (semanas); si un TUTOR_EMPRESARIAL
   * guarda solo sus observaciones, no toca la lista de semanas.
   */
  private guardarBitacoras(idInforme: number): Observable<unknown> {

    if (!this.esEstudiante || this.informe.semanas.length === 0) {
      return of(null);
    }

    const operaciones = this.informe.semanas.map((fila) => {

      const dto: Partial<BitacoraSemanalReal> = {
        semana: fila.semana,
        fecha_inicio_semana: fila.fechaInicio || undefined,
        fecha_fin_semana: fila.fechaFin || undefined,
        puesto_aprendizaje: fila.puestoAprendizaje,
        actividades_realizadas: fila.actividadesRealizadas,
        actividades_autonomas: fila.actividadesAutonomas
      };

      return fila.id
        ? this.informeApi.actualizarBitacora(fila.id, dto)
        : this.informeApi.crearBitacora({ id_informe: idInforme, ...dto } as BitacoraSemanalReal);

    });

    return forkJoin(operaciones);

  }

  descargarWord(): void {

    exportarDocumentoWord('documento-f06', 'Informe_Aprendizaje', 'landscape');

  }

}
