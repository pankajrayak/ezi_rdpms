import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, SidebarComponent } from '@rdpms/shared/components';
import { USER_ROUTES } from '../../routes';

@Component({
  selector: 'user-component',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './user-component.html',
  styleUrl: './user-component.css',
})
export class UserComponent {

  routeConfig = USER_ROUTES[0]?.children || [];
}
