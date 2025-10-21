# Component Architecture - TropicaliaCraft Landing Page

This document describes the component breakdown of the TropicaliaCraft landing page for better maintainability and reusability.

## Components Created

### 1. **NotificationToastComponent** ✅
- **Location:** `src/app/shared/components/notification-toast/`
- **Purpose:** Reusable toast notification for copy actions
- **Inputs:** `visible` (boolean), `message` (string)
- **Usage:** `<app-notification-toast [visible]="showNotification()" [message]="notificationMessage()" />`

### 2. **FooterComponent** ✅
- **Location:** `src/app/shared/components/footer/`
- **Purpose:** Site footer with branding
- **Usage:** `<app-footer />`

### 3. **NavigationComponent** ✅
- **Location:** `src/app/shared/components/navigation/`
- **Purpose:** Responsive navigation with desktop and mobile menus
- **Outputs:** `vipClicked` - emits when VIP button is clicked
- **Usage:** `<app-navigation (vipClicked)="openVipModal()" />`

### 4. **VipModalComponent** ✅
- **Location:** `src/app/shared/components/vip-modal/`
- **Purpose:** VIP subscription modal with block breaking animations
- **Inputs:** `visible` (boolean), `tiers` (VipTier[])
- **Outputs:** `closed` - emits when modal is closed
- **Usage:** `<app-vip-modal [visible]="showVipModal()" [tiers]="bfeatures" (closed)="closeVipModal()" />`

### 5. **HeroSectionComponent** 🔨
- **Location:** `src/app/shared/components/hero-section/`
- **Purpose:** Hero section with 3D clouds, logo, tagline, and CTA button
- **Features:** Three.js 3D cloud rendering, random taglines
- **Outputs:** `playClicked` - emits when JOGAR AGORA is clicked

### 6. **FeatureCardsComponent** 🔨
- **Location:** `src/app/shared/components/feature-cards/`
- **Purpose:** Grid of feature cards
- **Inputs:** `features` (FeatureCard[])

### 7. **ServerTabsComponent** 🔨
- **Location:** `src/app/shared/components/server-tabs/`
- **Purpose:** Server selection tabs (mobile + desktop layouts)
- **Inputs:** `servers` (ServerInfo[]), `selectedIndex` (number)
- **Outputs:** `tabSelected` - emits selected server index

### 8. **ServerStatusComponent** 🔨
- **Location:** `src/app/shared/components/server-status/`
- **Purpose:** Display server online/offline status, MOTD, players, ping
- **Inputs:** `status` (ServerStatus), `isLoading` (boolean)

### 9. **ServerIpSectionComponent** 🔨
- **Location:** `src/app/shared/components/server-ip-section/`
- **Purpose:** IP/Port display with copy buttons (desktop + mobile layouts)
- **Inputs:** `ip` (string), `port` (string)
- **Outputs:** `ipCopied`, `portCopied` - emit when copy buttons clicked

### 10. **InfiniteScrollFeaturesComponent** 🔨
- **Location:** `src/app/shared/components/infinite-scroll-features/`
- **Purpose:** Horizontal infinite scroll carousel for server features
- **Inputs:** `features` (ServerFeature[])
- **Features:** Auto-scroll, drag support, 3-set circular buffer

### 11. **ServerActionButtonsComponent** 🔨
- **Location:** `src/app/shared/components/server-action-buttons/`
- **Purpose:** JOGAR AGORA and TESTAR ONLINE buttons
- **Inputs:** `protocolUrl` (string), `hasOnlineTest` (boolean)
- **Outputs:** `launchGame`, `testOnline` - emit when buttons clicked

### 12. **LiveMapComponent** 🔨
- **Location:** `src/app/shared/components/live-map/`
- **Purpose:** Real-time server map iframe display
- **Inputs:** `mapUrl` (string | null), `serverName` (string), `mapLoaded` (boolean)

### 13. **GalleryComponent** 🔨
- **Location:** `src/app/shared/components/gallery/`
- **Purpose:** Image gallery grid with hover effects
- **Inputs:** `images` (ServerImage[])

## Component Usage in home.component.html

```html
<!-- Notification Toast -->
<app-notification-toast 
  [visible]="showNotification()" 
  [message]="notificationMessage()" />

<!-- VIP Modal -->
<app-vip-modal 
  [visible]="showVipModal()" 
  [tiers]="bfeatures" 
  (closed)="closeVipModal()" />

<!-- Hero Section with 3D Clouds -->
<app-hero-section 
  [tagline]="currentTagline()" 
  (playClicked)="scrollToServerSection()" />

<!-- Navigation -->
<app-navigation (vipClicked)="openVipModal()" />

<!-- Feature Cards -->
<app-feature-cards [features]="features" />

<!-- Server Section -->
<div class="bg-gray-800 py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Server Tabs -->
    <app-server-tabs 
      [servers]="servers" 
      [selectedIndex]="selectedServerTab()" 
      (tabSelected)="selectServerTab($event)" />

    <!-- Server Description -->
    <div class="text-center mt-8">
      <p>{{ getSelectedServer().description }}</p>
    </div>

    <!-- Infinite Scroll Features -->
    <app-infinite-scroll-features 
      [features]="getSelectedServer().features" />

    <!-- Server IP Section -->
    <div id="server-section" class="bg-gray-900 border-4 border-gray-700 p-4 sm:p-6 md:p-8 rounded-lg scroll-mt-20">
      <h2>IP DO SERVIDOR - {{ getSelectedServer().name }}</h2>

      <!-- Server Status -->
      <app-server-status 
        [status]="serverStatus()" 
        [isLoading]="isLoadingStatus()" />

      <!-- IP/Port Section -->
      <app-server-ip-section 
        [ip]="serverIP()" 
        [port]="serverPort()" 
        (ipCopied)="copyIP()" 
        (portCopied)="copyPort()" />

      <!-- Action Buttons -->
      <app-server-action-buttons 
        [protocolUrl]="getSelectedServer().protocolUrl" 
        [hasOnlineTest]="getSelectedServer().hasOnlineTest" 
        (launchGame)="launchGame($event)" />
    </div>

    <!-- Live Map -->
    <app-live-map 
      [mapUrl]="getSelectedServer().mapUrl" 
      [serverName]="getSelectedServer().name" 
      [mapLoaded]="mapLoaded()" />
  </div>
</div>

<!-- Gallery -->
<app-gallery [images]="serverImages" />

<!-- Footer -->
<app-footer />
```

## Benefits of This Architecture

1. **Reusability:** Components can be used across different pages
2. **Maintainability:** Each component has a single responsibility
3. **Testability:** Components can be tested in isolation
4. **Performance:** Smaller components = better change detection
5. **Readability:** home.component.html is much cleaner and easier to understand
6. **Collaboration:** Multiple developers can work on different components simultaneously

## Next Steps

1. Create remaining component files (marked with 🔨)
2. Update home.component.html to use all components
3. Move related logic from home.component.ts to individual components
4. Test each component independently
5. Ensure all animations and interactions work correctly

## Legend
- ✅ Component created and ready
- 🔨 Component directory created, files pending
