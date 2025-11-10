import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ClassicGameMode {
  title: string;
  description: string;
  imageUrl: string;
  borderColor: 'blue' | 'green' | 'red' | 'yellow';
  playerCount?: string;
}

@Component({
  selector: 'app-classic-game-modes',
  imports: [CommonModule],
  template: `
    <!-- Classic Minecraft 1.8 Section -->
    <div class="bg-gray-900 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="text-center mb-12 px-2">
          <div class="inline-block mb-4 w-full max-w-3xl">
            <div class="bg-gradient-to-r from-red-900 to-orange-900 px-3 sm:px-6 py-4 rounded-lg border-2 sm:border-4 border-red-700">
              <div class="flex items-center justify-center space-x-2 sm:space-x-3 mb-3">
                <span class="text-2xl sm:text-3xl md:text-4xl">⚔️</span>
                <h2 class="font-minecraft text-lg sm:text-2xl md:text-3xl lg:text-4xl text-white text-center leading-tight">
                  TROPICALIA CLÁSSICO
                </h2>
              </div>

              <!-- IP and Port Section -->
              <div class="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                <div class="flex items-center space-x-2 w-full sm:w-auto justify-center">
                  <span class="font-minecraft-sign text-red-200 text-xs">IP:</span>
                  <button
                    (click)="copyClassicIP.emit()"
                    class="bg-black/40 hover:bg-black/60 transition-colors px-2 sm:px-3 py-1 rounded border border-red-600 sm:border-2 cursor-pointer flex-1 sm:flex-none"
                    title="Clique para copiar"
                  >
                    <span class="font-minecraft-sign text-white text-xs sm:text-sm break-all">classic.tropicaliacraft.online</span>
                  </button>
                </div>
                <div class="flex items-center space-x-2 w-full sm:w-auto justify-center">
                  <span class="font-minecraft-sign text-red-200 text-xs">PORTA:</span>
                  <button
                    (click)="copyClassicPort.emit()"
                    class="bg-black/40 hover:bg-black/60 transition-colors px-2 sm:px-3 py-1 rounded border border-red-600 sm:border-2 cursor-pointer"
                    title="Clique para copiar"
                  >
                    <span class="font-minecraft-sign text-white text-xs sm:text-sm">25755</span>
                  </button>
                </div>
              </div>

              <p class="font-minecraft-sign text-red-300 text-xs mt-2">Minecraft 1.8</p>
            </div>
          </div>
          <p class="text-gray-400 font-minecraft-sign text-sm sm:text-base md:text-lg max-w-3xl mx-auto px-2">
           SEM COOLDOWN - O clássico Minecraft PVP competitivo!
          </p>
        </div>

        <!-- Game Modes Grid -->
        <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          @for (gameMode of gameModes(); track gameMode.title) {
          <div
            class="minecraft-image-card group cursor-pointer flex flex-col h-full"
            [ngClass]="{
              'border-blue-500': gameMode.borderColor === 'blue',
              'border-green-500': gameMode.borderColor === 'green',
              'border-red-500': gameMode.borderColor === 'red',
              'border-yellow-500': gameMode.borderColor === 'yellow'
            }"
          >
            <!-- Image Container - Fixed Height -->
            <div class="aspect-square overflow-hidden bg-gray-800 relative flex-shrink-0">
              <img
                [src]="gameMode.imageUrl"
                [alt]="gameMode.title"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <!-- Version Badge -->
              <div class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded border-2 border-red-800 font-minecraft-sign text-xs">
                v1.8
              </div>
              <!-- Player Count - Dynamic -->
              <div class="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded border-2 border-gray-600 font-minecraft-sign text-xs flex items-center space-x-1">
                @if (isLoadingPlayerCounts()) {
                <div class="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                } @else {
                <span class="text-green-400">●</span>
                <span>{{ gameMode.playerCount }}</span>
                }
              </div>
            </div>

            <!-- Text Container - Absolute Fixed Height for Perfect Alignment -->
            <div
              class="bg-black/90 px-3 text-center border-t-4 flex flex-col"
              style="height: 110px;"
              [ngClass]="{
                'border-blue-500': gameMode.borderColor === 'blue',
                'border-green-500': gameMode.borderColor === 'green',
                'border-red-500': gameMode.borderColor === 'red',
                'border-yellow-500': gameMode.borderColor === 'yellow'
              }"
            >
              <!-- Title - Fixed Height with exact spacing -->
              <div class="pt-4 pb-2" style="height: 52px; display: flex; align-items: center; justify-content: center;">
                <span class="text-white font-bold font-minecraft text-lg leading-none">
                  {{ gameMode.title }}
                </span>
              </div>

              <!-- Description - Fixed Height with exact spacing -->
              <div class="pb-4" style="height: 58px; display: flex; align-items: center; justify-content: center;">
                <p class="text-gray-300 font-minecraft-sign text-xs leading-tight px-1">
                  {{ gameMode.description }}
                </p>
              </div>
            </div>
          </div>
          }
        </div>

        <!-- Classic Play Buttons Section -->
        <div class="mt-12 space-y-6">
          <!-- Main Play Button -->
          <div class="flex justify-center">
            <button
              (click)="launchClassicGame.emit()"
              class="minecraft-ui-button px-8 sm:px-12 py-4 text-lg sm:text-xl"
            >
              JOGAR AGORA
            </button>
          </div>

          <!-- Online Play Info Section -->
          <div class="text-center">
            <div class="inline-block bg-gray-800 border-4 border-gray-700 px-8 py-6 rounded-lg max-w-3xl">
              <h3 class="font-minecraft text-yellow-400 text-xl mb-4">🌐 JOGAR MINECRAFT 1.8 ONLINE</h3>
              <p class="text-gray-300 font-minecraft-sign text-sm mb-4 leading-relaxed">
                Jogue Tropicalia Clássico 1.8 agora mesmo no seu navegador com nosso cliente Eaglercraft!<br/>
                Sem downloads - 100% online e gratuito.
              </p>
              <div class="flex justify-center">
                <button
                  (click)="playClassicOnline.emit()"
                  class="minecraft-ui-button px-8 py-3 text-base sm:text-lg bg-purple-600 hover:bg-purple-700 border-purple-800"
                >
                  🌐 TESTAR ONLINE NO NAVEGADOR
                </button>
              </div>
              <p class="text-gray-500 font-minecraft-sign text-xs mt-3">
                "Jogar Agora" abre nosso launcher • "Testar Online" joga direto no navegador
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClassicGameModesComponent {
  gameModes = input.required<ClassicGameMode[]>();
  isLoadingPlayerCounts = input<boolean>(false);
  
  copyClassicIP = output<void>();
  copyClassicPort = output<void>();
  launchClassicGame = output<void>();
  playClassicOnline = output<void>();
}
