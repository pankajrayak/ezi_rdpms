import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-asset-component',
  imports: [RouterOutlet],
  templateUrl: './asset-component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './asset-component.scss',
})
export class AssetComponent {}
