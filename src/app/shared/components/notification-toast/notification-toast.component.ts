import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-toast',
  imports: [CommonModule],
  template: `
    @if (visible()) {
    <div class="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        class="minecraft-notification bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl border-4 border-green-800 flex items-center space-x-3"
      >
        <svg class="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
        <span class="font-minecraft text-lg">{{ message() }}</span>
      </div>
    </div>
    }
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationToastComponent {
  visible = input.required<boolean>();
  message = input.required<string>();
}
