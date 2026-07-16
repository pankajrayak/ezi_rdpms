import { inject, Renderer2, RendererFactory2, Service } from '@angular/core';

@Service()
export class BsThemeService {

  renderer!: Renderer2;
  currentTheme: 'light' | 'dark' = 'light';  
  rendererFactory = inject(RendererFactory2);
  
  constructor(){
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.loadInitialTheme();
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  loadInitialTheme() {
    const savedTheme = localStorage.getItem('rdpms-theme') as 'light' | 'dark' | null;

    if(savedTheme){
        this.setTheme(savedTheme);
    }else{
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  setTheme(theme: 'light' | 'dark'){
    this.currentTheme = theme;
    this.renderer.setAttribute(document.documentElement, 'data-bs-theme', theme);
    localStorage.setItem('rdpms-theme', theme);
  }

  toggleTheme(){
    const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme);
  }

}
