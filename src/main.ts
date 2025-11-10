import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Wait for fonts to load before showing content with timeout
async function loadFonts() {
  const FONT_LOAD_TIMEOUT = 2000; // Maximum 2 seconds wait
  
  if ('fonts' in document) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.warn('Font loading timeout, showing content anyway');
          resolve();
        }, FONT_LOAD_TIMEOUT);
      });
      
      // Wait for critical fonts to load OR timeout
      const fontLoadPromise = Promise.all([
        document.fonts.load('1em Minecraft'),
        document.fonts.load('1em MinecraftSignText'),
        document.fonts.load('1em "Press Start 2P"')
      ]);
      
      await Promise.race([fontLoadPromise, timeoutPromise]);
      
      // Mark fonts as loaded
      document.body.classList.add('fonts-loaded');
    } catch (error) {
      console.warn('Font loading failed, showing content anyway:', error);
      // Show content even if fonts fail to load (graceful degradation)
      document.body.classList.add('fonts-loaded');
    }
  } else {
    // Browser doesn't support Font Loading API, show content after short delay
    setTimeout(() => {
      document.body.classList.add('fonts-loaded');
    }, 500);
  }
}

// Bootstrap the application
bootstrapApplication(App, appConfig)
  .then(() => {
    // Load fonts after app initialization
    loadFonts();
  })
  .catch((err) => console.error(err));
