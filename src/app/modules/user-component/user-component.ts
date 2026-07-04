import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { USER_ROUTES } from '@rdpms/routes';
import { HeaderComponent, SidebarComponent } from '@rdpms/shared/components';

@Component({
  selector: 'user-component',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './user-component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './user-component.scss',
})
export class UserComponent {
  routeConfig = USER_ROUTES[0]?.children || [];
}
