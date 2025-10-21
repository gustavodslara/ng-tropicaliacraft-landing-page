import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-server-ip-section',
  imports: [CommonModule],
  templateUrl: './server-ip-section.component.html'
})
export class ServerIpSectionComponent {
  ip = input.required<string>();
  port = input.required<string>();
  ipCopied = output<void>();
  portCopied = output<void>();

  copyIp(): void {
    navigator.clipboard.writeText(this.ip());
    this.ipCopied.emit();
  }

  copyPort(): void {
    navigator.clipboard.writeText(this.port());
    this.portCopied.emit();
  }
}
