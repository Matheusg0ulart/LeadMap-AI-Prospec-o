import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <!-- Brand -->
      <a routerLink="/" class="navbar-brand">
        <div class="brand-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-name">LeadMap</span>
          <span class="brand-tag">AI Prospecção</span>
        </div>
      </a>

      <!-- Center Nav (hidden on mobile) -->
      <nav class="navbar-center-nav">
        <a routerLink="/dashboard" routerLinkActive="nav-active" class="nav-link">
          Dashboard
        </a>
        <a routerLink="/search" routerLinkActive="nav-active" class="nav-link">
          Buscar
        </a>
        <a routerLink="/leads" routerLinkActive="nav-active" class="nav-link">
          Leads
        </a>
        <a routerLink="/kanban" routerLinkActive="nav-active" class="nav-link">
          Pipeline
        </a>
      </nav>

      <!-- Right Actions -->
      <div class="navbar-actions">
        <div class="status-pill">
          <span class="status-dot"></span>
          <span>APIs ativas</span>
        </div>
        <a routerLink="/search" class="btn btn-primary btn-sm">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Nova Busca
        </a>
        <a routerLink="/settings" class="icon-btn" title="Configurações">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </a>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      height: var(--navbar-height, 60px);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid var(--border-light, #e8edf4);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 100;
      gap: 1rem;
    }

    /* Brand */
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-decoration: none;
      flex-shrink: 0;
    }

    .brand-logo {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #3b7cf8 0%, #6366f1 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(59, 124, 248, 0.35);
      flex-shrink: 0;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1;
    }

    .brand-name {
      font-size: 1.0625rem;
      font-weight: 800;
      color: var(--gray-900, #0f172a);
      letter-spacing: -0.025em;
    }

    .brand-tag {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--gray-400, #94a3b8);
      letter-spacing: 0.02em;
      margin-top: 1px;
    }

    /* Center Nav */
    .navbar-center-nav {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .nav-link {
      padding: 0.4rem 0.75rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--gray-500, #64748b);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.15s ease;
      letter-spacing: -0.01em;
    }
    .nav-link:hover {
      color: var(--gray-900, #0f172a);
      background: var(--gray-100, #f1f5f9);
    }
    .nav-link.nav-active {
      color: var(--brand-600, #2563eb);
      background: var(--brand-50, #eef5ff);
    }

    /* Right Actions */
    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-shrink: 0;
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.25rem 0.65rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #166534;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .icon-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 1px solid var(--border-medium, #dde3ec);
      background: var(--surface-card, #fff);
      color: var(--gray-500, #64748b);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .icon-btn:hover {
      background: var(--gray-100, #f1f5f9);
      color: var(--gray-900, #0f172a);
    }

    @media (max-width: 900px) {
      .navbar-center-nav { display: none; }
      .status-pill { display: none; }
    }
  `]
})
export class NavbarComponent {}
