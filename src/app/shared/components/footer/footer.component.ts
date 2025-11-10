import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  template: `
    <footer class="bg-gray-950 border-t-4 border-gray-800 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-gray-500 font-minecraft">
          Movido por
          <a 
            href="https://www.minecraft.net/pt-BR" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="text-white hover:text-green-400 transition-colors">
            MINECRAFT
          </a>
        </p>
        <p class="text-gray-600 text-sm mt-2">
          Construído pela 
          <a 
            href="https://unrender.dev" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="text-purple-400 hover:text-purple-300 transition-colors">
            Unrender.dev
          </a> 
          usando Angular 20 Zoneless + Signals + Tailwind CSS v3
        </p>
      </div>
    </footer>
  `
})
export class FooterComponent {}
