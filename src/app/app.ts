import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ToastComponent } from './shared/components';
import { LoadingService } from './core/services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Injecting services here starts the service constructor logic
  // protected incativityService = inject(InactivityService);
  protected loadingService = inject(LoadingService);
}
