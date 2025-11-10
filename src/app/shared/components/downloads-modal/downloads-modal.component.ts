import { Component, input, output, signal } from '@angular/core';
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
export class DownloadsModalComponent {
  visible = input.required<boolean>();
  downloads = input.required<DownloadItem[]>();

  closed = output<void>();

  // Track which dropdown is open (by index)
  openDropdownIndex = signal<number | null>(null);

  // Track selected version for each download
  selectedVersions = signal<Map<number, DownloadVersion>>(new Map());

  // Track which info modal is open
  openInfoModalIndex = signal<number | null>(null);

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
