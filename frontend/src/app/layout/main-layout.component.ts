import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="layout-root">
      <app-navbar></app-navbar>
      <div class="layout-body">
        <app-sidebar></app-sidebar>
        <main class="layout-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-root {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .layout-body {
      display: flex;
      flex: 1;
    }
    .layout-content {
      flex: 1;
      padding: 1.75rem 2rem;
      background-color: var(--surface-page, #f6f8fc);
      overflow-x: hidden;
      min-width: 0;
    }
  `]
})
export class MainLayoutComponent {}
