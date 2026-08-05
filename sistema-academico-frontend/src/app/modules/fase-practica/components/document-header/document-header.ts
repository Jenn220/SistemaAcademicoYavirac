import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-document-header',
  standalone: true,
  imports: [CommonModule],
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
  @Input() direccionEmpresa = '';
  @Input() tutorEmpresarial = '';
  @Input() proyecto = '';
  @Input() cobertura = '';
  @Input() plazo = '';
  @Input() fechaInicio = '';
  @Input() fechaFin = '';
  @Input() telefonoEmergenciaNombre = '';
  @Input() telefonoEmergenciaTelefono = '';

}
