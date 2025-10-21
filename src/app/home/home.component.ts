import { Component, signal, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import * as THREE from 'three';

interface FeatureCard {
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  image?: string;
  price?: string;
}

interface ServerImage {
  url: string;
  title: string;
  borderColor: string;
}

interface ClassicGameMode {
  title: string;
  description: string;
  imageUrl: string;
  borderColor: 'blue' | 'green' | 'red' | 'yellow';
  playerCount?: string;
}

interface ServerFeature {
  image: string;
  label: string;
}

interface ServerInfo {
  id: string;
  name: string;
  icon: string;
  ip: string;
  port: string;
  mapUrl: string;
  description: string;
  imageUrl: string;
  features: ServerFeature[];
  protocolUrl: string; // Custom protocol URL for launching the game
  hasOnlineTest?: boolean; // Flag for servers that support online testing
  tags: ServerTag[]; // Feature tags to display
  platformInfo: string; // Platform compatibility info
  playerCount?: string; // Real-time player count display
}

interface ServerTag {
  icon: string;
  label: string;
  highlight?: boolean; // Highlight important features
}

interface ServerStatus {
  online: boolean;
  motd?: string;
  players?: {
    online: number;
    max: number;
  };
  version?: string;
  ping?: number;
  favicon?: string;
}

interface Cloud {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  originalY: number;
  floatOffset: number;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cloudCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('featuresScroll', { static: false }) featuresScrollRef?: ElementRef<HTMLElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private clouds: Cloud[] = [];
  private animationId?: number;
  private autoScrollInterval?: any;

  // Server tabs
  selectedServerTab = signal(1); // Start with middle tab (index 1)

  // Server status
  serverStatus = signal<ServerStatus>({
    online: false
  });
  isLoadingStatus = signal(false);

  servers: ServerInfo[] = [
    {
      id: 'survival',
      name: 'JAVA MODS',
      icon: '⚔️',
      ip: 'mods.tropicalia.net',
      port: '25565',
      mapUrl: '',
      description: 'Servidor JAVA com modificações únicas!',
      imageUrl: '/images/javamods.jpg',
      protocolUrl: 'tropicalia://mods.tropicalia.net:25565',
      hasOnlineTest: true,
      platformInfo: 'Windows, Linux e Mac (Java Edition)',
      tags: [
        { icon: '💻', label: 'Apenas PC' },
        { icon: '🔧', label: 'Mods', highlight: true },
        { icon: '🌲', label: 'Sobrevivência' },
        { icon: '🎨', label: 'Criativo' }
      ],
      features: [
        { image: '/images/features/java-edition.png', label: 'Java Edition' },
        { image: '/images/features/mods.png', label: 'Mods' },
        { image: '/images/features/fabric.png', label: 'Fabric' },
        { image: '/images/features/forge.png', label: 'Forge' },
        { image: '/images/features/vivecraft.png', label: 'Vivecraft Support' }
      ]
    },
    {
      id: 'skyblock',
      name: 'CROSS-PLAY',
      icon: '🏝️',
      ip: 'minecraft.tropicalia.net',
      port: '25565',
      mapUrl: '',
      description: 'Servidor Principal! PC + Celular + Consoles',
      imageUrl: '/images/javabedrock.jpg',
      protocolUrl: 'tropicalia://minecraft.tropicalia.net:25565',
      hasOnlineTest: true,
      platformInfo: 'PC + Celular + Consoles (Cross-Play Java & Bedrock)',
      tags: [
        { icon: '🎮', label: 'Multiplataforma', highlight: true },
        { icon: '🎯', label: 'Minigames', highlight: true },
        { icon: '🌲', label: 'Sobrevivência' },
        { icon: '🎨', label: 'Criativo' }
      ],
      features: [
        { image: '/images/features/java-edition.png', label: 'Java Edition' },
        { image: '/images/features/bedrock.png', label: 'Bedrock Edition' },
        { image: '/images/features/cross-play.png', label: 'Cross-Play' },
        { image: '/images/features/minigames.png', label: 'Minigames' },
        { image: '/images/features/survival.png', label: 'Survival' },
        { image: '/images/features/creative.png', label: 'Creative' }
      ]
    },
    {
      id: 'creative',
      name: 'BEDROCK ADDONS',
      icon: '🎨',
      ip: 'addons.tropicalia.net',
      port: '25565',
      mapUrl: '',
      description: 'Servidor BEDROCK com addons',
      imageUrl: '/images/bedrockaddos.jpg',
      protocolUrl: 'tropicalia://addons.tropicalia.net:25565',
      hasOnlineTest: false,
      platformInfo: 'Celular + Consoles (Bedrock Edition)',
      tags: [
        { icon: '📱', label: 'Celular & Consoles' },
        { icon: '🛒', label: 'Marketplace Addons', highlight: true },
        { icon: '🌲', label: 'Sobrevivência' },
        { icon: '🎨', label: 'Criativo' }
      ],
      features: [
        { image: '/images/features/bedrock.png', label: 'Bedrock Edition' },
        { image: '/images/features/mobile.png', label: 'Mobile' },
        { image: '/images/features/addons.png', label: 'Addons' },
        { image: '/images/features/custom-blocks.png', label: 'Custom Blocks' }
      ]
    }
  ];

  serverIP = signal('minecraft.tropicalia.net');
  serverPort = signal('25565');
  mobileMenuOpen = signal(false);
  showNotification = signal(false);
  notificationMessage = signal('');
  mapLoaded = signal(true);

  // Server version (will come from API later)
  serverVersion = signal('1.21');

  // Player counts for all servers (real-time)
  // Fetched from mcsrvstat.us API every 30 seconds
  // Falls back to mocked data if fetch fails to maintain UI aesthetics
  // Servers included:
  // - 1.21 Servers: survival (Java Mods), skyblock (Cross-Play), creative (Bedrock Addons)
  // - 1.8 Classic: skywars, bedwars, hungergames, pvp
  serverPlayerCounts = signal<{ [key: string]: string }>({
    'survival': '0/100',
    'skyblock': '0/200',
    'creative': '0/150',
    'skywars': '0/12',
    'bedwars': '0/16',
    'hungergames': '0/24',
    'pvp': '0/∞'
  });

  // Random taglines
  taglines: string[] = [
    'Does barrel rolls!',
    'Better than Minecraft!',
    'Awesome!',
    'Now in 3D!',
    'Epic adventures await!',
    'Craft your world!',
    'Explore the tropics!',
    'Join the fun!',
    'Build your dreams!',
    'Adventure time!'
  ];
  currentTagline = signal('');
  showVipModal = signal(false);

  // Drag scroll functionality
  isDragging = signal(false);
  startX = signal(0);
  scrollLeft = signal(0);

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  openVipModal() {
    this.showVipModal.set(true);
    this.closeMobileMenu();
  }

  closeVipModal() {
    this.showVipModal.set(false);
  }

  // Scroll to server section
  scrollToServerSection() {
    const serverSection = document.querySelector('#server-section');
    if (serverSection) {
      serverSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Launch game with custom protocol
  launchGame(protocolUrl: string) {
    window.location.href = protocolUrl;
  }

  // Drag scroll methods
  onDragStart(e: MouseEvent | TouchEvent, element: HTMLElement) {
    this.isDragging.set(true);
    element.style.cursor = 'grabbing';
    element.style.userSelect = 'none';

    // Stop auto-scroll when user starts dragging
    this.stopAutoScroll();

    const pageX = e instanceof MouseEvent ? e.pageX : e.touches[0].pageX;
    this.startX.set(pageX - element.offsetLeft);
    this.scrollLeft.set(element.scrollLeft);
  }

  onDragMove(e: MouseEvent | TouchEvent, element: HTMLElement) {
    if (!this.isDragging()) return;
    e.preventDefault();

    const pageX = e instanceof MouseEvent ? e.pageX : e.touches[0].pageX;
    const x = pageX - element.offsetLeft;
    const walk = (x - this.startX()) * 2; // Multiply by 2 for faster scroll
    element.scrollLeft = this.scrollLeft() - walk;
  }

  onDragEnd(element: HTMLElement) {
    this.isDragging.set(false);
    element.style.cursor = 'grab';
    element.style.userSelect = 'auto';
    // Resume auto-scroll after dragging ends
    setTimeout(() => this.startAutoScroll(), 1000);
  }

  onMouseLeave(element: HTMLElement) {
    // Handle both drag end and resume auto-scroll
    this.onDragEnd(element);
    this.startAutoScroll();
  }

  // Start automatic scrolling (public for template)
  startAutoScroll() {
    // Clear any existing interval
    this.stopAutoScroll();

    if (!this.featuresScrollRef) return;

    const element = this.featuresScrollRef.nativeElement;

    // Auto-scroll smoothly to the LEFT (items move visually to the RIGHT)
    this.autoScrollInterval = setInterval(() => {
      if (!this.isDragging()) {
        element.scrollLeft -= 1; // Negative = scroll left, items move right
      }
    }, 20); // Update every 20ms for smooth animation
  }

  // Stop automatic scrolling (public for template)
  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = undefined;
    }
  }

  // True infinite scroll with seamless repositioning
  onFeaturesScroll(element: HTMLElement) {
    // Don't reposition while dragging
    if (this.isDragging()) return;

    const scrollWidth = element.scrollWidth;
    const scrollLeft = element.scrollLeft;
    const clientWidth = element.clientWidth;

    // We have 3 identical sets of items
    // Each set takes up 33.33% of the total scroll width
    const sectionWidth = scrollWidth / 3;

    // Calculate scroll percentage for debugging
    const scrollPercent = (scrollLeft / scrollWidth) * 100;

    console.log(`Scroll: ${Math.round(scrollPercent)}% | Left: ${Math.round(scrollLeft)}px | Width: ${Math.round(scrollWidth)}px`);

    // Scrolling LEFT (auto-scroll): When reaching start of set 2 (around 33%)
    // Jump forward to start of set 3 (66%) - seamless because set 1 and set 2 are identical
    if (scrollLeft <= sectionWidth + 10) {
      console.log('🔄 Repositioning LEFT: start of set 2 → start of set 3');
      element.scrollLeft = sectionWidth * 2;
    }
    // Scrolling RIGHT (manual drag): When reaching end of set 2 (around 66%)
    // Jump back to start of set 2 (33%) - seamless because set 2 and set 3 are identical
    else if (scrollLeft >= sectionWidth * 2 - 10) {
      console.log('🔄 Repositioning RIGHT: end of set 2 → start of set 2');
      element.scrollLeft = sectionWidth;
    }
  }

  bfeatures: FeatureCard[] = [
    {
      title: 'FERRO',
      description: 'Kit inicial semanal • /home set (3 casas) • Acesso a warps VIP • Prefixo [FERRO] no chat',
      icon: '⚔️',
      color: 'gray',
      route: '/products',
      image: '/images/iron_block.png',
      price: 'R$ 19,90'
    },
    {
      title: 'OURO',
      description: 'Tudo do Ferro + Kit diário • /home set (5 casas) • /fly nas terras • Prefixo [OURO] no chat • Desconto 15% na loja',
      icon: '⛏️',
      color: 'orange',
      route: '/products',
      image: '/images/gold_block.png',
      price: 'R$ 39,90'
    },
    {
      title: 'DIAMANTE',
      description: 'Tudo do Ouro + Kit a cada 12h • /home set (10 casas) • /fly em todo servidor • Skin personalizada • Partículas exclusivas • Prefixo [💎DIAMANTE] • Desconto 30% na loja • Acesso prioritário',
      icon: '💎',
      color: 'cyan',
      route: '/products',
      image: '/images/diamond_block.png',
      price: 'R$ 79,90'
    }
  ];
  features: FeatureCard[] = [
    {
      title: 'SOBREVIVÊNCIA & EXPLORAÇÃO',
      description: 'Explore um mundo tropical cheio de aventuras',
      icon: '⚔️',
      color: 'green',
      route: '/products'
    },
    {
      title: 'CONSTRUÇÕES CRIATIVAS',
      description: 'Construa suas criações incríveis',
      icon: '⛏️',
      color: 'orange',
      route: '/products'
    },
    {
      title: 'MINIGAMES & DESAFIOS',
      description: 'Participe de minigames emocionantes',
      icon: '🧪',
      color: 'blue',
      route: '/products'
    }
  ];

  // Classic Minecraft 1.8 Game Modes
  classicGameModes: ClassicGameMode[] = [
    {
      title: 'SKY WARS',
      description: 'Batalhe nas ilhas flutuantes!',
      imageUrl: '/images/gamemodes/skywars.jpg',
      borderColor: 'blue',
      playerCount: '0/12'
    },
    {
      title: 'BED WARS',
      description: 'Proteja sua cama e destrua a dos outros!',
      imageUrl: '/images/gamemodes/bedwars.jpg',
      borderColor: 'red',
      playerCount: '0/16'
    },
    {
      title: 'HUNGER GAMES',
      description: 'Sobreviva ao Hardcore clássico!',
      imageUrl: '/images/gamemodes/hunger-games.jpg',
      borderColor: 'green',
      playerCount: '0/24'
    },
    {
      title: 'PVP ARENA',
      description: 'Combate puro 1.8 sem cooldown!',
      imageUrl: '/images/gamemodes/pvp_arena.jpg',
      borderColor: 'yellow',
      playerCount: '0/∞'
    }
  ];

  constructor(private sanitizer: DomSanitizer, private http: HttpClient) {}

  ngOnInit(): void {
    // Component initialization
    // Set initial server data
    this.selectServerTab(1);
    // Set random tagline
    this.setRandomTagline();
    // Fetch player counts for all servers
    this.fetchAllPlayerCounts();
    // Refresh player counts every 30 seconds
    setInterval(() => this.fetchAllPlayerCounts(), 30000);
  }

  setRandomTagline(): void {
    const randomIndex = Math.floor(Math.random() * this.taglines.length);
    this.currentTagline.set(this.taglines[randomIndex]);
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createClouds();
    this.animate();

    // Initialize infinite scroll position to middle of the middle set
    // This allows equal scrolling distance in both directions before repositioning
    if (this.featuresScrollRef) {
      const element = this.featuresScrollRef.nativeElement;
      setTimeout(() => {
        // Start at 50% of total width (middle of set 2 with 3 sets)
        // This gives us equal buffer on both sides
        element.scrollLeft = element.scrollWidth / 2;

        // Start automatic scrolling
        this.startAutoScroll();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    // Clean up auto-scroll interval
    this.stopAutoScroll();
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement!;

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent background

    // Camera setup - Looking at the horizon (Minecraft POV)
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    // Position camera as if we're standing in Minecraft looking at the horizon
    this.camera.position.set(0, 5, 0);
    // Look slightly upward at the horizon
    this.camera.rotation.x = -0.1; // Slight upward tilt

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false // Pixelated look
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(1); // Lower pixel ratio for blocky look

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createClouds(): void {
    // Create multiple clouds at different distances
    const cloudCount = 25;

    for (let i = 0; i < cloudCount; i++) {
      const cloud = this.createMinecraftCloud();

      // Spread clouds across the sky
      cloud.mesh.position.x = (Math.random() - 0.5) * 150;
      cloud.mesh.position.y = Math.random() * 30 + 20; // Sky height (20-50)
      cloud.mesh.position.z = -Math.random() * 200 - 50; // Start far away on horizon (-50 to -250)

      // Store original position
      cloud.originalY = cloud.mesh.position.y;
      cloud.floatOffset = Math.random() * Math.PI * 2;

      // Clouds move TOWARDS camera (from horizon towards us)
      // SLOWER speed for realistic Minecraft feel
      const baseSpeed = Math.random() * 0.05 + 0.03; // 0.03 to 0.08 (much slower)
      cloud.velocity = new THREE.Vector3(
        0, // No horizontal movement
        0, // No vertical movement
        baseSpeed  // Move towards camera (positive Z)
      );

      this.scene.add(cloud.mesh);
      this.clouds.push(cloud);
    }
  }

  private createMinecraftCloud(): Cloud {
    // Create a cloud made of flat blocky cubes (Minecraft style - ONLY 1 BLOCK HEIGHT)
    const cloudGroup = new THREE.Group();

    // Minecraft cloud colors with three-tone shading (no lighting, just colored faces)
    // Bottom face (what we see from horizon view): #A8B1C0
    const bottomMaterial = new THREE.MeshBasicMaterial({
      color: 0xA8B1C0,
      transparent: true,
      opacity: 1
    });

    // Side face (left/right): #BBC7D5
    const sideMaterial = new THREE.MeshBasicMaterial({
      color: 0xBBC7D5,
      transparent: true,
      opacity: 1
    });

    // Top/front face (brightest): #D2DBEA
    const topMaterial = new THREE.MeshBasicMaterial({
      color: 0xD2DBEA,
      transparent: true,
      opacity: 1
    });

    // Random cloud shape - BIGGER shapes with rare Creeper face (FLAT - y is always 0)
    const rand = Math.random();
    let shapeType: number;

    // 10% chance for Creeper face cloud!
    if (rand < 0.1) {
      shapeType = 6; // Creeper face
    } else {
      shapeType = Math.floor(Math.random() * 6);
    }

    const scale = Math.random() * 0.8 + 1.2; // BIGGER: 1.2 to 2.0

    let blocks: { x: number; y: number; z: number }[] = [];

    switch (shapeType) {
      case 0: // BIG square cloud
        blocks = [
          { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }, { x: 5, y: 0, z: 0 },
          { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 2, y: 0, z: 1 }, { x: 3, y: 0, z: 1 }, { x: 4, y: 0, z: 1 }, { x: 5, y: 0, z: 1 },
          { x: 0, y: 0, z: 2 }, { x: 1, y: 0, z: 2 }, { x: 2, y: 0, z: 2 }, { x: 3, y: 0, z: 2 }, { x: 4, y: 0, z: 2 }, { x: 5, y: 0, z: 2 },
          { x: 0, y: 0, z: 3 }, { x: 1, y: 0, z: 3 }, { x: 2, y: 0, z: 3 }, { x: 3, y: 0, z: 3 }, { x: 4, y: 0, z: 3 }, { x: 5, y: 0, z: 3 }
        ];
        break;
      case 1: // LONG horizontal rectangle cloud
        blocks = [
          { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }, { x: 6, y: 0, z: 0 }, { x: 7, y: 0, z: 0 },
          { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 2, y: 0, z: 1 }, { x: 3, y: 0, z: 1 }, { x: 4, y: 0, z: 1 }, { x: 5, y: 0, z: 1 }, { x: 6, y: 0, z: 1 }, { x: 7, y: 0, z: 1 },
          { x: 0, y: 0, z: 2 }, { x: 1, y: 0, z: 2 }, { x: 2, y: 0, z: 2 }, { x: 3, y: 0, z: 2 }, { x: 4, y: 0, z: 2 }, { x: 5, y: 0, z: 2 }, { x: 6, y: 0, z: 2 }, { x: 7, y: 0, z: 2 }
        ];
        break;
      case 2: // Wide rectangle cloud
        blocks = [
          { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 }, { x: 4, y: 0, z: 0 },
          { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 2, y: 0, z: 1 }, { x: 3, y: 0, z: 1 }, { x: 4, y: 0, z: 1 },
          { x: 0, y: 0, z: 2 }, { x: 1, y: 0, z: 2 }, { x: 2, y: 0, z: 2 }, { x: 3, y: 0, z: 2 }, { x: 4, y: 0, z: 2 },
          { x: 0, y: 0, z: 3 }, { x: 1, y: 0, z: 3 }, { x: 2, y: 0, z: 3 }, { x: 3, y: 0, z: 3 }, { x: 4, y: 0, z: 3 },
          { x: 0, y: 0, z: 4 }, { x: 1, y: 0, z: 4 }, { x: 2, y: 0, z: 4 }, { x: 3, y: 0, z: 4 }, { x: 4, y: 0, z: 4 }
        ];
        break;
      case 3: // Dense big rectangular cloud
        blocks = [
          { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }, { x: 5, y: 0, z: 0 },
          { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 2, y: 0, z: 1 }, { x: 3, y: 0, z: 1 }, { x: 4, y: 0, z: 1 }, { x: 5, y: 0, z: 1 },
          { x: 0, y: 0, z: 2 }, { x: 1, y: 0, z: 2 }, { x: 2, y: 0, z: 2 }, { x: 3, y: 0, z: 2 }, { x: 4, y: 0, z: 2 }, { x: 5, y: 0, z: 2 },
          { x: 0, y: 0, z: 3 }, { x: 1, y: 0, z: 3 }, { x: 2, y: 0, z: 3 }, { x: 3, y: 0, z: 3 }, { x: 4, y: 0, z: 3 }, { x: 5, y: 0, z: 3 },
          { x: 0, y: 0, z: 4 }, { x: 1, y: 0, z: 4 }, { x: 2, y: 0, z: 4 }, { x: 3, y: 0, z: 4 }, { x: 4, y: 0, z: 4 }, { x: 5, y: 0, z: 4 }
        ];
        break;
      case 4: // BIG L-shaped cloud
        blocks = [
          { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }, { x: 5, y: 0, z: 0 },
          { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 },
          { x: 0, y: 0, z: 2 }, { x: 1, y: 0, z: 2 },
          { x: 0, y: 0, z: 3 }, { x: 1, y: 0, z: 3 },
          { x: 0, y: 0, z: 4 }, { x: 1, y: 0, z: 4 }
        ];
        break;
      case 5: // T-shaped cloud
        blocks = [
          { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }, { x: 6, y: 0, z: 0 },
          { x: 2, y: 0, z: 1 }, { x: 3, y: 0, z: 1 }, { x: 4, y: 0, z: 1 },
          { x: 2, y: 0, z: 2 }, { x: 3, y: 0, z: 2 }, { x: 4, y: 0, z: 2 },
          { x: 2, y: 0, z: 3 }, { x: 3, y: 0, z: 3 }, { x: 4, y: 0, z: 3 }
        ];
        break;
      case 6: // CREEPER FACE! (8x8 cloud)
        // Creating Creeper face pattern
        blocks = [
          // Top row (empty for spacing)
          // Row 2 - Eyes
          { x: 1, y: 0, z: 1 }, { x: 2, y: 0, z: 1 }, { x: 5, y: 0, z: 1 }, { x: 6, y: 0, z: 1 },
          { x: 1, y: 0, z: 2 }, { x: 2, y: 0, z: 2 }, { x: 5, y: 0, z: 2 }, { x: 6, y: 0, z: 2 },
          // Row 4 - Nose top
          { x: 3, y: 0, z: 3 }, { x: 4, y: 0, z: 3 },
          { x: 3, y: 0, z: 4 }, { x: 4, y: 0, z: 4 },
          // Row 5 - Mouth
          { x: 2, y: 0, z: 5 }, { x: 3, y: 0, z: 5 }, { x: 4, y: 0, z: 5 }, { x: 5, y: 0, z: 5 },
          { x: 1, y: 0, z: 6 }, { x: 2, y: 0, z: 6 }, { x: 5, y: 0, z: 6 }, { x: 6, y: 0, z: 6 },
          { x: 1, y: 0, z: 7 }, { x: 6, y: 0, z: 7 }
        ];
        break;
      default: // Random bigger cluster
        const clusterSize = Math.floor(Math.random() * 12) + 15;
        for (let i = 0; i < clusterSize; i++) {
          blocks.push({
            x: Math.floor(Math.random() * 7),
            y: 0, // ALWAYS FLAT - ONLY 1 HEIGHT
            z: Math.floor(Math.random() * 5)
          });
        }
    }

    // Create cubes for each block position with Minecraft multi-face coloring
    const blockSize = 2.2; // Bigger blocks for more visible clouds
    blocks.forEach(pos => {
      const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);

      // Apply different materials to different faces for Minecraft shading effect
      // Order: right, left, top, bottom, front, back
      const materials = [
        sideMaterial.clone(),   // right - side color
        sideMaterial.clone(),   // left - side color
        topMaterial.clone(),    // top - brightest color
        bottomMaterial.clone(), // bottom - darkest color (what we see from horizon)
        topMaterial.clone(),    // front - bright color
        sideMaterial.clone()    // back - side color
      ];

      const cube = new THREE.Mesh(geometry, materials);
      cube.position.set(pos.x * blockSize, pos.y * blockSize, pos.z * blockSize);
      cloudGroup.add(cube);
    });

    cloudGroup.scale.set(scale, scale, scale);

    const mesh = cloudGroup as any;

    return {
      mesh,
      velocity: new THREE.Vector3(),
      originalY: 0,
      floatOffset: 0
    };
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Update each cloud
    this.clouds.forEach((cloud, index) => {
      // Move clouds towards camera (from horizon)
      cloud.mesh.position.z += cloud.velocity.z;

      // Calculate fade effect based on Z position (distance from camera)
      // Clouds fade IN when far away (horizon) - creates depth illusion
      // Clouds fade OUT when very close (passing overhead)
      const horizonStart = -250; // Very far
      const horizonEnd = -150;   // Fading in complete
      const nearStart = 20;      // Start fading out
      const nearEnd = 40;        // Behind camera

      let targetOpacity = 0.85;

      // Fade in from horizon (far away)
      if (cloud.mesh.position.z < horizonEnd) {
        const fadeInProgress = (cloud.mesh.position.z - horizonStart) / (horizonEnd - horizonStart);
        targetOpacity = Math.max(0.1, Math.min(0.85, fadeInProgress * 0.85));
      }
      // Fade out when getting very close (passing overhead)
      else if (cloud.mesh.position.z > nearStart) {
        const fadeOutProgress = (cloud.mesh.position.z - nearStart) / (nearEnd - nearStart);
        targetOpacity = Math.max(0, 0.85 - (fadeOutProgress * 0.85));
      }

      // Scale clouds based on distance for perspective effect
      // Clouds far away appear smaller
      const distanceFactor = Math.max(0.3, 1 - (Math.abs(cloud.mesh.position.z) / 250));
      const perspectiveScale = 0.5 + distanceFactor * 1.5;

      // Apply opacity to all meshes and their materials in the cloud group
      cloud.mesh.children.forEach((child: any) => {
        if (child.material) {
          // Handle both single material and array of materials
          if (Array.isArray(child.material)) {
            child.material.forEach((mat: any) => {
              mat.opacity = targetOpacity;
            });
          } else {
            child.material.opacity = targetOpacity;
          }
        }
      });

      // Reset clouds that pass behind camera (respawn at horizon)
      if (cloud.mesh.position.z > nearEnd) {
        cloud.mesh.position.z = horizonStart - Math.random() * 50;
        cloud.mesh.position.x = (Math.random() - 0.5) * 150;
        cloud.mesh.position.y = Math.random() * 30 + 20;
        // Vary speed slightly on respawn for natural feel (slower)
        cloud.velocity.z = Math.random() * 0.05 + 0.03;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement!;

    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  copyIP(): void {
    navigator.clipboard.writeText(this.serverIP());
    this.showCopyNotification('IP copiado!');
  }

  copyPort(): void {
    navigator.clipboard.writeText(this.serverPort());
    this.showCopyNotification('Porta copiada!');
  }

  copyIPField(): void {
    this.copyIP();
  }

  copyPortField(): void {
    this.copyPort();
  }

  selectServerTab(index: number): void {
    this.selectedServerTab.set(index);
    const server = this.servers[index];
    this.serverIP.set(server.ip);
    this.serverPort.set(server.port);
    this.mapLoaded.set(!!server.mapUrl);

    // Reset scroll position and restart auto-scroll when switching servers
    if (this.featuresScrollRef) {
      const element = this.featuresScrollRef.nativeElement;
      setTimeout(() => {
        // Reset to middle of scroll (50% = middle of set 2)
        element.scrollLeft = element.scrollWidth / 2;
        // Restart auto-scroll
        this.startAutoScroll();
      }, 50);
    }

    // Fetch server status
    this.fetchServerStatus(server.ip, server.port);
  }

  fetchServerStatus(ip: string, port: string): void {
    this.isLoadingStatus.set(true);

    // Using mcsrvstat.us API for Minecraft server status
    const apiUrl = `https://api.mcsrvstat.us/3/${ip}:${port}`;

    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        if (data.online) {
          this.serverStatus.set({
            online: true,
            motd: data.motd?.clean?.join('\n') || data.motd?.raw?.join('\n') || 'No MOTD',
            players: {
              online: data.players?.online || 0,
              max: data.players?.max || 0
            },
            version: data.version || 'Unknown',
            ping: data.debug?.ping ? Math.round(data.debug.ping) : undefined,
            favicon: data.icon || undefined
          });
        } else {
          this.serverStatus.set({
            online: false
          });
        }
        this.isLoadingStatus.set(false);
      },
      error: (error) => {
        console.error('Error fetching server status:', error);
        this.serverStatus.set({
          online: false
        });
        this.isLoadingStatus.set(false);
      }
    });
  }

  fetchAllPlayerCounts(): void {
    // Fetch player counts for 1.21 servers
    this.servers.forEach(server => {
      this.fetchPlayerCount(server.id, server.ip, server.port);
    });

    // Fetch player counts for Classic 1.8 servers
    // Using mocked IPs for now - replace with actual server addresses
    const classicServers = [
      { id: 'skywars', ip: 'classic.tropicaliammc.com', port: '25570' },
      { id: 'bedwars', ip: 'classic.tropicaliammc.com', port: '25571' },
      { id: 'hungergames', ip: 'classic.tropicaliammc.com', port: '25572' },
      { id: 'pvp', ip: 'classic.tropicaliammc.com', port: '25573' }
    ];

    classicServers.forEach(server => {
      this.fetchPlayerCount(server.id, server.ip, server.port);
    });
  }

  fetchPlayerCount(serverId: string, ip: string, port: string): void {
    const apiUrl = `https://api.mcsrvstat.us/3/${ip}:${port}`;

    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        const currentCounts = this.serverPlayerCounts();
        if (data.online && data.players) {
          const online = data.players.online || 0;
          const max = data.players.max || 100;

          // Special handling for PVP Arena (infinite players)
          const playerCount = serverId === 'pvp' ? `${online}/∞` : `${online}/${max}`;

          this.serverPlayerCounts.set({
            ...currentCounts,
            [serverId]: playerCount
          });
        } else {
          // If fetch fails, use mocked data for pretty UI
          const mockedCounts: { [key: string]: string } = {
            'survival': '8/100',
            'skyblock': '42/200',
            'creative': '15/150',
            'skywars': '6/12',
            'bedwars': '12/16',
            'hungergames': '18/24',
            'pvp': '23/∞'
          };

          this.serverPlayerCounts.set({
            ...currentCounts,
            [serverId]: mockedCounts[serverId] || currentCounts[serverId]
          });
        }
      },
      error: (error) => {
        console.warn(`Error fetching player count for ${serverId}:`, error);
        // Use mocked data when fetch fails
        const currentCounts = this.serverPlayerCounts();
        const mockedCounts: { [key: string]: string } = {
          'survival': '8/100',
          'skyblock': '42/200',
          'creative': '15/150',
          'skywars': '6/12',
          'bedwars': '12/16',
          'hungergames': '18/24',
          'pvp': '23/∞'
        };

        this.serverPlayerCounts.set({
          ...currentCounts,
          [serverId]: mockedCounts[serverId] || currentCounts[serverId]
        });
      }
    });
  }

  getSelectedServer(): ServerInfo {
    return this.servers[this.selectedServerTab()];
  }

  getPlayerCount(serverId: string): string {
    return this.serverPlayerCounts()[serverId] || '0/0';
  }

  getClassicPlayerCount(gameModeName: string): string {
    const idMap: { [key: string]: string } = {
      'SKY WARS': 'skywars',
      'BED WARS': 'bedwars',
      'HUNGER GAMES': 'hungergames',
      'PVP ARENA': 'pvp'
    };
    const serverId = idMap[gameModeName];
    return this.getPlayerCount(serverId);
  }

  getSafeMapUrl(): SafeResourceUrl | null {
    const server = this.getSelectedServer();
    if (server.mapUrl) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(server.mapUrl);
    }
    return null;
  }

  onMapError(): void {
    this.mapLoaded.set(false);
  }

  private showCopyNotification(message: string): void {
    this.notificationMessage.set(message);
    this.showNotification.set(true);

    setTimeout(() => {
      this.showNotification.set(false);
    }, 2000);
  }

  // Classic Server IP/Port Copy Methods
  copyClassicIP(): void {
    const classicIP = 'classic.tropicaliacraft.net';
    navigator.clipboard.writeText(classicIP).then(() => {
      this.showCopyNotification('IP Clássico copiado! ✓');
    });
  }

  copyClassicPort(): void {
    const classicPort = '25755';
    navigator.clipboard.writeText(classicPort).then(() => {
      this.showCopyNotification('Porta Clássica copiada! ✓');
    });
  }

  // Game Launch Methods
  launchClassicGame(): void {
    // Launch Classic Minecraft 1.8 using tropicalia:// protocol
    window.location.href = 'tropicalia://classic.tropicaliacraft.net:25755';
  }

  playClassicOnline(): void {
    // Open Eaglercraft (Pixel Client) in new tab
    window.open('https://eaglercraft.tropicaliacraft.net', '_blank');
  }

  playOnline(): void {
    // Open PrismarineClient for 1.21 servers in new tab
    window.open('https://prismarine.tropicaliacraft.net', '_blank');
  }
}
