import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, Routes } from '@angular/router';

@Component({
  selector: 'sidebar-component',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.css',
  styles: [` `],
})
export class SidebarComponent implements OnInit {

  menus: any[] = [];

  constructor(private router: Router) {}

  async ngOnInit() {
    this.menus = await this.buildMenu(this.router.config);
    console.log(this.menus);
  }

  async buildMenu(routes: Routes) {

    const userRoute: any = routes.find(r => r.path === 'user');
    const loadedRoutes = await userRoute.loadChildren();
    const rootChildren = loadedRoutes[0].children || [];
    const menus = [];

    for (const route of rootChildren) {
      if(!route.data?.menu){ continue; }
      const menu = await this.createMenu(route);
      menus.push(menu);
    }

    return menus
    // .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) );
  }

  async createMenu(route: any){
    const menu: any = {
      order: route.data.order,
      title: route.data.title,
      icon: route.data.icon,
      path: route.path,
      children: []
    };

    if(route.loadChildren) {
      const childRoutes = await route.loadChildren();
      const children = childRoutes[0].children || [];

      menu.children = children
        .filter((child: any) => child.data?.menu)
        .map((child: any) => ({
          order: child.data.order,
          title: child.data.title,
          icon: child.data.icon,
          path: `/user/${route.path}/${child.path}`
        }))
        // .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    }
    return menu
  }
}