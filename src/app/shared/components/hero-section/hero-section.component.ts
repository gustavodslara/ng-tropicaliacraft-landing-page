import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

interface Cloud {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  originalY: number;
  floatOffset: number;
}

@Component({
  selector: 'app-hero-section',
  imports: [CommonModule],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss'
})
export class HeroSectionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cloudCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  tagline = input.required<string>();
  playClicked = output<void>();

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private clouds: Cloud[] = [];
  private animationId?: number;

  ngOnInit(): void {
    // Component initialization handled in AfterViewInit
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createClouds();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  onPlayClick(): void {
    this.playClicked.emit();
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent background

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    this.camera.position.y = 2;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
  }

  private createClouds(): void {
    // Create multiple clouds
    for (let i = 0; i < 8; i++) {
      const cloud = this.createCloud(i);
      this.clouds.push(cloud);
      this.scene.add(cloud.mesh);
    }
  }

  private createCloud(index: number): Cloud {
    const cloudGroup = new THREE.Group();

    // Minecraft cloud colors (white with slight variations for depth)
    const topMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const sideMaterial = new THREE.MeshBasicMaterial({ color: 0xEEEEEE });
    const bottomMaterial = new THREE.MeshBasicMaterial({ color: 0xDDDDDD });

    // Random cloud shape with Minecraft blocks
    const blocks: Array<{x: number, y: number, z: number}> = [];
    const baseSize = 3 + Math.random() * 2;

    for (let x = 0; x < baseSize; x++) {
      for (let z = 0; z < baseSize; z++) {
        if (Math.random() > 0.3) {
          blocks.push({
            x: x - baseSize / 2,
            y: 0,
            z: z - baseSize / 2
          });
        }
        if (Math.random() > 0.7) {
          blocks.push({
            x: x - baseSize / 2,
            y: 1,
            z: z - baseSize / 2
          });
        }
      }
    }

    // Create cubes for each block
    const blockSize = 2.2;
    blocks.forEach(pos => {
      const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
      const materials = [
        sideMaterial.clone(),
        sideMaterial.clone(),
        topMaterial.clone(),
        bottomMaterial.clone(),
        topMaterial.clone(),
        sideMaterial.clone()
      ];
      const cube = new THREE.Mesh(geometry, materials);
      cube.position.set(pos.x * blockSize, pos.y * blockSize, pos.z * blockSize);
      cloudGroup.add(cube);
    });

    const scale = 0.8 + Math.random() * 0.4;
    cloudGroup.scale.set(scale, scale, scale);

    // Position clouds
    const spread = 80;
    cloudGroup.position.x = (Math.random() - 0.5) * spread;
    cloudGroup.position.y = 5 + Math.random() * 15;
    cloudGroup.position.z = -150 - Math.random() * 100;

    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      0,
      0.15 + Math.random() * 0.1
    );

    const mesh = cloudGroup as any;

    return {
      mesh,
      velocity,
      originalY: cloudGroup.position.y,
      floatOffset: Math.random() * Math.PI * 2
    };
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    this.clouds.forEach((cloud, index) => {
      // Move clouds forward
      cloud.mesh.position.z += cloud.velocity.z;
      cloud.mesh.position.x += cloud.velocity.x;

      // Floating animation
      cloud.floatOffset += 0.01;
      cloud.mesh.position.y = cloud.originalY + Math.sin(cloud.floatOffset) * 0.5;

      // Fade effect based on distance
      const horizonStart = -250;
      const horizonEnd = -150;
      const nearStart = 20;
      const nearEnd = 50;

      let opacity = 1;
      if (cloud.mesh.position.z < horizonEnd) {
        opacity = Math.max(0, (cloud.mesh.position.z - horizonStart) / (horizonEnd - horizonStart));
      } else if (cloud.mesh.position.z > nearStart) {
        opacity = Math.max(0, 1 - (cloud.mesh.position.z - nearStart) / (nearEnd - nearStart));
      }

      cloud.mesh.traverse((child: any) => {
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat: any) => mat.opacity = opacity);
          } else {
            child.material.opacity = opacity;
          }
        }
      });

      // Reset cloud position when it passes
      if (cloud.mesh.position.z > 60) {
        cloud.mesh.position.z = -250 - Math.random() * 50;
        cloud.mesh.position.x = (Math.random() - 0.5) * 80;
        cloud.floatOffset = Math.random() * Math.PI * 2;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }
}
