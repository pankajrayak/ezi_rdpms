import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, SidebarComponent } from '@rdpms/layouts';

@Component({
  selector: 'user-component',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './user-component.html',
  styleUrl: './user-component.css',
})
export class UserComponent {}
