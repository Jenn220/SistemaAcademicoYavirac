import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-document-header',
  standalone: true,
  imports: [],
  templateUrl: './document-header.html',
  styleUrl: './document-header.scss'
})
export class DocumentHeader {

  @Input() titulo = '';
  @Input() codigo = '';

  @Input() mostrarDatos = true;

  @Input() estudianteNombre = '';
  @Input() estudianteCedula = '';
  @Input() carrera = '';
  @Input() nivel = '';
  @Input() periodo = '';
  @Input() nucleo = '';
  @Input() tutorAcademico = '';
  @Input() coordinador = '';
  @Input() empresa = '';
  @Input() tutorEmpresarial = '';
  @Input() proyecto = '';
  @Input() cobertura = '';
  @Input() plazo = '';
  @Input() fechaInicio = '';
  @Input() fechaFin = '';
  @Input() telefonoEmergenciaNombre = '';
  @Input() telefonoEmergenciaTelefono = '';

}
