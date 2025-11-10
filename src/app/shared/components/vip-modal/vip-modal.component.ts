import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCloseButtonComponent } from '../modal-close-button/modal-close-button.component';

export interface VipTier {
  title: string;
  description: string;
  price: string;
}

@Component({
  selector: 'app-vip-modal',
  imports: [CommonModule, ModalCloseButtonComponent],
  templateUrl: './vip-modal.component.html',
  styleUrl: './vip-modal.component.scss'
})
export class VipModalComponent {
  visible = input.required<boolean>();
  tiers = input.required<VipTier[]>();

  closed = output<void>();

  closeModal() {
    this.closed.emit();
  }
}
