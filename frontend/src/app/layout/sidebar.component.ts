import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <!-- Nav Items -->
      <nav class="sidebar-nav">
        <div class="nav-section-label">Menu Principal</div>

        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </span>
          <span class="nav-label">Dashboard</span>
        </a>

        <a routerLink="/search" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <span class="nav-label">Buscar Empresas</span>
        </a>

        <a routerLink="/leads" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
          <span class="nav-label">Meus Leads</span>
        </a>

        <a routerLink="/kanban" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="5" height="18"/><rect x="10" y="3" width="5" height="11"/>
              <rect x="17" y="3" width="4" height="15"/>
            </svg>
          </span>
          <span class="nav-label">Pipeline Kanban</span>
        </a>

        <div class="nav-divider"></div>
        <div class="nav-section-label">Sistema</div>

        <a routerLink="/settings" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </span>
          <span class="nav-label">Configurações</span>
        </a>
      </nav>

      <!-- Footer Info -->
      <div class="sidebar-footer">
        <div class="sidebar-footer-card">
          <div class="footer-logo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <div class="footer-title">LeadMap AI</div>
            <div class="footer-version">MVP v1.0 · Free APIs</div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width, 228px);
      background: var(--surface-card, #ffffff);
      border-right: 1px solid var(--border-light, #e8edf4);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: calc(100vh - var(--navbar-height, 60px));
      padding: 1rem 0.625rem;
      position: sticky;
      top: var(--navbar-height, 60px);
      flex-shrink: 0;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-section-label {
      font-size: 0.675rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--gray-400, #94a3b8);
      padding: 0.5rem 0.65rem 0.35rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.6rem 0.75rem;
      border-radius: 9px;
      text-decoration: none;
      color: var(--gray-600, #475569);
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.15s ease;
      letter-spacing: -0.01em;
    }

    .nav-item:hover {
      background: var(--gray-100, #f1f5f9);
      color: var(--gray-900, #0f172a);
    }

    .nav-item.active {
      background: linear-gradient(135deg, #eef5ff 0%, #ede9fe 100%);
      color: var(--brand-600, #2563eb);
    }
    .nav-item.active .nav-icon {
      color: var(--brand-500, #3b7cf8);
    }

    .nav-icon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 7px;
      color: var(--gray-500, #64748b);
      flex-shrink: 0;
      transition: all 0.15s ease;
    }

    .nav-item:hover .nav-icon {
      color: var(--gray-700, #334155);
    }

    .nav-label {
      flex: 1;
    }

    .nav-divider {
      height: 1px;
      background: var(--border-light, #e8edf4);
      margin: 0.5rem 0.25rem;
    }

    /* Footer */
    .sidebar-footer {
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-light, #e8edf4);
    }

    .sidebar-footer-card {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.65rem 0.75rem;
      background: var(--gray-50, #f8fafc);
      border-radius: 10px;
      border: 1px solid var(--border-light, #e8edf4);
    }

    .footer-logo {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #3b7cf8 0%, #6366f1 100%);
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .footer-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--gray-900, #0f172a);
      letter-spacing: -0.01em;
    }

    .footer-version {
      font-size: 0.675rem;
      color: var(--gray-400, #94a3b8);
      margin-top: 1px;
      font-weight: 500;
    }
  `]
})
export class SidebarComponent {}
