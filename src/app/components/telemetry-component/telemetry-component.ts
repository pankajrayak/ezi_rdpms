import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-telemetry-component',
  imports: [RouterOutlet],
  templateUrl: './telemetry-component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './telemetry-component.scss',
})
export class TelemetryComponent {}
