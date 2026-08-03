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

import { Documentos } from '../../services/documentos';
import { Cv, CvDatoAcademico, CvExperienciaLaboral, CvPracticaDual } from '../../services/cv';
import { AuthService } from '../../../auth/services/auth.service';
import { DocumentHeader } from '../../components/document-header/document-header';
import { Curriculum as CurriculumModel } from '../../interfaces';
import { exportarDocumentoWord } from '../../utils/exportar-word';

function curriculumVacio(): CurriculumModel {
  return {
    periodoAcademico: '',
    datosPersonales: { nombre: '', cedula: '', estadoCivil: '', telefono: '', domicilio: '', emailInstitucional: '' },
    datosAcademicos: [],
    experienciaLaboral: [],
    practicasDuales: [],
    informacionAdicional: [],
    encabezado: {
      carrera: '',
      nivel: '',
      periodoAcademico: '',
      nucleo: '',
      tutorAcademico: '',
      coordinador: '',
      empresa: '',
      tutorEmpresarial: '',
      proyecto: '',
      cobertura: '',
      plazo: '',
      fechaInicio: '',
      fechaFin: ''
    }
  };
}

@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentHeader],
  templateUrl: './curriculum.html',
  styleUrl: './curriculum.scss'
})
export class Curriculum implements OnInit {

  private documentos = inject(Documentos);
  private cv = inject(Cv);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  /**
   * Para el ESTUDIANTE es su propio id (del JWT); para DOCENTE/COORDINADOR
   * viendo el currículo de otro estudiante (vía selector), es el id que
   * devuelve /documentos/datos para la práctica elegida — sin esto,
   * DOCENTE siempre intentaba leer/escribir el CV de "su" id_estudiante
   * (inexistente), nunca el del estudiante que en realidad estaba viendo.
   */
  private idEstudianteVisto: number | null = null;

  private get idEstudiante(): number {
    return this.idEstudianteVisto ?? this.authService.usuario()?.idEstudiante ?? 0;
  }

  private idPractica: number | undefined;

  curriculum: CurriculumModel = curriculumVacio();

  cargando = false;

  guardando = false;

  get esEstudiante(): boolean {
    return this.authService.tieneAlgunRol(['ESTUDIANTE']);
  }

  encabezado = {
    carrera: '',
    nivel: '',
    nucleo: '',
    tutorAcademico: '',
    coordinador: '',
    empresa: '',
    tutorEmpresarial: '',
    proyecto: '',
    cobertura: '',
    plazo: '',
    fechaInicio: '',
    fechaFin: ''
  };

  ngOnInit(): void {

    this.cargar();

  }

  /**
   * El endpoint propio de curriculum no manda un "periodoAcademico" a nivel
   * raíz (el formato F02 lo pide como campo del encabezado, aparte de los
   * datos académicos). Se completa con /documentos/datos.
   *
   * "emailInstitucional" tampoco se leía bien: el back lo manda como
   * datosPersonales.emailInstitucional (no .email), y este mapeo leía la
   * llave equivocada, así que siempre quedaba vacío aunque el dato ya
   * viajara en la respuesta. Junto con estadoCivil/teléfono/domicilio,
   * también se completa con /documentos/datos si el propio endpoint no
   * trae el valor.
   */
  private mapearBase(res: Record<string, any>, datos: Record<string, any>): CurriculumModel {

    const dp = res?.['datosPersonales'] ?? {};
    const da = res?.['datosAcademicos'] ?? {};
    const experiencia = (res?.['experienciaLaboral'] ?? []) as any[];
    const practicas = (res?.['practicasDualesPrevias'] ?? []) as any[];
    const infoAdicional = res?.['informacionAdicional'] ?? {};

    const logros: string[] = infoAdicional?.['logros'] ?? [];
    const idiomas: string[] = infoAdicional?.['idiomas'] ?? [];
    const habilidades: string[] = infoAdicional?.['habilidades'] ?? [];

    const datosPeriodo = datos?.['periodoAcademico'] ?? {};
    const datosEstudiante = datos?.['estudiante'] ?? {};

    return {
      periodoAcademico: res?.['periodoAcademico'] ?? datosPeriodo.nombre ?? '',
      datosPersonales: {
        nombre: dp.nombre ?? datosEstudiante.nombre ?? '',
        cedula: dp.cedula ?? datosEstudiante.cedula ?? '',
        estadoCivil: dp.estadoCivil || datosEstudiante.estadoCivil || '',
        telefono: dp.telefono || datosEstudiante.telefono || '',
        domicilio: dp.domicilio || datosEstudiante.domicilio || '',
        emailInstitucional: dp.emailInstitucional || datosEstudiante.email || ''
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
      ],
      encabezado: {
        carrera: datosEstudiante.carrera ?? '',
        nivel: datosEstudiante.nivel ?? datosEstudiante.curso ?? '',
        periodoAcademico: datosPeriodo.nombre ?? '',
        nucleo: '',
        tutorAcademico: '',
        coordinador: '',
        empresa: '',
        tutorEmpresarial: '',
        proyecto: '',
        cobertura: '',
        plazo: '',
        fechaInicio: '',
        fechaFin: ''
      }
    };

  }

  cargar(): void {

    this.cargando = true;

    const idPracticaRuta = Number(this.route.snapshot.paramMap.get('idPractica')) || undefined;

    if (idPracticaRuta) {
      this.idPractica = idPracticaRuta;
      this.ejecutarCargaCurriculum();
      return;
    }

    this.documentos.obtenerMiPractica().subscribe({
      next: (resp) => {
        this.idPractica = resp.id_practica;
        this.ejecutarCargaCurriculum();
      },
      error: () => {
        this.curriculum = curriculumVacio();
        this.cargando = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'No fue posible cargar el currículo desde el servidor.', 'error');
      }
    });

  }

  private ejecutarCargaCurriculum(): void {

    if (!this.idPractica) return;

    this.documentos.obtenerDatosMaestra(this.idPractica).pipe(
      catchError(() => of({} as Record<string, any>))
    ).subscribe((datos) => {
      const carrera = datos?.['carrera'] ?? {};
      const proyecto = datos?.['proyectoEmpresarial'] ?? {};
      const empresa = datos?.['empresaBeneficiaria'] ?? {};
      const periodo = datos?.['periodoAcademico'] ?? {};
      const estudiante = datos?.['estudiante'] ?? {};

      this.encabezado = {
        carrera: carrera.nombre ?? estudiante.carrera ?? '',
        nivel: estudiante.nivel ?? estudiante.curso ?? '',
        nucleo: carrera.nucleoEstructurante ?? '',
        tutorAcademico: carrera.tutorAcademico ?? '',
        coordinador: carrera.coordinador ?? '',
        empresa: empresa.razonSocial ?? proyecto.empresaAsignada ?? '',
        tutorEmpresarial: empresa.tutorEmpresarial ?? '',
        proyecto: proyecto.nombre ?? '',
        cobertura: proyecto.cobertura ?? '',
        plazo: proyecto.plazo ?? '',
        fechaInicio: proyecto.fechaInicio ?? '',
        fechaFin: proyecto.fechaFin ?? ''
      };

      forkJoin({
        curriculum: this.documentos.obtenerCurriculumBase(this.idPractica),
        datos: of(datos)
      }).subscribe({

        next: ({ curriculum }) => {

          this.curriculum = this.mapearBase(curriculum, datos);
          this.cargarCvReal();

        },

        error: () => {

          this.curriculum = curriculumVacio();
          this.cargando = false;
          this.cdr.detectChanges();

          Swal.fire('Error', 'No fue posible cargar el currículo desde el servidor.', 'error');

        }

      });

    });

  }

  /**
   * Los datos académicos, experiencia laboral y prácticas duales previas
   * viven en tablas reales (cv_dato_academico, etc.) aparte del snapshot F02
   * que arma mapearBase(). Se sobrescriben aquí con la fuente real para que
   * "agregar/quitar" trabajen contra ids persistidos de verdad.
   */
  private cargarCvReal(): void {

    forkJoin({
      datosAcademicos: this.cv.listarDatosAcademicos(this.idEstudiante).pipe(catchError(() => of([] as CvDatoAcademico[]))),
      experienciaLaboral: this.cv.listarExperienciaLaboral(this.idEstudiante).pipe(catchError(() => of([] as CvExperienciaLaboral[]))),
      practicasDuales: this.cv.listarPracticasDuales(this.idEstudiante).pipe(catchError(() => of([] as CvPracticaDual[])))
    }).subscribe({

      next: ({ datosAcademicos, experienciaLaboral, practicasDuales }) => {

        this.curriculum.datosAcademicos = datosAcademicos.map((d) => ({
          id: d.id_cv_dato_academico,
          anio: d.anio,
          institucion: d.institucion,
          tituloMencion: d.titulo_mencion,
          notaFinal: d.nota_final !== undefined && d.nota_final !== null ? String(d.nota_final) : ''
        }));

        this.curriculum.experienciaLaboral = experienciaLaboral.map((e) => ({
          id: e.id_cv_experiencia_laboral,
          anio: e.anio,
          institucion: e.institucion,
          cargo: e.cargo,
          actividades: e.actividades
        }));

        this.curriculum.practicasDuales = practicasDuales.map((p) => ({
          id: p.id_cv_practica_dual,
          anio: p.anio_periodo,
          institucion: p.institucion,
          puestoAprendizaje: p.cargo,
          actividades: p.actividades_realizadas
        }));

        this.cargando = false;
        this.cdr.detectChanges();

      },

      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }

    });

  }

  agregarDatoAcademico(): void {

    if (!this.esEstudiante) return;

    this.curriculum.datosAcademicos.push({ anio: '', institucion: '', tituloMencion: '', notaFinal: '' });

  }

  quitarDatoAcademico(i: number): void {

    if (!this.esEstudiante) return;

    const item = this.curriculum.datosAcademicos[i];

    if (!item.id) {
      this.curriculum.datosAcademicos.splice(i, 1);
      return;
    }

    this.cv.eliminarDatoAcademico(item.id).subscribe({
      next: () => {
        this.curriculum.datosAcademicos.splice(i, 1);
        this.cdr.detectChanges();
      },
      error: () => Swal.fire('Error', 'No fue posible eliminar el dato académico.', 'error')
    });

  }

  agregarExperiencia(): void {

    if (!this.esEstudiante) return;

    this.curriculum.experienciaLaboral.push({ anio: '', institucion: '', cargo: '', actividades: '' });

  }

  quitarExperiencia(i: number): void {

    if (!this.esEstudiante) return;

    const item = this.curriculum.experienciaLaboral[i];

    if (!item.id) {
      this.curriculum.experienciaLaboral.splice(i, 1);
      return;
    }

    this.cv.eliminarExperienciaLaboral(item.id).subscribe({
      next: () => {
        this.curriculum.experienciaLaboral.splice(i, 1);
        this.cdr.detectChanges();
      },
      error: () => Swal.fire('Error', 'No fue posible eliminar la experiencia laboral.', 'error')
    });

  }

  agregarPracticaDual(): void {

    if (!this.esEstudiante) return;

    this.curriculum.practicasDuales.push({ anio: '', institucion: '', puestoAprendizaje: '', actividades: '' });

  }

  quitarPracticaDual(i: number): void {

    if (!this.esEstudiante) return;

    const item = this.curriculum.practicasDuales[i];

    if (!item.id) {
      this.curriculum.practicasDuales.splice(i, 1);
      return;
    }

    this.cv.eliminarPracticaDual(item.id).subscribe({
      next: () => {
        this.curriculum.practicasDuales.splice(i, 1);
        this.cdr.detectChanges();
      },
      error: () => Swal.fire('Error', 'No fue posible eliminar la práctica dual previa.', 'error')
    });

  }

  agregarInformacionAdicional(): void {

    if (!this.esEstudiante) return;

    this.curriculum.informacionAdicional.push({ anio: '', institucion: '', logro: '', detalle: '' });

  }

  quitarInformacionAdicional(i: number): void {

    if (!this.esEstudiante) return;

    this.curriculum.informacionAdicional.splice(i, 1);

  }

  volver(): void {

    this.router.navigate(['/']);

  }

  guardarEnBD(): void {

    if (this.guardando || !this.esEstudiante) return;

    if (!this.curriculum.datosPersonales.nombre || !this.curriculum.datosPersonales.cedula) {

      Swal.fire('Datos incompletos', 'Nombre y cédula son obligatorios.', 'warning');
      return;

    }

    this.guardando = true;

    this.documentos.guardarCurriculum(this.curriculum, this.idPractica).subscribe({

      next: (res) => this.guardarCvReal(res),

      error: () => {

        this.guardando = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'No fue posible guardar el currículo.', 'error');

      }

    });

  }

  /**
   * Persiste datos académicos / experiencia laboral / prácticas duales en
   * las tablas reales del CV (crea o actualiza según tengan id), igual que
   * plan-marco.ts hace con sus ítems. Filas nuevas totalmente vacías se
   * ignoran en vez de mandarlas al back (las validaciones del DTO las
   * rechazarían de todas formas).
   */
  private guardarCvReal(resultadoSnapshot: { id_documento: number; codigo_formato: string; created_at: string }): void {

    const operacionesDatosAcademicos = this.curriculum.datosAcademicos
      .filter((d) => d.id || (d.anio && d.institucion && d.tituloMencion))
      .map((d) => {
        const dto: Partial<CvDatoAcademico> = {
          anio: d.anio,
          institucion: d.institucion,
          titulo_mencion: d.tituloMencion,
          nota_final: d.notaFinal ? Number(d.notaFinal) : undefined
        };
        return d.id
          ? this.cv.actualizarDatoAcademico(d.id, dto)
          : this.cv.crearDatoAcademico(this.idEstudiante, dto);
      });

    const operacionesExperiencia = this.curriculum.experienciaLaboral
      .filter((e) => e.id || (e.anio && e.institucion && e.cargo && e.actividades))
      .map((e) => {
        const dto: Partial<CvExperienciaLaboral> = {
          anio: e.anio,
          institucion: e.institucion,
          cargo: e.cargo,
          actividades: e.actividades
        };
        return e.id
          ? this.cv.actualizarExperienciaLaboral(e.id, dto)
          : this.cv.crearExperienciaLaboral(this.idEstudiante, dto);
      });

    const operacionesPracticas = this.curriculum.practicasDuales
      .filter((p) => p.id || (p.anio && p.institucion && p.puestoAprendizaje && p.actividades))
      .map((p) => {
        const dto: Partial<CvPracticaDual> = {
          anio_periodo: p.anio,
          institucion: p.institucion,
          cargo: p.puestoAprendizaje,
          actividades_realizadas: p.actividades
        };
        return p.id
          ? this.cv.actualizarPracticaDual(p.id, dto)
          : this.cv.crearPracticaDual(this.idEstudiante, dto);
      });

    const finalizar = () => {

      this.guardando = false;
      this.cdr.detectChanges();

      Swal.fire({
        icon: 'success',
        title: 'Currículo guardado',
        html: `<b>ID:</b> ${resultadoSnapshot.id_documento}<br><b>Formato:</b> ${resultadoSnapshot.codigo_formato}<br><b>Fecha:</b> ${resultadoSnapshot.created_at}`
      });

    };

    if (operacionesDatosAcademicos.length === 0 && operacionesExperiencia.length === 0 && operacionesPracticas.length === 0) {
      finalizar();
      return;
    }

    forkJoin({
      datosAcademicos: operacionesDatosAcademicos.length ? forkJoin(operacionesDatosAcademicos) : of([]),
      experienciaLaboral: operacionesExperiencia.length ? forkJoin(operacionesExperiencia) : of([]),
      practicasDuales: operacionesPracticas.length ? forkJoin(operacionesPracticas) : of([])
    }).subscribe({

      next: () => {
        finalizar();
      },

      error: () => {
        this.guardando = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'El currículo se guardó, pero hubo un problema guardando datos académicos, experiencia laboral o prácticas duales.', 'error');
      }

    });

  }

  descargarWord(): void {

    exportarDocumentoWord('documento-f02', 'Curriculum_Estandarizado', 'portrait');

  }

}
