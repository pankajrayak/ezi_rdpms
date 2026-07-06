import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { BsThemeService } from '@rdpms/services';

@Component({
  selector: 'header-component',
  imports: [],
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
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
