import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from './core/services/loading-service';
import { InactivityService } from './core/services/inactivity-service';
import { AsyncPipe } from '@angular/common';
import { ToastComponent } from './shared/components/toast-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  // Injecting services here starts the service constructor logic
  protected incativityService = inject(InactivityService);
  protected loadingService = inject(LoadingService);

}
