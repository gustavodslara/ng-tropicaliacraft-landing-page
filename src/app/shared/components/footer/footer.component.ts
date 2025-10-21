import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  template: `
    <footer class="bg-gray-950 border-t-4 border-gray-800 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-gray-500 font-minecraft">Powered by <span class="text-white">MINECRAFT</span></p>
        <p class="text-gray-600 text-sm mt-2">
          Built with ❤️ using Angular 20 Zoneless + Signals + Tailwind CSS v3
        </p>
      </div>
    </footer>
  `
})
export class FooterComponent {}
