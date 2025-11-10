import { Component, signal, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import * as THREE from 'three';
import {
  FeatureCard,
  ClassicGameMode,
  DownloadsModalComponent,
  DownloadItem,
  DownloadVersion,
  ModInfo,
  DownloadItemInfo,
  VipTier,
  InfiniteScrollFeaturesComponent,
  InfiniteScrollServerFeaturesComponent
} from '../shared/components';
import { ModalCloseButtonComponent } from '../shared/components/modal-close-button/modal-close-button.component';

interface ServerImage {
  url: string;
  title: string;
  borderColor: string;
}

interface ServerFeature {
  image: string;
  label: string;
  route?: string; // Internal Angular route (e.g., '/products')
  href?: string; // External link (e.g., 'https://ecraft.tropicaliacraft.online')
  target?: '_blank' | '_self'; // Target for href links
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
  imports: [
    CommonModule,
    DownloadsModalComponent,
    ModalCloseButtonComponent,
    InfiniteScrollFeaturesComponent,
    InfiniteScrollServerFeaturesComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cloudCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private clouds: Cloud[] = [];
  private animationId?: number;

  // Terrain rendering
  private terrainGroup?: THREE.Group;
  private waterMesh?: THREE.Mesh;
  private textures: {
    stone?: THREE.Texture;
    sand?: THREE.Texture;
  } = {};
  private terrainConfig = {
    blockSize: 1.0,
    width: 400,   // columns in X (extremely wide to cover all view angles)
    depth: 400,   // columns in Z (extremely deep to ensure no blank space)
    waterLevel: 0,
    baseY: -4   // vertical offset to keep terrain in lower part of the screen
  };
  private cameraPanT = 0; // param for subtle camera pan like Minecraft menu

  // Server tabs
  selectedServerTab = signal(1); // Start with middle tab (index 1)

  // Server status
  serverStatus = signal<ServerStatus>({
    online: false
  });
  isLoadingStatus = signal(false);
  isLoadingPlayerCounts = signal(true);
  isInitialLoad = signal(true);
  isThreeJSReady = signal(false);
  isContentReady = signal(false); // Master flag for all content

  servers: ServerInfo[] = [
    {
      id: 'survival',
      name: 'JAVA MODS',
      icon: '⚔️',
      ip: 'mods.tropicaliacraft.online',
      port: '25565',
      mapUrl: '',
      description: 'Servidor JAVA com modificações únicas!',
      imageUrl: '/images/javamods.jpg',
      protocolUrl: 'tropicalia://mods.tropicaliacraft.online:25565',
      hasOnlineTest: true,
      platformInfo: 'Windows, Linux e Mac (Java Edition)',
      tags: [
        { icon: '💻', label: 'Apenas PC' },
        { icon: '🔧', label: 'Mods', highlight: true },
        { icon: '🌲', label: 'Sobrevivência' },
        { icon: '🎨', label: 'Criativo' }
      ],
      features: [
        { image: '/images/server-features/amethyst-android.png', label: 'Amethyst Android',href: 'https://github.com/gustavodslara/Amethyst-Android/releases/download/TropicaliaCraft/app-debug.apk', target: '_blank'},
        { image: '/images/server-features/java.png', label: 'Java Edition' },
        { image: '/images/server-features/prism-tropicalia-logo.png', label: 'Tropicalia Launcher' },
        { image: '/images/server-features/vivecraft.png', label: 'Suporte ao ViveCraft' },
        { image: '/images/server-features/create.png', label: 'Mods' },
        { image: '/images/server-features/fabric.png', label: 'Fabric' },
        { image: '/images/server-features/survival.jpg', label: 'Sobrevivência' },
        { image: '/images/server-features/creative.jpg', label: 'Criativo' },
        { image: '/images/server-features/amethyst-android.png', label: 'Jogue no Celular' },
        { image: '/images/server-features/java.png', label: 'Java Edition' },
        { image: '/images/server-features/prism-tropicalia-logo.png', label: 'Tropicalia Launcher' },
        { image: '/images/server-features/vivecraft.png', label: 'Suporte ao ViveCraft' },
        { image: '/images/server-features/create.png', label: 'Mods' },
        { image: '/images/server-features/fabric.png', label: 'Fabric' },
        { image: '/images/server-features/survival.jpg', label: 'Sobrevivência' },
        { image: '/images/server-features/creative.jpg', label: 'Criativo' },
      ]
    },
    {
      id: 'skyblock',
      name: 'CROSS-PLAY',
      icon: '🏝️',
      ip: 'localhost',
      port: '25565',
      mapUrl: 'http://127.0.0.1:5501/index.html?world=world&renderer=vintage_story&zoom=0&x=-34&z=83',
      description: 'Servidor Principal! PC + Celular + Consoles',
      imageUrl: '/images/javabedrock.jpg',
      protocolUrl: 'tropicalia://crossplay.tropicaliacraft.online:25565',
      hasOnlineTest: true,
      platformInfo: 'PC + Celular + Consoles (Cross-Play Java & Bedrock)',
      tags: [
        { icon: '🎮', label: 'Multiplataforma', highlight: true },
        { icon: '🎯', label: 'Minigames', highlight: true },
        { icon: '🌲', label: 'Sobrevivência' },
        { icon: '🎨', label: 'Criativo' }
      ],
      features: [
        { image: '/images/server-features/java.png', label: 'Java Edition' },
        { image: '/images/server-features/bedrock.jpg', label: 'Bedrock Edition' },
        { image: '/images/server-features/pvp.png', label: 'PVP' },
        { image: '/images/server-features/ecraft.png', label: 'Jogue no Browser', href: 'https://ecraft.tropicaliacraft.online', target: '_blank' },
        { image: '/images/server-features/crossplay.png', label: 'Cross-Play' },
        { image: '/images/server-features/vivecraft.png', label: 'Suporte ao ViveCraft' },
        { image: '/images/server-features/hungergames.png', label: 'Hunger Games' },
        { image: '/images/server-features/minigames.png', label: 'Minigames' },
        { image: '/images/server-features/survival.jpg', label: 'Sobrevivência' },
        { image: '/images/server-features/spleef.png', label: 'Spleef' },
        { image: '/images/server-features/creative.jpg', label: 'Criativo' },
        { image: '/images/server-features/bedrock.jpg', label: 'Jogue no Celular' },
        { image: '/images/server-features/ecraft.png', label: 'EaglerCraft', href: 'https://ecraft.tropicaliacraft.online', target: '_blank' },
        { image: '/images/server-features/vivecraft.png', label: 'Realidade Virtual' },
        { image: '/images/server-features/java.png', label: 'Java Edition' },
        { image: '/images/server-features/bedrock.jpg', label: 'Jogue no Celular' },
        { image: '/images/server-features/pvp.png', label: 'PVP' },
        { image: '/images/server-features/vivecraft.png', label: 'Suporte ao ViveCraft' },
        { image: '/images/server-features/hungergames.png', label: 'Hunger Games' },
        { image: '/images/server-features/minigames.png', label: 'Minigames' },
        { image: '/images/server-features/survival.jpg', label: 'Sobrevivência' },
        { image: '/images/server-features/spleef.png', label: 'Spleef' },
        { image: '/images/server-features/creative.jpg', label: 'Criativo' },
      ]
    },
    {
      id: 'creative',
      name: 'BEDROCK ADDONS',
      icon: '🎨',
      ip: 'addons.tropicaliacraft.online',
      port: '25565',
      mapUrl: '',
      description: 'Servidor BEDROCK com addons',
      imageUrl: '/images/bedrockaddos.jpg',
      protocolUrl: 'tropicalia://addons.tropicaliacraft.online:25565',
      hasOnlineTest: false,
      platformInfo: 'Celular + Consoles (Bedrock Edition)',
      tags: [
        { icon: '📱', label: 'Celular & Consoles' },
        { icon: '🛒', label: 'Marketplace Addons', highlight: true },
        { icon: '🌲', label: 'Sobrevivência' },
        { icon: '🎨', label: 'Criativo' }
      ],
      features: [
        { image: '/images/server-features/bedrock.jpg', label: 'Bedrock Edition' },
        { image: '/images/server-features/addons.png', label: 'Addons' },
        { image: '/images/server-features/psbtn.png', label: 'PlayStation' },
        { image: '/images/server-features/xboxbtn.png', label: 'Xbox' },
        { image: '/images/server-features/pvp.png', label: 'PVP' },
        { image: '/images/server-features/survival.jpg', label: 'Sobrevivência' },
        { image: '/images/server-features/creative.jpg', label: 'Criativo' },
        { image: '/images/server-features/bedrock.jpg', label: 'Jogue no Celular' },
        { image: '/images/server-features/addons.png', label: 'Addons' },
        { image: '/images/server-features/psbtn.png', label: 'PlayStation' },
        { image: '/images/server-features/xboxbtn.png', label: 'Xbox' },
        { image: '/images/server-features/pvp.png', label: 'PVP' },
        { image: '/images/server-features/survival.jpg', label: 'Sobrevivência' },
        { image: '/images/server-features/creative.jpg', label: 'Criativo' },
      ]
    }
  ];

  serverIP = signal('minecraft.tropicaliacraft.online');
  serverPort = signal('25565');
  mobileMenuOpen = signal(false);
  showNotification = signal(false);
  notificationMessage = signal('');
  mapLoaded = signal(true);
  useLocalMap = signal(false); // Fallback to local map on error
  mapLoadTimeout?: number; // Timeout for detecting failed map loads

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
  showDownloadsModal = signal(false);

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  openVipModal() {
    this.showVipModal.set(true);
    this.closeMobileMenu();
  }

  closeVipModal() {
    this.showVipModal.set(false);
  }

  openDownloadsModal() {
    this.showDownloadsModal.set(true);
    this.closeMobileMenu();
  }

  closeDownloadsModal() {
    this.showDownloadsModal.set(false);
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

  bfeatures: VipTier[] = [
    {
      title: 'FERRO',
      description: 'Kit inicial semanal • /home set (3 casas) • Acesso a warps VIP • Prefixo [FERRO] no chat',
      price: 'R$ 19,90'
    },
    {
      title: 'OURO',
      description: 'Tudo do Ferro + Kit diário • /home set (5 casas) • /fly nas terras • Prefixo [OURO] no chat • Desconto 15% na loja',
      price: 'R$ 39,90'
    },
    {
      title: 'DIAMANTE',
      description: 'Tudo do Ouro + Kit a cada 12h • /home set (10 casas) • /fly em todo servidor • Skin personalizada • Partículas exclusivas • Prefixo [💎DIAMANTE] • Desconto 30% na loja • Acesso prioritário',
      price: 'R$ 79,90'
    }
  ];
  features: FeatureCard[] = [
    {
      title: 'MODO CRIATIVO',
      description: 'Solte sua imaginação sem limites',
      image: '/images/gifs/creative_building2.gif',
      color: 'orange',
      route: '/'
    },
    {
      title: 'SPLEEF',
      description: 'Quebre blocos e derrube seus oponentes',
      image: '/images/gifs/spleef2.gif',
      color: 'blue',
      route: '/'
    },
    {
      title: 'REALIDADE VIRTUAL',
      description: 'Suporte ao ViveCraft',
      image: '/images/gifs/vivecraft1.gif',
      color: 'green',
      route: '/'
    },
    {
      title: 'AVENTURAS ÉPICAS',
      description: 'Embarque em aventuras inesquecíveis',
      image: '/images/gifs/aventuras.gif',
      color: 'green',
      route: '/'
    },
    {
      title: 'BED WARS',
      description: 'Proteja sua cama e destrua os adversários',
      image: '/images/gifs/bedwars.gif',
      color: 'red',
      route: '/'
    },
    {
      title: 'CONSTRUÇÕES CRIATIVAS',
      description: 'Construa suas criações incríveis',
      image: '/images/gifs/creative_building.gif',
      color: 'orange',
      route: '/'
    },
    {
      title: 'ARTE & CRIATIVIDADE',
      description: 'Crie obras-primas pixeladas',
      image: '/images/gifs/creative_building3.gif',
      color: 'orange',
      route: '/'
    },
    {
      title: 'MINIGAMES & DESAFIOS',
      description: 'Participe de minigames emocionantes',
      image: '/images/gifs/minigame.gif',
      color: 'blue',
      route: '/'
    },
    {
      title: 'ARENA PVP',
      description: 'Combate intenso sem cooldown',
      image: '/images/gifs/pvp.gif',
      color: 'red',
      route: '/'
    },
    {
      title: 'SPLEEF',
      description: 'Quebre blocos e derrube seus oponentes',
      image: '/images/gifs/spleef.gif',
      color: 'blue',
      route: '/'
    },
    {
      title: 'REALIDADE VIRTUAL',
      description: 'Suporte ao ViveCraft',
      image: '/images/gifs/vivecraft2.gif',
      color: 'blue',
      route: '/'
    },

  ];

  // Download items for the downloads modal
  downloadItems: DownloadItem[] = [
    {
      title: 'LAUNCHER DESKTOP',
      description: 'Nosso launcher oficial que instala e atualiza automaticamente o Minecraft com todos os mods necessários. Compatível com todas as plataformas.',
      icon: '🚀',
      downloadUrl: 'https://launcher.tropicaliacraft.online/download',
      version: 'v2.5.0',
      platform: 'Windows • Linux • macOS',
      versions: [
        { version: 'v2.5.0', downloadUrl: 'https://launcher.tropicaliacraft.online/download/v2.5.0' },
        { version: 'v2.4.1', downloadUrl: 'https://launcher.tropicaliacraft.online/download/v2.4.1' },
        { version: 'v2.4.0', downloadUrl: 'https://launcher.tropicaliacraft.online/download/v2.4.0' },
        { version: 'v2.3.2', downloadUrl: 'https://launcher.tropicaliacraft.online/download/v2.3.2' }
      ],
      info: {
        title: 'LAUNCHER DESKTOP - INFORMAÇÕES DETALHADAS',
        description: 'Nosso launcher personalizado facilita o acesso ao servidor com instalação automática de mods e atualizações.',
        features: [
          'Instalação automática do Minecraft e mods necessários',
          'Atualizações automáticas quando há novas versões',
          'Gerenciamento de múltiplos perfis de jogo',
          'Interface intuitiva e fácil de usar',
          'Compatível com Windows, Linux e macOS',
          'Suporte a Java 17 e 21',
          'Sistema de verificação de integridade dos arquivos',
          'Login seguro com autenticação Microsoft/Mojang'
        ]
      }
    },
    {
      title: 'AMETHYST ANDROID',
      description: 'Sucessor do PojavLauncher para Android! Jogue Java Mods no celular com modpacks pré-instalados (Java Mods + Visual/Performance). Tudo configurado e pronto para jogar!',
      icon: '📱',
      downloadUrl: 'https://github.com/TropicaliaCraft/TropicaliaAmethyst/releases/latest',
      version: 'v1.0.3',
      platform: 'Android • Mobile',
      versions: [
        { version: 'v1.0.3', downloadUrl: 'https://github.com/TropicaliaCraft/TropicaliaAmethyst/releases/download/v1.0.3/TropicaliaAmethyst.apk' },
        { version: 'v1.0.2', downloadUrl: 'https://github.com/TropicaliaCraft/TropicaliaAmethyst/releases/download/v1.0.2/TropicaliaAmethyst.apk' },
        { version: 'v1.0.1', downloadUrl: 'https://github.com/TropicaliaCraft/TropicaliaAmethyst/releases/download/v1.0.1/TropicaliaAmethyst.apk' }
      ],
      info: {
        title: 'TROPICALIAAMETHYST - MINECRAFT JAVA NO MOBILE',
        description: 'Launcher móvel baseado no PojavLauncher, pré-configurado com todos os modpacks necessários para jogar no TropicaliaCraft.',
        features: [
          'Fork otimizado do PojavLauncher para Android',
          'Modpack Java Mods pré-instalado',
          'Modpack Visual/Performance incluído',
          'Configuração automática do servidor',
          'Controles otimizados para touch',
          'Suporte a controles externos (Bluetooth)',
          'Compatível com Android 8.0+',
          'Interface personalizada do TropicaliaCraft',
          'Atualizações automáticas de modpacks',
          'Pronto para jogar - sem configuração adicional'
        ]
      }
    },
    {
      title: 'MODPACK JAVA MODS',
      description: 'Modpack completo com Fabric, Forge e todos os mods customizados necessários para jogar no servidor Java Mods. Inclui novos biomas, mobs, itens e mecânicas exclusivas.',
      icon: '🔧',
      downloadUrl: 'https://modpack.tropicaliacraft.online/download/javamods',
      version: 'v1.21',
      platform: 'Java Edition • Servidor Mods',
      versions: [
        { version: 'v1.21', downloadUrl: 'https://modpack.tropicaliacraft.online/download/javamods/v1.21' },
        { version: 'v1.20.6', downloadUrl: 'https://modpack.tropicaliacraft.online/download/javamods/v1.20.6' },
        { version: 'v1.20.4', downloadUrl: 'https://modpack.tropicaliacraft.online/download/javamods/v1.20.4' }
      ],
      info: {
        title: 'MODPACK JAVA MODS - LISTA COMPLETA',
        description: 'Este modpack é obrigatório para jogar no servidor Java Mods. Inclui mods de conteúdo, mecânicas e otimizações.',
        mods: [
          { name: 'Create', icon: '⚙️' },
          { name: 'Farmer\'s Delight', icon: '🍲' },
          { name: 'Biomes O\' Plenty', icon: '🌿' },
          { name: 'Ice and Fire', icon: '🐉' },
          { name: 'Mekanism', icon: '⚡' },
          { name: 'Applied Energistics 2', icon: '💾' },
          { name: 'Tinkers\' Construct', icon: '🔨' },
          { name: 'Botania', icon: '🌺' },
          { name: 'Thermal Expansion', icon: '🔥' },
          { name: 'Industrial Foregoing', icon: '🏭' },
          { name: 'Mystical Agriculture', icon: '🌾' },
          { name: 'Ars Nouveau', icon: '✨' },
          { name: 'Immersive Engineering', icon: '🔧' },
          { name: 'The Twilight Forest', icon: '🌲' },
          { name: 'Alex\'s Mobs', icon: '🦎' },
          { name: 'Aquaculture 2', icon: '🎣' },
          { name: 'Iron Chests', icon: '📦' },
          { name: 'Storage Drawers', icon: '🗄️' },
          { name: 'JEI', icon: '📖' },
          { name: 'WAILA', icon: '👁️' }
        ],
        features: [
          'Mais de 150 mods de conteúdo e gameplay',
          'Novos biomas, dimensões e estruturas',
          'Sistemas de automação avançados',
          'Magia e tecnologia',
          'Compatível apenas com o servidor Java Mods',
          'Otimizado para performance',
          'Instalação via launcher recomendada'
        ]
      }
    },
    {
      title: 'MODPACK VISUAL/PERFORMANCE',
      description: 'Modpack leve focado em melhorias visuais, performance e qualidade de vida. Não altera o comportamento padrão do Minecraft. Compatível com todos os servidores.',
      icon: '✨',
      downloadUrl: 'https://modpack.tropicaliacraft.online/download/visual',
      version: 'v1.21',
      platform: 'Java Edition • Todos Servidores',
      versions: [
        { version: 'v1.21', downloadUrl: 'https://modpack.tropicaliacraft.online/download/visual/v1.21' },
        { version: 'v1.20.6', downloadUrl: 'https://modpack.tropicaliacraft.online/download/visual/v1.20.6' },
        { version: 'v1.20.4', downloadUrl: 'https://modpack.tropicaliacraft.online/download/visual/v1.20.4' }
      ],
      info: {
        title: 'MODPACK VISUAL/PERFORMANCE - MODS INCLUÍDOS',
        description: 'Modpack opcional que melhora os gráficos e performance sem alterar o gameplay. Compatível com todos os servidores.',
        mods: [
          { name: 'Sodium', icon: '🚀' },
          { name: 'Iris Shaders', icon: '🌈' },
          { name: 'Lithium', icon: '⚡' },
          { name: 'Phosphor', icon: '💡' },
          { name: 'FerriteCore', icon: '🧲' },
          { name: 'Entity Culling', icon: '👁️' },
          { name: 'Dynamic FPS', icon: '📊' },
          { name: 'Mod Menu', icon: '⚙️' },
          { name: 'Xaero\'s Minimap', icon: '🗺️' },
          { name: 'Xaero\'s World Map', icon: '🌍' },
          { name: 'AppleSkin', icon: '🍎' },
          { name: 'Better Third Person', icon: '📷' },
          { name: 'Better F3', icon: '📝' },
          { name: 'Continuity', icon: '🔗' },
          { name: 'LambDynamicLights', icon: '🔦' },
          { name: 'Presence Footsteps', icon: '👣' },
          { name: 'Sound Physics', icon: '🔊' },
          { name: 'Falling Leaves', icon: '🍂' },
          { name: 'Animatica', icon: '🎬' },
          { name: 'CIT Resewn', icon: '🎨' }
        ],
        features: [
          'Aumento significativo de FPS (60-200%)',
          'Suporte a shaders com Iris',
          'Minimapa e worldmap integrados',
          'Iluminação dinâmica',
          'Física de som realista',
          'Melhorias visuais sutis',
          'Não altera mecânicas do jogo',
          'Compatível com todos os servidores',
          'Leve e otimizado'
        ]
      }
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

  constructor(private sanitizer: DomSanitizer, private http: HttpClient) { }

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

    // Check if fonts are loaded (set by main.ts)
    const checkFontsLoaded = () => {
      if (document.body.classList.contains('fonts-loaded')) {
        this.isContentReady.set(true);
        this.isInitialLoad.set(false);
      } else {
        // Check again after a short delay
        setTimeout(checkFontsLoaded, 50);
      }
    };

    checkFontsLoaded();
  }

  setRandomTagline(): void {
    const randomIndex = Math.floor(Math.random() * this.taglines.length);
    this.currentTagline.set(this.taglines[randomIndex]);
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createClouds();
    this.animate();

    // Load textures then create the terrain
    this.loadTerrainTextures().then(() => {
      this.createTerrain();
      // Mark Three.js as ready only after terrain is created and first frame is rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.isThreeJSReady.set(true);
        });
      });
    }).catch((error) => {
      console.error('Failed to load terrain textures:', error);
      // Still mark as ready to prevent infinite loading
      this.isThreeJSReady.set(true);
    });
  }


  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    // Clear map load timeout
    if (this.mapLoadTimeout) {
      window.clearTimeout(this.mapLoadTimeout);
    }
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement!;

    if (!canvas || !container) {
      console.error('Canvas or container not found');
      return;
    }

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent background

    // Camera setup - Looking at the horizon (Minecraft POV)
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      5000
    );
    // Position camera closer to front with reduced FOV for tighter view
    this.camera.position.set(-6, 6, 8);
    this.camera.lookAt(new THREE.Vector3(0, 3.5, -120));

    // Strong exponential fog to hide borders and blend with sky
    this.scene.fog = new THREE.FogExp2(0x7ecbff, 0.0035);    // Renderer setup
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

  private loadTerrainTextures(): Promise<void> {
    const loader = new THREE.TextureLoader();

    const load = (url: string) => new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        url,
        (tex) => {
          // Pixelated look
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.magFilter = THREE.NearestFilter;
          tex.minFilter = THREE.NearestMipMapNearestFilter;
          resolve(tex);
        },
        undefined,
        (err) => reject(err)
      );
    });

    const promises = [
      load('/images/stone.jpg').then(t => (this.textures.stone = t)),
      load('/images/small_sand_texture.jpg').then(t => (this.textures.sand = t))
    ];

    return Promise.all(promises).then(() => undefined);
  }

  private makeBlockGeometry(size: number, type: 'sand' | 'stone'): { geometry: THREE.BoxGeometry; material: THREE.Material | THREE.Material[] } {
    const g = new THREE.BoxGeometry(size, size, size);

    const matFromTexture = (tex?: THREE.Texture) => new THREE.MeshBasicMaterial({ map: tex, transparent: false });

    if (type === 'sand') {
      const m = matFromTexture(this.textures.sand);
      return { geometry: g, material: [m, m, m, m, m, m] };
    }
    if (type === 'stone') {
      const m = matFromTexture(this.textures.stone);
      return { geometry: g, material: [m, m, m, m, m, m] };
    }
    // fallback stone
    const m = matFromTexture(this.textures.stone);
    return { geometry: g, material: [m, m, m, m, m, m] };
  }

  private islandStrengthAt(wx: number, wz: number): number {
    const e = (cx: number, cz: number, sx: number, sz: number) => {
      const dx = wx - cx;
      const dz = wz - cz;
      return Math.exp(-(dx * dx) / (2 * sx * sx) - (dz * dz) / (2 * sz * sz));
    };
    // Move islands to the left side
    const e1 = e(-25, -35, 14, 10);
    const e2 = e(-5, -30, 12, 9);
    return e1 + e2; // 0..~2
  }

  private heightAt(wx: number, wz: number): number {
    // Height from island influence; base seabed deeper
    const strength = this.islandStrengthAt(wx, wz); // 0..~2
    const base = -6; // deeper seabed
    const amp = 8;   // taller dunes
    const h = base + amp * Math.min(1, strength); // clamp for pleasant shape
    return Math.floor(h);
  }

  private createTerrain(): void {
    const { blockSize, width, depth, baseY, waterLevel } = this.terrainConfig;

    this.terrainGroup = new THREE.Group();

    // Prepare instanced meshes per block type (sand + stone only)
    const sandGeom = this.makeBlockGeometry(blockSize, 'sand');
    const stoneGeom = this.makeBlockGeometry(blockSize, 'stone');

    // Pre-count instances for allocation
    let sandCount = 0, stoneCount = 0;
    for (let ix = 0; ix < width; ix++) {
      for (let iz = 0; iz < depth; iz++) {
        const wx = ix - width / 2;
        const wz = -iz - 10; // bring terrain very close to camera to fill all foreground
        const h = this.heightAt(wx, wz);
        const strength = this.islandStrengthAt(wx, wz);

        // Skip far-away seafloor to avoid flat sand planes
        if (h < waterLevel - 3 && strength < 0.08) {
          continue;
        }

        // Deeper vertical span to show cliff below islands
        const minY = Math.min(waterLevel - 12, Math.floor(h));
        for (let y = minY; y <= h; y++) {
          // Top 2 layers sand (island), underwater is sand too; deeper is stone
          const isTop = y >= h - 2; // thicker cap
          const nearSurface = y >= waterLevel - 1; // shoreline
          const isIslandArea = strength > 0.12;
          // Only place sand on tops and in shoreline zones near islands; deeper becomes stone
          const type = (isTop || (nearSurface && isIslandArea)) ? 'sand' : 'stone';
          if (type === 'sand') sandCount++; else stoneCount++;
        }
      }
    }

    const sandMesh = new THREE.InstancedMesh(sandGeom.geometry, sandGeom.material as any, Math.max(sandCount, 1));
    const stoneMesh = new THREE.InstancedMesh(stoneGeom.geometry, stoneGeom.material as any, Math.max(stoneCount, 1));

    let isa = 0, isto = 0;
    const mat = new THREE.Matrix4();

    for (let ix = 0; ix < width; ix++) {
      for (let iz = 0; iz < depth; iz++) {
        const wx = ix - width / 2;
        const wz = -iz - 10;
        const h = this.heightAt(wx, wz);
        const strength = this.islandStrengthAt(wx, wz);
        if (h < waterLevel - 3 && strength < 0.08) {
          continue;
        }
        const minY = Math.min(waterLevel - 12, Math.floor(h));
        for (let y = minY; y <= h; y++) {
          const xPos = wx * blockSize;
          const yPos = baseY + y * blockSize;
          const zPos = wz * blockSize;
          mat.makeTranslation(xPos, yPos, zPos);

          const isTop = y >= h - 2;
          const nearSurface = y >= waterLevel - 1;
          const isIslandArea = strength > 0.12;
          const type = (isTop || (nearSurface && isIslandArea)) ? 'sand' : 'stone';
          if (type === 'sand') {
            sandMesh.setMatrixAt(isa++, mat);
          } else if (type === 'stone') {
            stoneMesh.setMatrixAt(isto++, mat);
          }
        }
      }
    }

    sandMesh.instanceMatrix.needsUpdate = true;
    stoneMesh.instanceMatrix.needsUpdate = true;

    this.terrainGroup.add(stoneMesh, sandMesh);

    // Add simple water plane slightly above water level
    const waterGeo = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x3bb0ff, transparent: true, opacity: 0.55, depthWrite: false });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.set(0, baseY + waterLevel * blockSize + 0.05, -800);

    // Group positions: center in view, push along -Z to form horizon
    this.terrainGroup.position.set(0, 0, 0);
    this.scene.add(this.terrainGroup);
    this.scene.add(this.waterMesh);
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

    // Only render if scene, camera, and renderer are initialized
    if (!this.scene || !this.camera || !this.renderer) {
      return;
    }

    // Subtle camera pan like Minecraft menu
    this.cameraPanT += 0.0028; // speed
    const radius = 6;
    const x = -3 + Math.sin(this.cameraPanT) * radius;
    const y = 6 + Math.sin(this.cameraPanT * 0.7) * 0.4; // gentle bob
    this.camera.position.x = x;
    this.camera.position.y = y;
    // Look toward the left side where islands are
    this.camera.lookAt(new THREE.Vector3(-10, 3.5, -50));    // Update each cloud
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

  // Transform servers to ServerTabsComponent format
  getServerTabsData() {
    return this.servers.map(server => ({
      name: server.name,
      image: server.imageUrl,
      ip: server.ip,
      port: server.port,
      protocolUrl: server.protocolUrl,
      id: server.id,
      playerCount: this.getPlayerCount(server.id)
    }));
  }

  selectServerTab(index: number): void {
    this.selectedServerTab.set(index);
    const server = this.servers[index];
    this.serverIP.set(server.ip);
    this.serverPort.set(server.port);
    
    // Clear any existing timeout
    if (this.mapLoadTimeout) {
      window.clearTimeout(this.mapLoadTimeout);
    }
    
    // If server has no map URL, use local map immediately
    if (!server.mapUrl) {
      this.mapLoaded.set(true);
      this.useLocalMap.set(true);
    } else {
      // Check if map URL is localhost/127.0.0.1 - if so, skip external and use local
      const isLocalhost = server.mapUrl.includes('localhost') || server.mapUrl.includes('127.0.0.1');
      
      if (isLocalhost) {
        console.warn('Map URL is localhost, using local map immediately');
        this.mapLoaded.set(true);
        this.useLocalMap.set(true);
      } else {
        this.mapLoaded.set(true);
        this.useLocalMap.set(false); // Reset to try external map first
        
        // Set a timeout to fallback to local map if external map doesn't load
        // This catches connection refused, timeouts, and other loading failures
        this.mapLoadTimeout = window.setTimeout(() => {
          // If still trying to load external map after 2 seconds, switch to local
          if (!this.useLocalMap()) {
            console.warn('External map failed to load within timeout, switching to local map');
            this.useLocalMap.set(true);
          }
        }, 2000); // 2 second timeout (faster fallback)
      }
    }

    // Fetch server status
    this.fetchServerStatus(server.ip, server.port);
  }

  fetchServerStatus(ip: string, port: string): void {
    this.isLoadingStatus.set(true);

    // Using mcsrvstat.us API for Minecraft server status
    const apiUrl = `https://api.mcsrvstat.us/3/${ip}:${port}`;

    this.http.get(apiUrl, { responseType: 'text' }).subscribe({
      next: (response) => {
        try {
          const data = JSON.parse(response);
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
        } catch (parseError) {
          console.error('Error parsing server status JSON:', parseError);
          console.log('Raw response:', response);
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

    // Set loading to false after first fetch attempt
    setTimeout(() => {
      this.isLoadingPlayerCounts.set(false);
    }, 2000);
  }

  fetchPlayerCount(serverId: string, ip: string, port: string): void {
    const apiUrl = `https://api.mcsrvstat.us/3/${ip}:${port}`;

    this.http.get(apiUrl, { responseType: 'text' }).subscribe({
      next: (response) => {
        try {
          const data = JSON.parse(response);
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
        } catch (parseError) {
          console.error(`Error parsing player count JSON for ${serverId}:`, parseError);
          console.log('Raw response:', response);
          // Use mocked data when parse fails
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
    
    // If we should use local map or no external map URL, use local map
    if (this.useLocalMap() || !server.mapUrl) {
      // Use local map with default parameters matching the Pl3xMap structure
      const localMapUrl = '/web/index.html?world=world&renderer=vintage_story&zoom=0&x=-34&z=83';
      return this.sanitizer.bypassSecurityTrustResourceUrl(localMapUrl);
    }
    
    // Otherwise use the server's map URL
    if (server.mapUrl) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(server.mapUrl);
    }
    
    return null;
  }

  getExternalMapUrl(): SafeResourceUrl | null {
    const server = this.getSelectedServer();
    if (server.mapUrl) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(server.mapUrl);
    }
    return null;
  }

  onMapError(): void {
    console.warn('External map failed to load (error event), switching to local map');
    
    // Clear timeout since we're handling the error immediately
    if (this.mapLoadTimeout) {
      window.clearTimeout(this.mapLoadTimeout);
    }
    
    this.useLocalMap.set(true);
    // Keep mapLoaded true since we have a fallback
    this.mapLoaded.set(true);
  }

  onMapLoad(): void {
    // Map loaded successfully, cancel the fallback timeout
    if (this.mapLoadTimeout) {
      window.clearTimeout(this.mapLoadTimeout);
    }
    console.log('Map loaded successfully');
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
    const classicIP = 'classic.tropicaliacraft.online';
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
    window.location.href = 'tropicalia://classic.tropicaliacraft.online:25755';
  }

  playClassicOnline(): void {
    // Open Eaglercraft (Pixel Client) in new tab
    window.open('https://ecraft.tropicaliacraft.online', '_blank');
  }

  playOnline(): void {
    // Open Eaglercraft for 1.21 servers in new tab
    window.open('https://ecraft.tropicaliacraft.online', '_blank');
  }
}
