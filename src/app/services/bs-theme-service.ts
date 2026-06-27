import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class BsThemeService {

  renderer!: Renderer2;
  currentTheme: 'light' | 'dark' = 'light';  
  
  constructor(rendererFactory :RendererFactory2){
    this.renderer = rendererFactory.createRenderer(null, null);
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
