# TropicaliaCraft - Minecraft Server Landing Page

> A modern, high-performance landing page for TropicaliaCraft Minecraft server. Built with Angular 20, featuring real-time server status, interactive 3D terrain animations, and live server maps with intelligent fallback.

![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Angular](https://img.shields.io/badge/Angular-20.3-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.180-000000?style=for-the-badge&logo=three.js&logoColor=white)
![SSG](https://img.shields.io/badge/SSG-Enabled-00C7B7?style=for-the-badge)

---

## 🎯 Overview

TropicaliaCraft Landing Page is a **modern, fully static Angular application** designed to showcase a Minecraft server with stunning visual effects and real-time information. Built with Angular 20's latest zoneless architecture and signals, it delivers exceptional performance while maintaining a rich, interactive user experience.

The application features **Static Site Generation (SSG)** for GitHub Pages deployment, **client-side hydration** for dynamic components, and a resilient **dual iframe system** for displaying server maps with automatic fallback.

---

## ✨ Features

### ⚙️ Core Functionality
- **Real-Time Server Status**: Live player count, version info, and server availability.
- **Multiple Server Tabs**: Seamless switching between different server instances (Survival, Cross-Play, Creative).
- **Interactive 3D Terrain**: Three.js-powered animated Minecraft-style terrain with voxel clouds.
- **Live Server Map**: Embedded Pl3xMap with intelligent fallback to local map on failure.
- **VIP Membership Modal**: Responsive showcase of VIP tiers with Minecraft-themed styling.
- **Server IP Copy**: One-click server IP copying with toast notifications.

### 🚀 Advanced Features
- **Static Site Generation (SSG)**: Pre-rendered HTML for instant page loads and SEO optimization.
- **Client-Side Hydration**: Progressive enhancement with event replay for dynamic features.
- **Zoneless Architecture**: Modern Angular signals without Zone.js for better performance.
- **Intelligent Map Fallback**: Automatic detection of failed external maps with instant localhost fallback.
- **Dual Iframe System**: Conditional rendering of external vs. local maps based on availability.
- **Responsive Design**: Mobile-first Tailwind CSS with custom Minecraft theming.

### 🎨 Visual Effects
- **Animated Hero Section**: Dynamic gradient backgrounds with smooth transitions.
- **Minecraft Textures**: Authentic block textures and breaking animations.
- **3D Cloud System**: Volumetric voxel clouds floating above terrain.
- **Infinite Scroll Features**: Smooth horizontal scrolling for server features and game modes.
- **Custom Modals**: Polished VIP and download modals with responsive layouts.

### 📱 User Experience
- **Mobile-Optimized**: VIP cards reorder on mobile (DIAMANTE tier prioritized).
- **Toast Notifications**: User-friendly feedback for actions (IP copied, download initiated).
- **Dark Theme**: Minecraft-inspired dark mode with green/brown accents.
- **Accessibility**: Semantic HTML and keyboard navigation support.
- **Performance**: Optimized bundle sizes and lazy-loaded components.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v20+ recommended)
- **npm** or **yarn**
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/gustavodslara/ng-tropicaliacraft-landing-page.git
    cd ng-tropicaliacraft-landing-page
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start development server**:
    ```bash
    npm start
    ```

4.  **Access the application**:
    Open your browser and navigate to `http://localhost:4200/`

### 🏗️ Building for Production

**For GitHub Pages deployment**:
```bash
npm run build:github-pages
```

This command:
- Builds the Angular app with SSG
- Outputs to `/docs` folder
- Creates `.nojekyll` file
- Generates `404.html` for SPA routing

**For standard build**:
```bash
npm run build
```

Artifacts will be in `dist/ng-tropicaliacraft-landing-page/browser/`.

---

## 📖 Usage Guide

### 🖱️ Key Features

**Server Status**:
- Live indicators show online/offline status
- Player count updates dynamically
- Click server IP to copy to clipboard

**Server Tabs**:
- Switch between Survival, Cross-Play, and Creative servers
- Each tab displays unique server information
- Map automatically updates when switching tabs

**VIP Membership**:
- Click "VIP" button to view membership tiers
- Compare features across DIAMANTE, OURO, and FERRO tiers
- Responsive layout adapts to screen size

**Downloads**:
- Click "BAIXAR PACK" to access resource pack and modpack
- Direct download links with version information

### 🗺️ Map Fallback System

The application uses an intelligent dual iframe system:

1. **External Map** (primary): Attempts to load server's Pl3xMap
2. **Local Map** (fallback): Loads from `/public/web/index.html` if:
   - External map URL contains `localhost` or `127.0.0.1` (instant)
   - External map fails to load (2-second timeout)
   - Server has no map URL configured

**Fallback Triggers**:
- Localhost detection: Immediate
- Network timeout: 2 seconds
- Error event: Instant

---

## 🏗️ Architecture

### Architecture Snapshot

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Angular 20.3 (Zoneless) | Core application with signals-based state |
| Rendering | SSG + CSR Hydration | Static generation with client-side enhancement |
| UI Framework | Tailwind CSS 3.4 | Utility-first responsive styling |
| 3D Graphics | Three.js 0.180 | Terrain and cloud animations |
| State Management | Angular Signals | Reactive state without Zone.js |
| HTTP Client | Angular HttpClient | Server status API calls |
| Build System | Angular CLI + esbuild | Fast builds with Vite-powered dev server |
| Deployment | GitHub Pages | Static hosting from `/docs` folder |

### Project Structure

```
ng-tropicaliacraft-landing-page/
├── src/
│   ├── app/
│   │   ├── home/                    # Main landing page
│   │   │   ├── home.component.ts    # Component logic with signals
│   │   │   ├── home.component.html  # Template with @if blocks
│   │   │   └── home.component.scss  # Minecraft-themed styles
│   │   ├── shared/
│   │   │   ├── components/          # Reusable components
│   │   │   │   ├── navigation/      # Top navbar
│   │   │   │   ├── footer/          # Footer section
│   │   │   │   ├── server-status/   # Live status indicator
│   │   │   │   ├── server-tabs/     # Server switcher
│   │   │   │   ├── live-map/        # 3D terrain + iframe map
│   │   │   │   ├── vip-modal/       # VIP tiers showcase
│   │   │   │   ├── downloads-modal/ # Resource pack modal
│   │   │   │   ├── gallery/         # Screenshot gallery
│   │   │   │   ├── hero-section/    # Animated hero
│   │   │   │   └── feature-cards/   # Server features
│   │   │   └── index.ts             # Barrel exports
│   │   ├── services/
│   │   │   └── product.service.ts   # Server data service
│   │   ├── app.config.ts            # App configuration + hydration
│   │   ├── app.routes.ts            # Routing config
│   │   └── app.ts                   # Root component
│   ├── index.html                   # Main HTML (no base href)
│   ├── main.ts                      # Bootstrap entry point
│   └── styles.scss                  # Global styles
├── public/
│   ├── web/                         # Local Pl3xMap files
│   │   ├── index.html               # Fallback map page
│   │   ├── pl3xmap.js               # Map JavaScript
│   │   ├── styles.css               # Map styles
│   │   └── tiles/                   # Map tile data
│   ├── fonts/                       # Minecraft fonts
│   └── images/                      # Assets
├── scripts/
│   └── copy-to-docs.js              # Post-build script for GitHub Pages
├── angular.json                     # Angular CLI config (SSG enabled)
├── tailwind.config.js               # Tailwind customization
├── tsconfig.json                    # TypeScript config
└── package.json                     # Dependencies
```

### ⚙️ Configuration Hotspots

| Area | File(s) | Purpose |
|---|---|---|
| SSG Config | `angular.json` | Build settings, output path, budgets |
| Hydration | `src/app/app.config.ts` | Client-side hydration with event replay |
| Map Fallback | `src/app/home/home.component.ts` | Localhost detection, timeout logic |
| Dual Iframes | `src/app/home/home.component.html` | @if conditional rendering |
| Theming | `tailwind.config.js` | Minecraft colors, fonts, animations |
| API Service | `src/app/services/product.service.ts` | Server data management |
| Post-Build | `scripts/copy-to-docs.js` | GitHub Pages deployment automation |

---

## 🔧 Technical Details

### SSG + Client-Side Hydration

**Static Site Generation**:
- Angular app pre-rendered at build time
- No server-side rendering (SSR) overhead
- Outputs pure static HTML/CSS/JS
- Perfect for GitHub Pages hosting

**Client-Side Hydration**:
```typescript
// src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(
      withEventReplay(),
      withIncrementalHydration()
    ),
    // ...
  ]
};
```

**Progressive Enhancement**:
- Static content renders immediately
- Dynamic features hydrate progressively
- Event replay ensures no lost interactions

### Map Fallback Implementation

**Localhost Detection**:
```typescript
selectServerTab(server: any) {
  this.selectedServer.set(server);
  
  // Immediate fallback for localhost URLs
  if (server.mapUrl?.includes('localhost') || 
      server.mapUrl?.includes('127.0.0.1')) {
    this.useLocalMap.set(true);
    return;
  }
  
  // Reset for external maps
  this.useLocalMap.set(false);
  
  // Set 2-second timeout fallback
  if (this.mapLoadTimeout) {
    window.clearTimeout(this.mapLoadTimeout);
  }
  
  this.mapLoadTimeout = window.setTimeout(() => {
    if (!this.useLocalMap()) {
      this.useLocalMap.set(true);
    }
  }, 2000);
}
```

**Dual Iframe Rendering**:
```html
<!-- External map iframe -->
@if (!useLocalMap() && getSelectedServer().mapUrl) {
  <iframe [src]="getExternalMapUrl()" 
          (error)="onMapError()" 
          (load)="onMapLoad()">
  </iframe>
}

<!-- Local fallback iframe -->
@if (useLocalMap() || !getSelectedServer().mapUrl) {
  <iframe src="/web/index.html?world=world&renderer=vintage_story&zoom=0&x=-34&z=83">
  </iframe>
}
```

### Zoneless Signals

```typescript
// Signal-based reactive state
export class HomeComponent {
  selectedServer = signal<any>({});
  useLocalMap = signal(false);
  servers = signal([...]);
  
  // Computed values
  getSelectedServer() {
    return this.selectedServer();
  }
  
  // Direct signal updates
  selectServerTab(server: any) {
    this.selectedServer.set(server);
    this.useLocalMap.set(false);
  }
}
```

**Benefits**:
- No Zone.js overhead
- Fine-grained reactivity
- Better performance
- Simpler change detection

---

## 📦 Build Configuration

### CSS Budgets

```json
// angular.json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "1.5mb",
    "maximumError": "2mb"
  },
  {
    "type": "anyComponentStyle",
    "maximumWarning": "25kB",
    "maximumError": "50kB"
  }
]
```

### GitHub Pages Deployment

1. **Build**: `npm run build:github-pages`
2. **Output**: `/docs` folder created
3. **Files Generated**:
   - Static HTML, CSS, JS bundles
   - `.nojekyll` (disables Jekyll processing)
   - `404.html` (SPA routing support)

4. **Deploy**:
   ```bash
   git add docs/
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

5. **Configure GitHub**:
   - Repository → Settings → Pages
   - Source: Deploy from branch
   - Branch: `main`, Folder: `/docs`

---

## 🧪 Quality & Performance

- **Zoneless Architecture**: Eliminates Zone.js overhead for ~30% faster change detection
- **SSG Pre-rendering**: Instant first contentful paint (FCP)
- **Client-Side Hydration**: Progressive enhancement without blocking
- **Optimized Bundles**: Tree-shaking and code splitting enabled
- **Lazy Loading**: Components loaded on-demand
- **Tailwind Purging**: Unused CSS removed in production
- **Image Optimization**: WebP format with lazy loading
- **Three.js Efficiency**: Instanced meshes for terrain and clouds

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### 🧑‍💻 How to Contribute

1.  Fork the repository
2.  Create a feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request

### 📜 Contribution Guidelines

- Follow Angular style guide
- Use TypeScript strict mode
- Write meaningful commit messages
- Test responsive design on multiple devices
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License.

### MIT License Summary
Copyright (c) 2025 Gustavo Lara (gustavodslara)  
Cuiabá, Mato Grosso, Brazil

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

---

## 🙏 Acknowledgments

- **Angular Team**: For the incredible framework and zoneless signals
- **Tailwind CSS**: For utility-first responsive design
- **Three.js**: For powerful 3D rendering capabilities
- **Pl3xMap**: For Minecraft server mapping
- **Minecraft**: For inspiration and aesthetics

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/gustavodslara/ng-tropicaliacraft-landing-page/issues)
- **Server Discord**: [Join TropicaliaCraft](https://discord.gg/tropicaliacraft)

## 🔗 Links

- **Live Demo**: [https://gustavodslara.github.io/ng-tropicaliacraft-landing-page](https://gustavodslara.github.io/ng-tropicaliacraft-landing-page)
- **Repository**: [https://github.com/gustavodslara/ng-tropicaliacraft-landing-page](https://github.com/gustavodslara/ng-tropicaliacraft-landing-page)
- **Angular**: [https://angular.dev/](https://angular.dev/)
- **Three.js**: [https://threejs.org/](https://threejs.org/)

---

**Built with Angular signals, styled with Tailwind, animated with Three.js – for the ultimate Minecraft server experience.**
