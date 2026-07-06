import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'telemetry-component',
  imports: [RouterOutlet],
  templateUrl: './telemetry-component.html',
  styleUrl: './telemetry-component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TelemetryComponent {}
