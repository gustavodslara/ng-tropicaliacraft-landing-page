import { Component, input, output, signal, effect, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCloseButtonComponent } from '../modal-close-button/modal-close-button.component';

export interface DownloadVersion {
  version: string;
  downloadUrl: string;
}

export interface ModInfo {
  name: string;
  icon: string; // Emoji or image URL
}

export interface DownloadItemInfo {
  title: string;
  description?: string;
  mods?: ModInfo[];
  features?: string[];
}

export interface DownloadItem {
  title: string;
  description: string;
  icon: string;
  downloadUrl: string;
  version?: string;
  platform: string;
  versions?: DownloadVersion[]; // Array of available versions
  info?: DownloadItemInfo; // Detailed information for the info modal
}

@Component({
  selector: 'app-downloads-modal',
  imports: [CommonModule, ModalCloseButtonComponent],
  templateUrl: './downloads-modal.component.html',
  styleUrl: './downloads-modal.component.scss'
})
export class DownloadsModalComponent implements AfterViewInit {
  visible = input.required<boolean>();
  downloads = input.required<DownloadItem[]>();
  focusTarget = input<'launcher' | 'modpack' | null>(null); // What to focus on when opened

  closed = output<void>();

  @ViewChild('modalContent') modalContent?: ElementRef<HTMLDivElement>;

  // Track which dropdown is open (by index)
  openDropdownIndex = signal<number | null>(null);

  // Track selected version for each download
  selectedVersions = signal<Map<number, DownloadVersion>>(new Map());

  // Track which info modal is open
  openInfoModalIndex = signal<number | null>(null);
  
  // Track focused item for visual effect
  focusedItemIndex = signal<number | null>(null);
  
  constructor() {
    // Watch for visibility changes and handle focus
    effect(() => {
      if (this.visible()) {
        this.handleModalOpen();
      }
    });
  }
  
  ngAfterViewInit() {
    // Component initialized
  }
  
  private handleModalOpen() {
    // Determine which item to focus based on device and focusTarget input
    const target = this.focusTarget();
    let indexToFocus: number | null = null;
    
    if (target === 'launcher') {
      // Focus on first launcher (Desktop Launcher = index 0)
      indexToFocus = 0;
    } else if (target === 'modpack') {
      // Focus on first modpack (index 2)
      indexToFocus = 2;
    } else {
      // Auto-detect based on device
      const isMobile = this.isMobileDevice();
      
      if (isMobile) {
        // Mobile: Focus on TropicaliaAmethyst (index 1 - Android launcher)
        indexToFocus = 1;
      } else {
        // Desktop: Focus on Desktop Launcher (index 0)
        indexToFocus = 0;
      }
    }
    
    // Set focused item
    this.focusedItemIndex.set(indexToFocus);
    
    // Scroll to focused item after modal renders
    setTimeout(() => {
      this.scrollToFocusedItem(indexToFocus);
    }, 100);
    
    // Remove focus glow after 4 seconds
    setTimeout(() => {
      this.focusedItemIndex.set(null);
    }, 4000);
  }
  
  private scrollToFocusedItem(index: number | null) {
    if (index === null || !this.modalContent) return;
    
    const element = this.modalContent.nativeElement.querySelector(`[data-download-index="${index}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  private isMobileDevice(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Check for iOS
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return true;
    }
    
    // Check for Android
    if (/android/i.test(userAgent)) {
      return true;
    }
    
    // Check for other mobile indicators
    return /Mobile|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  }
  
  isFocused(index: number): boolean {
    return this.focusedItemIndex() === index;
  }

  closeModal() {
    this.closed.emit();
  }

  openInfoModal(index: number) {
    this.openInfoModalIndex.set(index);
  }

  closeInfoModal() {
    this.openInfoModalIndex.set(null);
  }

  toggleDropdown(index: number) {
    this.openDropdownIndex.set(
      this.openDropdownIndex() === index ? null : index
    );
  }

  selectVersion(downloadIndex: number, version: DownloadVersion) {
    const map = new Map(this.selectedVersions());
    map.set(downloadIndex, version);
    this.selectedVersions.set(map);
    this.openDropdownIndex.set(null);
  }

  getSelectedVersion(downloadIndex: number, download: DownloadItem): DownloadVersion {
    const selected = this.selectedVersions().get(downloadIndex);
    if (selected) return selected;
    
    // Default to first version or fallback to download properties
    if (download.versions && download.versions.length > 0) {
      return download.versions[0];
    }
    
    return {
      version: download.version || 'Latest',
      downloadUrl: download.downloadUrl
    };
  }

  downloadFile(downloadIndex: number, download: DownloadItem) {
    const selected = this.getSelectedVersion(downloadIndex, download);
    window.open(selected.downloadUrl, '_blank');
  }

  closeDropdownIfOpen(event: MouseEvent) {
    // Close dropdown if clicking outside of it
    const target = event.target as HTMLElement;
    if (!target.closest('.minecraft-version-badge-button') && !target.closest('.minecraft-dropdown-menu')) {
      this.openDropdownIndex.set(null);
    }
  }

  // Helper methods to split downloads into categories
  getLaunchers(): DownloadItem[] {
    return this.downloads().filter((_, index) => index < 2); // First 2 items are launchers
  }

  getModpacks(): DownloadItem[] {
    return this.downloads().filter((_, index) => index >= 2); // Rest are modpacks
  }

  getLauncherIndex(localIndex: number): number {
    return localIndex; // Launchers are at indices 0-1
  }

  getModpackIndex(localIndex: number): number {
    return localIndex + 2; // Modpacks start at index 2
  }
}
