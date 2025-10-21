import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navigation',
  imports: [CommonModule, RouterLink],
  templateUrl: './navigation.component.html',
  styles: []
})
export class NavigationComponent {
  mobileMenuOpen = signal(false);

  vipClicked = output<void>();

  toggleMobileMenu() {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  openVipModal() {
    this.vipClicked.emit();
    this.closeMobileMenu();
  }
}
