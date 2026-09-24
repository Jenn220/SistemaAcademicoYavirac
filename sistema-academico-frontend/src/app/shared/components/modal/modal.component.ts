import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() buttonText: string = 'Aceptar';
  @Input() showCloseButton: boolean = true;
  
  // ✅ PROPIEDAD AGREGADA - FIX DEL ERROR
  @Input() showConfirmButtons: boolean = false;
  
  // ✅ NUEVOS OUTPUTS PARA CONFIRMAR/CANCELAR
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  get icon(): string {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[this.type] || 'ℹ️';
  }

  get headerClass(): string {
    return `modal-header modal-header-${this.type}`;
  }

  close(): void {
    this.onClose.emit();
  }

  confirm(): void {
    this.onConfirm.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }
}