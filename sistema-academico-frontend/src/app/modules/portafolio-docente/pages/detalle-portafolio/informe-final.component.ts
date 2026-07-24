import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { InformeFinalService } from '../../services/informe-final.service';
import { AuthService } from '../../../auth/services/auth.service';
import {
  CreateInformeFinalDto,
  EstudianteNotaLocal,
  InformeFinalCamposLocales,
  InformeFinalResponseDto,
} from '../../models/informe-final.model';

@Component({
  selector: 'app-informe-final',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './informe-final.component.html',
  styleUrl: './informe-final.component.scss',
})
export class InformeFinalComponent implements OnInit {
  readonly hoy = new Date();

  idOfertaAsignatura!: number;
  informe: InformeFinalResponseDto | null = null;

  cargando = false;
  creando = false;
  noExiste = false;
  errorMsg: string | null = null;
  okMsg: string | null = null;

  // Formulario de creación manual: el backend exige id_asignatura / id_paralelo
  // como números, pero "mis-ofertas" solo entrega los nombres en texto.
  // Hasta que exista un catálogo, el docente los escribe a mano aquí.
  formCreacion: FormGroup = this.fb.group({
    id_periodo: [null, Validators.required],
    id_asignatura: [null, Validators.required],
    id_paralelo: [null, Validators.required],
    horario: ['', Validators.required],
  });

  local: InformeFinalCamposLocales = this.localVacio();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: InformeFinalService,
    private readonly auth: AuthService,
    private readonly fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    // Se espera navegar aquí como: /informe-final/:idOfertaAsignatura
    this.idOfertaAsignatura = Number(this.route.snapshot.paramMap.get('idOfertaAsignatura'));
    this.cargarInforme();
  }

  cargarInforme(): void {
    this.cargando = true;
    this.errorMsg = null;
    this.noExiste = false;

    this.service.getInformeFinal(this.idOfertaAsignatura).subscribe({
      next: (resp) => {
        this.informe = resp;
        this.local = this.leerLocal();
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        if (err.status === 404) {
          this.noExiste = true;
        } else {
          this.errorMsg = 'No se pudo cargar el informe final desde el servidor.';
        }
      },
    });
  }

  crearInforme(): void {
    if (this.formCreacion.invalid) {
      this.formCreacion.markAllAsTouched();
      return;
    }
    const idDocente = this.auth.usuario()?.idDocente;
    if (!idDocente) {
      this.errorMsg = 'No se encontró el id del docente en la sesión actual.';
      return;
    }

    this.creando = true;
    this.errorMsg = null;

    const dto: CreateInformeFinalDto = {
      id_docente: idDocente,
      id_periodo: this.formCreacion.value.id_periodo,
      id_asignatura: this.formCreacion.value.id_asignatura,
      id_paralelo: this.formCreacion.value.id_paralelo,
      horario: this.formCreacion.value.horario,
    };

    this.service.createInformeFinal(dto).subscribe({
      next: () => {
        this.creando = false;
        this.cargarInforme();
      },
      error: () => {
        this.creando = false;
        this.errorMsg = 'No se pudo crear el informe final en el servidor.';
      },
    });
  }

  agregarEstudiante(): void {
    const nuevo: EstudianteNotaLocal = {
      id: crypto.randomUUID(),
      cedula: '',
      nombresApellidos: '',
      asistencia: null,
      p1: null,
      p2: null,
      rc: null,
      nf: null,
      evaluacion: '',
      promocion: '',
    };
    this.local.estudiantes = [...this.local.estudiantes, nuevo];
    this.guardarLocal();
  }

  quitarEstudiante(id: string): void {
    this.local.estudiantes = this.local.estudiantes.filter((e) => e.id !== id);
    this.guardarLocal();
  }

  guardarLocal(): void {
    localStorage.setItem(this.claveLocal(), JSON.stringify(this.local));
    this.okMsg = 'Cambios guardados en este navegador.';
  }

  private claveLocal(): string {
    return `informe-final-local-${this.idOfertaAsignatura}`;
  }

  private leerLocal(): InformeFinalCamposLocales {
    const raw = localStorage.getItem(this.claveLocal());
    if (!raw) return this.localVacio();
    try {
      return JSON.parse(raw) as InformeFinalCamposLocales;
    } catch {
      return this.localVacio();
    }
  }

  private localVacio(): InformeFinalCamposLocales {
    return {
      antecedentes: '',
      desarrolloActividades: '',
      cualitativoInfraestructuraResultado: '',
      cualitativoInfraestructuraRecomendacion: '',
      cualitativoPlanEstudiosResultado: '',
      cualitativoPlanEstudiosRecomendacion: '',
      recomendacionesFinales: '',
      estudiantes: [],
    };
  }
}
