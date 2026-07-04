import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-alert-component',
  imports: [RouterOutlet],
  templateUrl: './alert-component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './alert-component.scss',
})
export class AlertComponent {}
