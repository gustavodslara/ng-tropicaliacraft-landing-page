import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface FeatureCard {
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-feature-cards',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-gray-900 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (feature of features(); track feature.title) {
          <div
            class="minecraft-card cursor-pointer transform hover:scale-105 transition-all duration-300"
            [routerLink]="[feature.route]"
            [ngClass]="{
              'border-green-500': feature.color === 'green',
              'border-orange-500': feature.color === 'orange',
              'border-blue-500': feature.color === 'blue'
            }"
          >
            <div class="aspect-square minecraft-dirt-bg flex items-center justify-center text-8xl">
              {{ feature.icon }}
            </div>
            <div class="p-6 text-center bg-gray-800">
              <h3 class="text-xl font-bold text-white mb-2 font-minecraft">
                {{ feature.title }}
              </h3>
              <p class="text-gray-400 font-minecraft-sign text-sm">
                {{ feature.description }}
              </p>
            </div>
          </div>
          }
        </div>
      </div>
    </div>
  `
})
export class FeatureCardsComponent {
  features = input.required<FeatureCard[]>();
}
