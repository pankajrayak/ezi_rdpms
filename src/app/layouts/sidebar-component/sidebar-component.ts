import { CommonModule } from '@angular/common';
import { Route, Router, RouterLink, RouterLinkActive, Routes } from '@angular/router';
import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';

@Component({
  selector: 'sidebar-component',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.css',
  styles: [` `],
})
export class SidebarComponent implements OnInit {

  @Input() parentRoute!: string;
  @Input() routeConfig!: Routes;
  menus!: any[];


  constructor(private router: Router, private cdr: ChangeDetectorRef) {
  
  }

  async ngOnInit() {
    if(!this.parentRoute || !this.routeConfig){ return; }

    this.menus = await this.buildMenu(this.parentRoute, this.routeConfig);
    this.cdr.detectChanges();
    console.log(this.menus);
  }

  async buildMenu(baseUrl: string, routes: Routes): Promise<any[]> {
    return await Promise.all(
      routes.filter((route: Route) => route.data?.['menu'])
        .map(async (route: Route) => ({
          order: route?.data?.['order'],
          title: route?.data?.['title'],
          icon: route?.data?.['icon'],
          path: `/${baseUrl}/${route.path}`,
          children: await this.loadChildren(baseUrl, route)
        }))
    )
    // .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) );
  }

  private async loadChildren(baseUrl: string, route: Route): Promise<any[]> {
    if (!route.loadChildren) return [];

    const childRoutes = await route.loadChildren();
    const children = Array.isArray(childRoutes) ? (childRoutes[0].children || [] ) : [];
    
    return children.filter((child: Route) => child.data?.['menu'])
      .map((child: Route) => ({
        order: child?.data?.['order'],
        title: child?.data?.['title'],
        icon: child?.data?.['icon'],
        path: `/${baseUrl}/${route.path}/${child.path}`
      }))
      // .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  }


  buildMenus(baseUrl: string, routes: Routes): any[] {
    return routes.filter((route: Route) => route.data?.['menu'])
      .map((route: Route) => ({
        order: route.data?.['order'],
        title: route.data?.['title'],
        icon: route.data?.['icon'],
        path: `/${baseUrl}/${route.path}`,
        children: this.getStaticChildren(baseUrl, route)
      }))
      // .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  getStaticChildren(baseUrl: string, route: Route): any[] {
    const children = route.children || [];

    return children.filter((child: Route) => child.data?.['menu'])
      .map((child: Route) => ({
        order: child.data?.['order'],
        title: child.data?.['title'],
        icon: child.data?.['icon'],
        path: `/${baseUrl}/${route.path}/${child.path}`
      }))
      // .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

}