import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sensor-component',
  imports: [RouterOutlet],
  templateUrl: './sensor-component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sensor-component.scss',
})
export class SensorComponent {}
