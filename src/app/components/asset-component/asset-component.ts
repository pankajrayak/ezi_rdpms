import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'asset-component',
  imports: [RouterOutlet],
  templateUrl: './asset-component.html',
  styleUrl: './asset-component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AssetComponent {}
