import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'access-denied-component',
  imports: [RouterLink],
  template: `
    <div class="d-flex flex-column flex-md-row justify-content-center align-items-center">
      <h1>Access Denied</h1>
      <p>You do not have the required permissions to view this page.</p>
      <a routerLink="/home" class=text-decoration-none>Back to Home</a>
    </div>
  `
})
export class AccessDeniedComponent {}
