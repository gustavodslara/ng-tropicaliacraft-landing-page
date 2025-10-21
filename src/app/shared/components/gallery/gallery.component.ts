import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ServerImage {
  url: string;
  title: string;
  borderColor: string;
}

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.component.html'
})
export class GalleryComponent {
  images = input.required<ServerImage[]>();
}
