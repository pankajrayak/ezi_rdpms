import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'sensor-component',
  imports: [RouterOutlet],
  templateUrl: './sensor-component.html',
  styleUrl: './sensor-component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class SensorComponent {}
