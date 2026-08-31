import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectorRef, Component, inject, input, OnInit, signal } from '@angular/core';
import { Route, RouterLink, RouterLinkActive, Routes } from '@angular/router';
import { AuthService } from '@rdpms/services';

@Component({
  selector: 'sidebar-component',
  imports: [CommonModule, RouterLink, RouterLinkActive, NgOptimizedImage],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.scss',
  host: {
    // 'style': "min-width: 240px;",
    'id': "sidebarMenu",
    'tabindex': "-1",
    'data-bs-scroll': "true" ,
    'data-bs-theme': "dark",
    'aria-labelledby': "sidebarMenuLabel",
    'class': "offcanvas-xl offcanvas-end h-100 border-end bg-body text-body",
  }
})
export class SidebarComponent implements OnInit {

  public authService = inject(AuthService);

  isToggle = signal<boolean>(false); 
  parentRoute = input<string>();
  routeConfig = input<Routes>();
  menus!: any[];

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    const currentRoute = this.parentRoute();
    const currentConfig = this.routeConfig();

    if (!currentRoute || !currentConfig) { return; }

    this.menus = await this.buildMenu(currentRoute, currentConfig);
    this.cdr.detectChanges();
  }

  async buildMenu(baseUrl: string, routes: Routes): Promise<any[]> {
    return await Promise.all(
      routes
        .filter((route: Route) => route.data?.['menu'])
        .map(async (route: Route) => ({
          order: route?.data?.['order'],
          title: route?.data?.['title'],
          icon: route?.data?.['icon'],
          path: `/${baseUrl}/${route.path}`,
          children: await this.loadChildrenRoute(baseUrl, route),
        })),
    );
    // .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) );
  }

  private async loadChildrenRoute(baseUrl: string, route: Route): Promise<any[]> {
    let children: Routes = [];

    if (route.children) {
      children = this.extractRouteArray(route.children);
    } else if (route.loadChildren) {
      children = this.extractRouteArray(await route.loadChildren());
    }

    return children
      .filter((child: Route) => child.data?.['menu'])
      .map((child: Route) => ({
        order: child?.data?.['order'],
        title: child?.data?.['title'],
        icon: child?.data?.['icon'],
        path: `/${baseUrl}/${route.path}/${child.path}`,
      }));
    // .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  }

  private extractRouteArray(childRoutes: any = []): Routes {
    if (Array.isArray(childRoutes)) {
      return childRoutes[0].children ? childRoutes[0].children : childRoutes;
    }
    return childRoutes;
  }

  toggleSidebar() {
    this.isToggle.update(value => !value); 
  }
}
