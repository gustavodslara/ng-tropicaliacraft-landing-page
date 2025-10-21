import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ServerInfo {
  name: string;
  image: string;
  ip: string;
  port: string;
  protocolUrl: string;
}

@Component({
  selector: 'app-server-tabs',
  imports: [CommonModule],
  templateUrl: './server-tabs.component.html'
})
export class ServerTabsComponent {
  servers = input.required<ServerInfo[]>();
  selectedIndex = input.required<number>();
  tabSelected = output<number>();

  selectTab(index: number): void {
    this.tabSelected.emit(index);
  }
}
