import { Component, input, OnDestroy, ViewChild, ElementRef, AfterViewInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FeatureCard } from '../feature-cards/feature-cards.component';

interface DisplayedFeature extends FeatureCard {
  id: string;
}

@Component({
  selector: 'app-infinite-scroll-server-features',
  imports: [CommonModule, RouterLink],
  templateUrl: './infinite-scroll-server-features.component.html',
  styleUrl: './infinite-scroll-server-features.component.scss'
})
export class InfiniteScrollServerFeaturesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer', { static: false }) scrollContainerRef?: ElementRef<HTMLElement>;

  features = input.required<FeatureCard[]>();
  
  // Displayed features - will be dynamically reordered
  displayedFeatures = signal<DisplayedFeature[]>([]);

  private animationId?: number;
  private isUserHovering = false;
  private scrollAccumulator = 0;
  private isTouchScrolling = false;
  private lastScrollLeft = 0;
  private scrollCheckInterval?: number;

  constructor() {
    // Initialize displayed features when input changes
    effect(() => {
      const inputFeatures = this.features();
      if (inputFeatures && inputFeatures.length > 0) {
        // Create initial display with enough copies to fill screen + buffer
        const initialDisplay: DisplayedFeature[] = [];
        // Duplicate features 4 times to ensure smooth scrolling
        for (let i = 0; i < 4; i++) {
          inputFeatures.forEach((feature, idx) => {
            const displayFeature: DisplayedFeature = {
              title: feature.title,
              description: feature.description,
              image: feature.image,
              route: feature.route,
              color: feature.color,
              id: `${feature.title}_${i}_${idx}`
            };
            initialDisplay.push(displayFeature);
          });
        }
        this.displayedFeatures.set(initialDisplay);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      console.log('🔄 Starting server features infinite scroll...');
      this.startScroll();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.scrollCheckInterval) {
      clearInterval(this.scrollCheckInterval);
    }
  }

  private startScroll(): void {
    if (!this.scrollContainerRef) {
      console.log('❌ Scroll container not found');
      return;
    }

    if (this.isUserHovering || this.isTouchScrolling) return;

    const container = this.scrollContainerRef.nativeElement;
    const isMobile = window.innerWidth < 768;
    const scrollSpeed = isMobile ? 2.5 : 0.8; // Faster for mobile

    console.log('🚀 Server features scroll started - Speed:', scrollSpeed, 'px/frame');

    const animate = () => {
      if (!this.scrollContainerRef || this.isUserHovering || this.isTouchScrolling) return;

      const container = this.scrollContainerRef.nativeElement;
      
      // Accumulate fractional scroll values
      this.scrollAccumulator += scrollSpeed;

      // Only apply scroll when we've accumulated at least 1 pixel
      if (this.scrollAccumulator >= 1) {
        const pixelsToScroll = Math.floor(this.scrollAccumulator);
        container.scrollLeft += pixelsToScroll;
        this.scrollAccumulator -= pixelsToScroll;
      }

      // Check if items need to be repositioned
      this.repositionItems();

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  private repositionItems(): void {
    if (!this.scrollContainerRef) return;
    
    // Don't reposition during user interaction
    if (this.isUserHovering || this.isTouchScrolling) return;

    const container = this.scrollContainerRef.nativeElement;
    const children = Array.from(container.children) as HTMLElement[];
    
    if (children.length === 0) return;
    
    // Find items that have scrolled completely out of view on the left
    children.forEach((child, index) => {
      const rect = child.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // If item has completely scrolled past the left edge
      if (rect.right < containerRect.left - 100) {
        // Move this item to the end
        const currentFeatures = this.displayedFeatures();
        const movedFeature = currentFeatures[index];
        
        if (movedFeature) {
          // Remove from current position and add to end
          const newFeature: DisplayedFeature = {
            title: movedFeature.title,
            description: movedFeature.description,
            image: movedFeature.image,
            route: movedFeature.route,
            color: movedFeature.color,
            id: `${movedFeature.title}_${Date.now()}_${Math.random()}`
          };
          
          const newFeatures = [
            ...currentFeatures.slice(0, index),
            ...currentFeatures.slice(index + 1),
            newFeature
          ];
          
          // Calculate how much we need to adjust scroll to prevent jump
          const itemWidth = child.offsetWidth;
          const gap = 32; // 2rem gap from CSS
          
          this.displayedFeatures.set(newFeatures);
          
          // Adjust scroll position to compensate for DOM reordering
          requestAnimationFrame(() => {
            if (this.scrollContainerRef) {
              this.scrollContainerRef.nativeElement.scrollLeft -= (itemWidth + gap);
            }
          });
        }
      }
    });
  }

  private stopScroll(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
    this.scrollAccumulator = 0;
  }

  onMouseEnter(): void {
    this.isUserHovering = true;
    this.stopScroll();
  }

  onMouseLeave(): void {
    this.isUserHovering = false;
    this.scrollAccumulator = 0;
    setTimeout(() => {
      this.startScroll();
    }, 500);
  }

  onTouchStart(): void {
    this.isTouchScrolling = true;
    this.stopScroll();
    
    if (!this.scrollContainerRef) return;
    
    const container = this.scrollContainerRef.nativeElement;
    this.lastScrollLeft = container.scrollLeft;
    
    // Start monitoring for manual scroll
    this.scrollCheckInterval = window.setInterval(() => {
      if (!this.scrollContainerRef) return;
      
      const currentScrollLeft = this.scrollContainerRef.nativeElement.scrollLeft;
      
      // If scroll position hasn't changed, user stopped scrolling
      if (Math.abs(currentScrollLeft - this.lastScrollLeft) < 1) {
        this.onTouchEnd();
      }
      
      this.lastScrollLeft = currentScrollLeft;
    }, 150);
  }

  onTouchEnd(): void {
    if (this.scrollCheckInterval) {
      clearInterval(this.scrollCheckInterval);
      this.scrollCheckInterval = undefined;
    }
    
    this.isTouchScrolling = false;
    this.scrollAccumulator = 0;
    
    // Resume auto-scroll after a delay
    setTimeout(() => {
      if (!this.isTouchScrolling) {
        this.startScroll();
      }
    }, 1000);
  }
}
