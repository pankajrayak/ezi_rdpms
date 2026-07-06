import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'alert-component',
  imports: [RouterOutlet],
  templateUrl: './alert-component.html',
  styleUrl: './alert-component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AlertComponent {}
