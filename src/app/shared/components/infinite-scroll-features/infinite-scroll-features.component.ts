import { Component, input, signal, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ServerFeature {
  emoji: string;
  text: string;
}

@Component({
  selector: 'app-infinite-scroll-features',
  imports: [CommonModule],
  templateUrl: './infinite-scroll-features.component.html'
})
export class InfiniteScrollFeaturesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef<HTMLDivElement>;

  features = input.required<ServerFeature[]>();

  displayFeatures = signal<ServerFeature[]>([]);
  isDragging = signal(false);
  startX = signal(0);
  scrollLeft = signal(0);
  isPaused = signal(false);

  private scrollAnimationId?: number;
  private scrollSpeed = 1;

  ngOnInit(): void {
    // Create 3 sets for infinite scroll
    const original = this.features();
    this.displayFeatures.set([...original, ...original, ...original]);
  }

  ngAfterViewInit(): void {
    // Start auto-scroll animation
    this.startAutoScroll();
  }

  ngOnDestroy(): void {
    if (this.scrollAnimationId) {
      cancelAnimationFrame(this.scrollAnimationId);
    }
  }

  private startAutoScroll(): void {
    const scroll = () => {
      if (!this.isDragging() && !this.isPaused() && this.scrollContainer) {
        const container = this.scrollContainer.nativeElement;
        container.scrollLeft += this.scrollSpeed;

        // Reset scroll position for infinite effect
        const maxScroll = container.scrollWidth / 3;
        if (container.scrollLeft >= maxScroll * 2) {
          container.scrollLeft = maxScroll;
        }
      }
      this.scrollAnimationId = requestAnimationFrame(scroll);
    };
    this.scrollAnimationId = requestAnimationFrame(scroll);
  }

  onMouseDown(e: MouseEvent): void {
    this.isDragging.set(true);
    this.startX.set(e.pageX - this.scrollContainer.nativeElement.offsetLeft);
    this.scrollLeft.set(this.scrollContainer.nativeElement.scrollLeft);
  }

  onMouseLeave(): void {
    this.isDragging.set(false);
  }

  onMouseUp(): void {
    this.isDragging.set(false);
  }

  onMouseMove(e: MouseEvent): void {
    if (!this.isDragging()) return;
    e.preventDefault();
    const x = e.pageX - this.scrollContainer.nativeElement.offsetLeft;
    const walk = (x - this.startX()) * 2;
    this.scrollContainer.nativeElement.scrollLeft = this.scrollLeft() - walk;
  }

  onMouseEnter(): void {
    this.isPaused.set(true);
  }

  onMouseLeaveContainer(): void {
    this.isPaused.set(false);
  }
}
