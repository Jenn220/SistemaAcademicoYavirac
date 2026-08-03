import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, throwError } from 'rxjs';
import { catchError, switchMap, timeout } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { Documentos } from '../../services/documentos';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-datos-maestra',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './datos-maestra.html',
  styleUrl: './datos-maestra.scss'
})
export class DatosMaestraPage implements OnInit {
  private documentos = inject(Documentos);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);

  guardando = false;
  cargando = true;
  esEstudiante = false;

  datos = {
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    estado_civil: '',
    tipo_sangre: '',
    domicilio: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    carrera: '',
    nivel: '',
    periodo: '',
    nucleo: '',
    tutor_academico: '',
    coordinador: '',
    empresa: '',
    tutor_empresarial: '',
    proyecto: '',
    cobertura: '',
    plazo: '',
    fecha_inicio: '',
    fecha_fin: '',
  };

  readonly camposEditables: Record<string, string> = {
    telefono: 'Teléfono',
    correo: 'Correo electrónico',
    estado_civil: 'Estado civil',
    tipo_sangre: 'Tipo de sangre',
    domicilio: 'Domicilio',
    contacto_emergencia_nombre: 'Contacto emergencia (nombre)',
    contacto_emergencia_telefono: 'Contacto emergencia (teléfono)',
  };

  ngOnInit(): void {
    const usuario = this.auth.usuario();
    this.esEstudiante = usuario?.roles?.includes('ESTUDIANTE') ?? false;
    this.cargarDatos();
  }

  private cargarDatos(): void {
    console.log('DatosMaestra: iniciando cargarDatos, esEstudiante=', this.esEstudiante);
    this.cargando = true;

    if (this.esEstudiante) {
      console.log('DatosMaestra: llamando a obtenerMiPractica');
      this.documentos.obtenerMiPractica().pipe(
        timeout(10000),
        catchError((err) => {
          console.error('Error obteniendo mi práctica:', err);
          this.cargando = false;
          Swal.fire('Error', 'No fue posible cargar tu práctica. Verifica que tengas una práctica asignada.', 'error');
          return throwError(() => err);
        }),
        switchMap((practica) => {
          console.log('DatosMaestra: mi-practica respuesta', practica);
          if (!practica?.id_practica) {
            this.cargando = false;
            Swal.fire('Error', 'No tienes una práctica asignada.', 'error');
            return throwError(() => new Error('Sin práctica'));
          }
          console.log('DatosMaestra: llamando a obtenerDatosMaestra con id_practica=', practica.id_practica);
          return this.documentos.obtenerDatosMaestra(practica.id_practica).pipe(
            timeout(10000),
            catchError((err) => {
              console.error('Error obteniendo datos maestra:', err);
              this.cargando = false;
              Swal.fire('Error', 'No fue posible cargar los datos de la práctica.', 'error');
              return throwError(() => err);
            })
          );
        })
      ).subscribe({
        next: (datos: any) => {
          console.log('DatosMaestra: datos recibidos', datos);
          this.procesarDatos(datos);
        },
        error: (err) => {
          console.error('DatosMaestra: error en el flujo completo', err);
          this.cargando = false;
        }
      });
    } else {
      const idPracticaRuta = Number(this.route.snapshot.paramMap.get('idPractica')) || undefined;
      console.log('DatosMaestra: no es estudiante, idPracticaRuta=', idPracticaRuta);
      this.documentos.obtenerDatosMaestra(idPracticaRuta).pipe(
        timeout(10000),
        catchError((err) => {
          console.error('Error obteniendo datos maestra:', err);
          this.cargando = false;
          Swal.fire('Error', 'No fue posible cargar los datos.', 'error');
          return throwError(() => err);
        })
      ).subscribe({
        next: (datos: any) => {
          console.log('DatosMaestra: datos recibidos (no estudiante)', datos);
          this.procesarDatos(datos);
        },
        error: (err) => {
          console.error('DatosMaestra: error en el flujo completo (no estudiante)', err);
          this.cargando = false;
        }
      });
    }
  }

  private procesarDatos(datos: any): void {
    const estudiante = datos?.estudiante ?? {};
    const carrera = datos?.carrera ?? {};
    const proyecto = datos?.proyectoEmpresarial ?? {};
    const empresa = datos?.empresaBeneficiaria ?? {};
    const periodo = datos?.periodoAcademico ?? {};

    this.datos = {
      nombre: estudiante.nombre ?? '',
      cedula: estudiante.cedula ?? '',
      telefono: estudiante.telefono ?? '',
      correo: estudiante.correo ?? estudiante.email ?? '',
      estado_civil: estudiante.estadoCivil ?? '',
      tipo_sangre: estudiante.tipoSangre ?? '',
      domicilio: estudiante.domicilio ?? '',
      contacto_emergencia_nombre: estudiante.contactoEmergenciaNombre ?? '',
      contacto_emergencia_telefono: estudiante.contactoEmergenciaTelefono ?? '',
      carrera: estudiante.carrera ?? '',
      nivel: estudiante.nivel ?? estudiante.curso ?? '',
      periodo: periodo.nombre ?? '',
      nucleo: carrera.nucleoEstructurante ?? '',
      tutor_academico: carrera.tutorAcademico ?? '',
      coordinador: carrera.coordinador ?? '',
      empresa: empresa.razonSocial ?? proyecto.empresaAsignada ?? '',
      tutor_empresarial: empresa.tutorEmpresarial ?? '',
      proyecto: proyecto.nombre ?? '',
      cobertura: proyecto.cobertura ?? '',
      plazo: proyecto.plazo ?? '',
      fecha_inicio: proyecto.fechaInicio ?? '',
      fecha_fin: proyecto.fechaFin ?? '',
    };
    this.cargando = false;
    this.cdr.detectChanges();
  }

  guardar(): void {
    if (!this.esEstudiante) return;
    this.guardando = true;

    this.documentos.actualizarDatosEstudiante(this.datos).subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire({
          icon: 'success',
          title: 'Datos actualizados',
          text: 'Sus datos personales se actualizaron correctamente.',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: () => {
        this.guardando = false;
        Swal.fire('Error', 'No fue posible actualizar los datos.', 'error');
      }
    });
  }

  volver(): void {
    this.router.navigate(['/']);
  }
}
