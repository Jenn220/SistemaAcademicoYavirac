import { Component, input } from '@angular/core';

@Component({
  selector: 'app-document-header',
  standalone: true,
  imports: [],
  templateUrl: './document-header.html',
  styleUrl: './document-header.scss'
})
export class DocumentHeader {

  titulo = input('');

  codigo = input('');

}