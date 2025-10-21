import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-map',
  imports: [CommonModule],
  template: `
    <div class="mt-12">
      <h2 class="font-minecraft text-3xl md:text-4xl text-white text-center mb-2">MAPA AO VIVO</h2>
      <p class="text-center text-gray-400 font-minecraft-sign text-sm mb-6">
        Explore o mundo em tempo real
      </p>

      @if (mapUrl()) {
        <div class="minecraft-card overflow-hidden" style="height: 600px">
          @if (!mapLoaded()) {
            <div class="flex items-center justify-center h-full bg-gray-800">
              <div class="text-center">
                <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-green-500 mb-4"></div>
                <p class="text-white font-minecraft-sign">Carregando mapa de {{ serverName() }}...</p>
              </div>
            </div>
          }
          <iframe
            [src]="mapUrl()!"
            class="w-full h-full border-0"
            [class.hidden]="!mapLoaded()"
            title="Mapa ao vivo do servidor {{ serverName() }}"
            allowfullscreen>
          </iframe>
        </div>
      } @else {
        <div class="minecraft-card p-12 text-center">
          <div class="text-6xl mb-4">🗺️</div>
          <p class="text-white font-minecraft-sign text-lg mb-2">Mapa indisponível</p>
          <p class="text-gray-400 font-minecraft-sign text-sm">
            O servidor {{ serverName() }} está offline ou o mapa não está configurado
          </p>
        </div>
      }
    </div>
  `
})
export class LiveMapComponent {
  mapUrl = input.required<string | null>();
  serverName = input.required<string>();
  mapLoaded = input.required<boolean>();
}
