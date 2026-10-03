import { Component, inject } from '@angular/core';
import { BsThemeService } from '@rdpms/core/services';

@Component({
  selector: 'header-component',
  imports: [],
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss',
})
export class HeaderComponent {
  themeService = inject(BsThemeService);

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  get currentTheme() {
    return this.themeService.getCurrentTheme();
  }
}
