import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-server-action-buttons',
  imports: [CommonModule],
  template: `
    <div class="mt-8 space-y-4">
      <!-- Main Play Button - Always visible -->
      <div class="flex justify-center">
        <button
          (click)="onLaunchGame()"
          class="minecraft-ui-button px-8 sm:px-12 py-4 text-lg sm:text-xl"
        >
          JOGAR AGORA
        </button>
      </div>

      <!-- Online Test Button - Conditional -->
      @if (hasOnlineTest()) {
      <div class="flex justify-center">
        <button
          (click)="onTestOnline()"
          class="minecraft-ui-button px-8 sm:px-12 py-4 text-base sm:text-lg">
          🟢 TESTAR ONLINE AGORA!
        </button>
      </div>
      }
    </div>
  `
})
export class ServerActionButtonsComponent {
  protocolUrl = input.required<string>();
  hasOnlineTest = input<boolean>(false);

  launchGame = output<string>();
  testOnline = output<void>();

  onLaunchGame(): void {
    this.launchGame.emit(this.protocolUrl());
  }

  onTestOnline(): void {
    this.testOnline.emit();
  }
}
