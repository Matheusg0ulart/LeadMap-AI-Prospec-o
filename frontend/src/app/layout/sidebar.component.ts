import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar-container">
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📊</span>
          <span class="nav-label">Dashboard</span>
        </a>

        <a routerLink="/search" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🔍</span>
          <span class="nav-label">Buscar Empresas</span>
        </a>

        <a routerLink="/leads" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">💼</span>
          <span class="nav-label">Meus Leads</span>
        </a>

        <a routerLink="/kanban" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📋</span>
          <span class="nav-label">Pipeline Kanban</span>
        </a>

        <div class="nav-divider"></div>

        <a routerLink="/settings" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">⚙️</span>
          <span class="nav-label">Configurações</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="pro-badge">MVP v1.0</div>
        <div class="text-[11px] text-slate-400">LeadMap AI Prospecção</div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-container {
      width: 230px;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: calc(100vh - 64px);
      padding: 1.25rem 0.75rem;
      position: sticky;
      top: 64px;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      border-radius: 0.5rem;
      text-decoration: none;
      color: #475569;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.15s ease;
    }
    .nav-item:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .nav-item.active {
      background: #eff6ff;
      color: #2563eb;
    }
    .nav-icon {
      font-size: 1.15rem;
    }
    .nav-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 0.75rem 0;
    }
    .sidebar-footer {
      padding: 0.75rem;
      border-top: 1px solid #f1f5f9;
      text-align: center;
    }
    .pro-badge {
      display: inline-block;
      font-size: 0.675rem;
      font-weight: 700;
      background: #dbeafe;
      color: #1d4ed8;
      padding: 2px 6px;
      border-radius: 4px;
      margin-bottom: 0.25rem;
    }
  `]
})
export class SidebarComponent {}
