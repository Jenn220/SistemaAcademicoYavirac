import { Component, input } from '@angular/core';
import { CartaCompromiso } from '../../interfaces';

@Component({
  selector: 'app-student-presentation',
  standalone: true,
  imports: [],
  templateUrl: './student-presentation.html',
  styleUrl: './student-presentation.scss'
})
export class StudentPresentation {

  carta = input.required<CartaCompromiso>();

}