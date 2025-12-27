
import { Injectable, Renderer2, RendererFactory2, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private authService = inject(AuthService);

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  applyTheme(themeName: string): void {
    const html = document.documentElement;
    
    if (themeName && themeName !== 'default') {
      this.renderer.setAttribute(html, 'data-theme', themeName);
    } else {
      this.renderer.removeAttribute(html, 'data-theme');
    }
    
    localStorage.setItem('selectedTheme', themeName);
  }

  applyUserTheme(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && currentUser.theme) {
      this.applyTheme(currentUser.theme);
    } else {
      const savedTheme = localStorage.getItem('selectedTheme');
      if (savedTheme) {
        this.applyTheme(savedTheme);
      }
    }
  }

  getCurrentTheme(): string {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.theme) {
      return currentUser.theme;
    }
    return localStorage.getItem('selectedTheme') || 'default';
  }

  getThemeColors(themeName: string): { primary: string; secondary: string } | null {
    const themeColors: { [key: string]: { primary: string; secondary: string } } = {
      green: { primary: '#065F46', secondary: '#047857' },
      blue: { primary: '#1E40AF', secondary: '#2563EB' },
      pink: { primary: '#9F1239', secondary: '#BE123C' },
      orange: { primary: '#9A3412', secondary: '#C2410C' },
      dark: { primary: '#1F2937', secondary: '#374151' },
      cyberpunk: { primary: '#7C3AED', secondary: '#A855F7' }
    };

    return themeColors[themeName] || null;
  }
}