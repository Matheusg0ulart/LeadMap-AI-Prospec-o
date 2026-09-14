import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="navbar-container">
      <div class="navbar-left">
        <a routerLink="/" class="brand-link">
          <div class="logo-icon">🗺️</div>
          <div>
            <div class="brand-title">LeadMap</div>
            <div class="brand-subtitle">Encontre oportunidades onde sua próxima venda está.</div>
          </div>
        </a>
      </div>

      <div class="navbar-right">
        <a routerLink="/search" class="btn btn-primary btn-sm">
          🔍 Nova Pesquisa
        </a>
      </div>
    </header>
  `,
  styles: [`
    .navbar-container {
      height: 64px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .navbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }
    .logo-icon {
      font-size: 1.75rem;
    }
    .brand-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .brand-subtitle {
      font-size: 0.725rem;
      color: #64748b;
      font-weight: 500;
    }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
  `]
})
export class NavbarComponent {}
