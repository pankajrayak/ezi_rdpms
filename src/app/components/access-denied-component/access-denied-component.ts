import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'access-denied-component',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="d-flex flex-column justify-content-center align-items-center h-100">
      <h1 class="text-center">Access Denied</h1>
      <p class="text-center">You do not have the required permissions to view this page.</p>
      <a routerLink="/user" class="text-center text-decoration-none">Back to Home</a>
    </div>
  `,
})
export class AccessDeniedComponent {}
