import { Component } from '@angular/core';
import { SidebarComponent } from '../../layouts/sidebar-component/sidebar-component';
import { HeaderComponent } from '../../layouts/header-component/header-component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'user-component',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './user-component.html',
  styleUrl: './user-component.css',
})
export class UserComponent {}
