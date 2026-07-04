import { CommonModule } from '@angular/common';
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'page-header',
  imports: [CommonModule],
  templateUrl: './page-header-component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './page-header-component.scss',
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
  icon = input.required<string>();
  isLive = input<boolean>(false);

  // Outputs for Actions
  onPrint = output<void>();
}
