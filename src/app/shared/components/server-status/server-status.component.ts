import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ServerStatus {
  online: boolean;
  motd?: string;
  players?: {
    online: number;
    max: number;
  };
  version?: string;
  ping?: number;
  favicon?: string;
}

@Component({
  selector: 'app-server-status',
  imports: [CommonModule],
  templateUrl: './server-status.component.html'
})
export class ServerStatusComponent {
  status = input.required<ServerStatus>();
  isLoading = input.required<boolean>();
}
