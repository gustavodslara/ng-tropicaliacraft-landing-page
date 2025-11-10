import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navigation',
  imports: [CommonModule, RouterLink],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  mobileMenuOpen = signal(false);

  // Output events for parent component to handle
  scrollToTopClicked = output<void>();
  downloadsClicked = output<void>();
  vipClicked = output<void>();

  toggleMobileMenu() {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  scrollToTop() {
    this.scrollToTopClicked.emit();
  }

  openDownloadsModal() {
    this.downloadsClicked.emit();
    this.closeMobileMenu();
  }

  openVipModal() {
    this.vipClicked.emit();
    this.closeMobileMenu();
  }
}
