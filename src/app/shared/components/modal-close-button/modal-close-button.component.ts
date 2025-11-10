import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-close-button',
  imports: [CommonModule],
  template: `
    <button
      (click)="closed.emit()"
      class="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-red-500 transition-colors z-10 minecraft-close-button"
      aria-label="Close modal"
    >
      <svg class="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="4">
        <path stroke-linecap="square" stroke-linejoin="miter" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  `,
  styles: [`
    /* Minecraft Close Button - Pixelated X */
    .minecraft-close-button {
      background: linear-gradient(to bottom, #DC2626 0%, #991B1B 100%);
      border: none;
      box-shadow:
        inset 0 2px 0 0 #F87171,      // Top highlight
        inset 2px 0 0 0 #F87171,       // Left highlight
        inset -2px 0 0 0 #7F1D1D,      // Right shadow
        inset 0 -2px 0 0 #7F1D1D,      // Bottom shadow
        0 0 0 2px #000000,              // Outer border
        0 4px 8px rgba(0, 0, 0, 0.5);  // Drop shadow
      padding: 0.5rem;
      image-rendering: pixelated;
      border-radius: 0; // Square button
      transition: all 0.1s ease;

      &:hover {
        background: linear-gradient(to bottom, #EF4444 0%, #DC2626 100%);
        box-shadow:
          inset 0 2px 0 0 #FCA5A5,
          inset 2px 0 0 0 #FCA5A5,
          inset -2px 0 0 0 #991B1B,
          inset 0 -2px 0 0 #991B1B,
          0 0 0 2px #000000,
          0 6px 12px rgba(0, 0, 0, 0.6);
        transform: translateY(-1px);
      }

      &:active {
        background: linear-gradient(to bottom, #991B1B 0%, #7F1D1D 100%);
        box-shadow:
          inset 0 2px 0 0 #7F1D1D,
          inset 2px 0 0 0 #7F1D1D,
          inset -2px 0 0 0 #F87171,
          inset 0 -2px 0 0 #F87171,
          0 0 0 2px #000000;
        transform: translateY(1px);
      }
    }
  `]
})
export class ModalCloseButtonComponent {
  closed = output<void>();
}
