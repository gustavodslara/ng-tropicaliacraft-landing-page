import { Component, input, OnDestroy, ViewChild, ElementRef, AfterViewInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface ServerFeature {
  image: string;
  label: string;
  route?: string; // Internal Angular route (e.g., '/products')
  href?: string; // External link (e.g., 'https://ecraft.tropicaliacraft.online')
  target?: '_blank' | '_self'; // Target for href links
}

interface DisplayedFeature extends ServerFeature {
  id: string;
}

@Component({
  selector: 'app-infinite-scroll-features',
  imports: [CommonModule, RouterLink],
  templateUrl: './infinite-scroll-features.component.html',
  styleUrl: './infinite-scroll-features.component.scss'
})
export class InfiniteScrollFeaturesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('serverFeaturesScroll', { static: false }) serverFeaturesScrollRef?: ElementRef<HTMLElement>;

  features = input.required<ServerFeature[]>();
  
  // Displayed features - will be dynamically reordered
  displayedFeatures = signal<DisplayedFeature[]>([]);

  private serverFeaturesAnimationId?: number;
  private isUserScrolling = false;
  private scrollResumeTimeout?: any;
  private serverFeaturesScrollAccumulator = 0;
  private lastScrollLeft = 0;
  private isTouchScrolling = false;
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
              image: feature.image,
              label: feature.label,
              route: feature.route,
              href: feature.href,
              target: feature.target,
              id: `${feature.label}_${i}_${idx}`
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
      console.log('⏰ Starting infinite scroll with repositioning...');
      this.startServerFeaturesScroll();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.serverFeaturesAnimationId) {
      cancelAnimationFrame(this.serverFeaturesAnimationId);
    }
    if (this.scrollResumeTimeout) {
      clearTimeout(this.scrollResumeTimeout);
    }
    if (this.scrollCheckInterval) {
      clearInterval(this.scrollCheckInterval);
    }
  }

  private startServerFeaturesScroll(): void {
    if (!this.serverFeaturesScrollRef) {
      console.log('❌ Server features scroll - ViewChild not found');
      return;
    }

    if (this.isUserScrolling || this.isTouchScrolling) return;

    const container = this.serverFeaturesScrollRef.nativeElement;
    const isMobile = window.innerWidth < 768;
    const scrollSpeed = isMobile ? 2.0 : 0.5; // Much faster for mobile

    console.log('🔄 Starting true infinite scroll - Speed:', scrollSpeed, 'px/frame');

    const animate = () => {
      if (!this.serverFeaturesScrollRef || this.isUserScrolling || this.isTouchScrolling) return;

      const container = this.serverFeaturesScrollRef.nativeElement;
      
      // Accumulate fractional scroll values
      this.serverFeaturesScrollAccumulator += scrollSpeed;

      // Only apply scroll when we've accumulated at least 1 pixel
      if (this.serverFeaturesScrollAccumulator >= 1) {
        const pixelsToScroll = Math.floor(this.serverFeaturesScrollAccumulator);
        container.scrollLeft += pixelsToScroll;
        this.serverFeaturesScrollAccumulator -= pixelsToScroll;
      }

      // Check if items need to be repositioned
      this.repositionItems();

      this.serverFeaturesAnimationId = requestAnimationFrame(animate);
    };

    this.serverFeaturesAnimationId = requestAnimationFrame(animate);
  }

  private repositionItems(): void {
    if (!this.serverFeaturesScrollRef) return;
    
    // Don't reposition during user interaction
    if (this.isUserScrolling || this.isTouchScrolling) return;

    const container = this.serverFeaturesScrollRef.nativeElement;
    const children = Array.from(container.children) as HTMLElement[];
    
    if (children.length === 0) return;

    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    
    // Find items that have scrolled completely out of view on the left
    children.forEach((child, index) => {
      const rect = child.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      // If item has completely scrolled past the left edge
      if (rect.right < containerRect.left - 100) {
        // Get the last child's position
        const lastChild = children[children.length - 1];
        const lastChildRect = lastChild.getBoundingClientRect();
        
        // Move this item to the end
        const currentFeatures = this.displayedFeatures();
        const movedFeature = currentFeatures[index];
        
        if (movedFeature) {
          // Remove from current position and add to end
          const newFeature: DisplayedFeature = {
            image: movedFeature.image,
            label: movedFeature.label,
            route: movedFeature.route,
            href: movedFeature.href,
            target: movedFeature.target,
            id: `${movedFeature.label}_${Date.now()}_${Math.random()}`
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
          // We need to do this in the next frame after DOM updates
          requestAnimationFrame(() => {
            if (this.serverFeaturesScrollRef) {
              this.serverFeaturesScrollRef.nativeElement.scrollLeft -= (itemWidth + gap);
            }
          });
        }
      }
    });
  }

  private stopServerFeaturesScroll(): void {
    if (this.serverFeaturesAnimationId) {
      cancelAnimationFrame(this.serverFeaturesAnimationId);
      this.serverFeaturesAnimationId = undefined;
    }
    this.serverFeaturesScrollAccumulator = 0;
  }

  onTouchStart(): void {
    this.isTouchScrolling = true;
    this.stopServerFeaturesScroll();
    
    if (!this.serverFeaturesScrollRef) return;
    
    const container = this.serverFeaturesScrollRef.nativeElement;
    this.lastScrollLeft = container.scrollLeft;
    
    // Start monitoring for manual scroll
    this.scrollCheckInterval = window.setInterval(() => {
      if (!this.serverFeaturesScrollRef) return;
      
      const currentScrollLeft = this.serverFeaturesScrollRef.nativeElement.scrollLeft;
      
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
    this.serverFeaturesScrollAccumulator = 0;
    
    // Resume auto-scroll after a delay
    setTimeout(() => {
      if (!this.isTouchScrolling) {
        this.startServerFeaturesScroll();
      }
    }, 1000);
  }

  onMouseEnter(): void {
    this.isUserScrolling = true;
    this.stopServerFeaturesScroll();
  }

  onMouseLeave(): void {
    this.isUserScrolling = false;
    this.serverFeaturesScrollAccumulator = 0;
    setTimeout(() => {
      this.startServerFeaturesScroll();
    }, 500);
  }

}


