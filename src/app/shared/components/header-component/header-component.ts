import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BsThemeService } from '@rdpms/services';

@Component({
  selector: 'header-component',
  imports: [],
  templateUrl: './header-component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
