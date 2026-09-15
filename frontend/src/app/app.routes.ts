import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';
import { SearchComponent } from './features/search/search.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LeadsListComponent } from './features/leads/leads-list.component';
import { LeadsKanbanComponent } from './features/leads/leads-kanban.component';
import { SettingsComponent } from './features/settings/settings.component';
import { SiteDemoPublicComponent } from './features/demo/site-demo-public.component';

export const routes: Routes = [
  { path: 'demo/:id', component: SiteDemoPublicComponent },
  { path: 'demo', component: SiteDemoPublicComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'search', pathMatch: 'full' },
      { path: 'search', component: SearchComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'leads', component: LeadsListComponent },
      { path: 'kanban', component: LeadsKanbanComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: 'search' }
];
