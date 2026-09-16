import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummary } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page animate-fade-in">

      <!-- Welcome Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Painel de Prospecção</h1>
          <p class="page-subtitle">Métricas consolidadas de mercado, oportunidades sem site e pipeline de vendas ativas.</p>
        </div>
        <div class="header-actions">
          <a routerLink="/search" class="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Nova Prospecção
          </a>
        </div>
      </div>

      <!-- KPI Metrics Grid -->
      <div class="metrics-grid">
        <div class="metric-card" *ngFor="let m of getMetrics()">
          <div class="metric-icon-wrapper" [style.background]="m.iconBg" [style.color]="m.iconColor">
            <span [innerHTML]="m.icon"></span>
          </div>
          <div class="metric-content">
            <div class="metric-label">{{ m.label }}</div>
            <div class="metric-value" [style.color]="m.valueColor">{{ m.value }}</div>
            <div class="metric-sub">{{ m.sub }}</div>
          </div>
          <div class="metric-trend" [style.background]="m.trendBg">
            <div class="metric-accent-bar" [style.background]="m.accentColor"></div>
          </div>
        </div>
      </div>

      <!-- Two Columns: Funnel + Score Distribution -->
      <div class="charts-row">

        <!-- Funil Comercial -->
        <div class="saas-card p-6 chart-card">
          <div class="chart-header">
            <div>
              <h2 class="chart-title">Funil de Vendas</h2>
              <p class="chart-subtitle">Estágios do pipeline comercial</p>
            </div>
            <a routerLink="/kanban" class="chart-link">
              Ver Kanban
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>

          <div class="funnel-bars">
            <div *ngFor="let stage of funnelStages" class="funnel-row">
              <div class="funnel-row-header">
                <span class="funnel-stage-name">{{ stage.label }}</span>
                <span class="funnel-stage-value">{{ getFunnelValue(stage.key) }}</span>
              </div>
              <div class="funnel-track">
                <div
                  class="funnel-fill"
                  [style.width.%]="getFunnelPercent(stage.key)"
                  [style.background]="stage.gradient">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Score Distribution -->
        <div class="saas-card p-6 chart-card">
          <div class="chart-header">
            <div>
              <h2 class="chart-title">Lead Score</h2>
              <p class="chart-subtitle">Distribuição de potencial</p>
            </div>
            <span class="chart-badge">Automático</span>
          </div>

          <div class="score-cards">
            <div class="score-tier high-tier">
              <div class="score-tier-header">
                <div class="score-tier-dot" style="background: #10b981;"></div>
                <span class="score-tier-label">Alto Potencial</span>
                <span class="score-tier-range">80–100 pts</span>
              </div>
              <div class="score-tier-count text-emerald-700">{{ summary?.scoreDistribution?.['ALTO_POTENCIAL'] || 0 }}</div>
              <p class="score-tier-desc">Empresas sem site com alta avaliação e engajamento local.</p>
            </div>

            <div class="score-tier medium-tier">
              <div class="score-tier-header">
                <div class="score-tier-dot" style="background: #f59e0b;"></div>
                <span class="score-tier-label">Potencial Médio</span>
                <span class="score-tier-range">50–79 pts</span>
              </div>
              <div class="score-tier-count text-amber-700">{{ summary?.scoreDistribution?.['POTENCIAL_MEDIO'] || 0 }}</div>
              <p class="score-tier-desc">Boa atuação local, podem ser convertidos com abordagem certa.</p>
            </div>

            <div class="score-tier low-tier">
              <div class="score-tier-header">
                <div class="score-tier-dot" style="background: #94a3b8;"></div>
                <span class="score-tier-label">Baixo Potencial</span>
                <span class="score-tier-range">0–49 pts</span>
              </div>
              <div class="score-tier-count text-slate-700">{{ summary?.scoreDistribution?.['BAIXO_POTENCIAL'] || 0 }}</div>
              <p class="score-tier-desc">Possuem site ou menor registro de presença online.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories breakdown -->
      <div class="saas-card p-6">
        <div class="chart-header mb-4">
          <div>
            <h2 class="chart-title">Oportunidades por Categoria</h2>
            <p class="chart-subtitle">Distribuição dos leads salvos por segmento</p>
          </div>
          <a routerLink="/leads" class="chart-link">
            Ver todos
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <div *ngIf="categoryList.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <p class="empty-text">Nenhuma categoria registrada ainda. Faça uma prospecção para ver os dados!</p>
        </div>

        <div *ngIf="categoryList.length > 0" class="category-grid">
          <div *ngFor="let cat of categoryList" class="category-item">
            <div class="category-header">
              <span class="category-name">{{ cat.name }}</span>
              <span class="category-count">{{ cat.count }}</span>
            </div>
            <div class="progress-bar-bg">
              <div
                class="progress-bar-fill"
                style="background: linear-gradient(90deg, #3b7cf8, #6366f1)"
                [style.width.%]="getCategoryPercent(cat.count)">
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-page {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Header */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--gray-900, #0f172a);
      letter-spacing: -0.025em;
      line-height: 1.2;
    }
    .page-subtitle {
      font-size: 0.875rem;
      color: var(--gray-500, #64748b);
      margin-top: 0.25rem;
    }
    .header-actions { display: flex; gap: 0.75rem; }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .metric-card {
      background: #fff;
      border: 1px solid var(--border-light, #e8edf4);
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(15,23,42,0.05);
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    .metric-card:hover {
      box-shadow: 0 4px 14px rgba(15,23,42,0.08);
      transform: translateY(-2px);
    }

    .metric-icon-wrapper {
      width: 42px;
      height: 42px;
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .metric-content { flex: 1; min-width: 0; }
    .metric-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--gray-500, #64748b);
      margin-bottom: 0.3rem;
    }
    .metric-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--gray-900, #0f172a);
      line-height: 1;
      letter-spacing: -0.03em;
    }
    .metric-sub {
      font-size: 0.72rem;
      color: var(--gray-400, #94a3b8);
      margin-top: 0.25rem;
    }

    .metric-accent-bar {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      border-radius: 0 14px 14px 0;
    }

    /* Charts Row */
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    @media (max-width: 900px) {
      .charts-row { grid-template-columns: 1fr; }
    }

    .chart-card { display: flex; flex-direction: column; }

    .chart-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      gap: 0.5rem;
    }
    .chart-title {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--gray-900, #0f172a);
      letter-spacing: -0.01em;
    }
    .chart-subtitle {
      font-size: 0.75rem;
      color: var(--gray-500, #64748b);
      margin-top: 2px;
    }
    .chart-link {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--brand-600, #2563eb);
      text-decoration: none;
      white-space: nowrap;
      padding: 0.3rem 0.6rem;
      border-radius: 7px;
      transition: all 0.15s ease;
    }
    .chart-link:hover { background: var(--brand-50, #eef5ff); }

    .chart-badge {
      font-size: 0.7rem;
      font-weight: 700;
      background: var(--gray-100, #f1f5f9);
      color: var(--gray-600, #475569);
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      white-space: nowrap;
    }

    /* Funnel */
    .funnel-bars { display: flex; flex-direction: column; gap: 1rem; }
    .funnel-row { display: flex; flex-direction: column; gap: 0.4rem; }
    .funnel-row-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .funnel-stage-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--gray-700, #334155);
    }
    .funnel-stage-value {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--gray-900, #0f172a);
    }
    .funnel-track {
      height: 8px;
      background: var(--gray-100, #f1f5f9);
      border-radius: 9999px;
      overflow: hidden;
    }
    .funnel-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Score Tiers */
    .score-cards { display: flex; flex-direction: column; gap: 0.75rem; }
    .score-tier {
      padding: 0.875rem;
      border-radius: 10px;
      border: 1px solid transparent;
    }
    .high-tier { background: #f0fdf4; border-color: #bbf7d0; }
    .medium-tier { background: #fffbeb; border-color: #fde68a; }
    .low-tier { background: var(--gray-50, #f8fafc); border-color: var(--border-light, #e8edf4); }

    .score-tier-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.4rem;
    }
    .score-tier-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .score-tier-label {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--gray-800, #1e293b);
      flex: 1;
    }
    .score-tier-range {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--gray-500, #64748b);
      background: white;
      padding: 1px 6px;
      border-radius: 4px;
    }
    .score-tier-count {
      font-size: 1.5rem;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.03em;
      margin-bottom: 0.25rem;
    }
    .score-tier-desc {
      font-size: 0.75rem;
      color: var(--gray-500, #64748b);
      line-height: 1.4;
    }

    /* Categories */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.1rem;
    }
    .category-item { display: flex; flex-direction: column; gap: 0.4rem; }
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .category-name {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--gray-700, #334155);
    }
    .category-count {
      font-size: 0.825rem;
      font-weight: 700;
      color: var(--gray-900, #0f172a);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 2.5rem 1rem;
    }
    .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    .empty-text {
      font-size: 0.875rem;
      color: var(--gray-500, #64748b);
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  summary: DashboardSummary | null = null;

  readonly funnelStages = [
    { key: 'NEW',         label: '📥 Novos Leads',    gradient: 'linear-gradient(90deg, #3b7cf8, #6098fc)' },
    { key: 'CONTACTED',   label: '📞 Contatados',     gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)' },
    { key: 'INTERESTED',  label: '⭐ Interessados',   gradient: 'linear-gradient(90deg, #6366f1, #818cf8)' },
    { key: 'NEGOTIATING', label: '🤝 Em Negociação', gradient: 'linear-gradient(90deg, #d946ef, #e879f9)' },
    { key: 'CONVERTED',   label: '🏆 Convertidos',   gradient: 'linear-gradient(90deg, #10b981, #34d399)' },
  ];

  categoryList: { name: string; count: number }[] = [];

  getMetrics() {
    const s = this.summary;
    return [
      {
        label: 'Empresas Encontradas',
        value: s?.totalBusinessesFound || 0,
        sub: 'Base pesquisada na região',
        icon: '🏢',
        iconBg: '#eef5ff',
        iconColor: '#2563eb',
        valueColor: '#0f172a',
        accentColor: '#3b7cf8',
        trendBg: 'transparent',
      },
      {
        label: 'Oportunidades',
        value: s?.opportunitiesWithoutWebsite || 0,
        sub: 'Sem site identificado',
        icon: '🎯',
        iconBg: '#f0fdf4',
        iconColor: '#059669',
        valueColor: '#059669',
        accentColor: '#10b981',
        trendBg: 'transparent',
      },
      {
        label: 'Leads Salvos',
        value: s?.savedLeads || 0,
        sub: 'Em acompanhamento',
        icon: '⭐',
        iconBg: '#ede9fe',
        iconColor: '#6366f1',
        valueColor: '#6366f1',
        accentColor: '#6366f1',
        trendBg: 'transparent',
      },
      {
        label: 'Contatados',
        value: s?.contactedLeads || 0,
        sub: 'Primeiro contato realizado',
        icon: '📞',
        iconBg: '#fffbeb',
        iconColor: '#d97706',
        valueColor: '#d97706',
        accentColor: '#f59e0b',
        trendBg: 'transparent',
      },
      {
        label: 'Conversões',
        value: s?.conversions || 0,
        sub: 'Contratos fechados',
        icon: '🏆',
        iconBg: '#f0fdfa',
        iconColor: '#0d9488',
        valueColor: '#0d9488',
        accentColor: '#14b8a6',
        trendBg: 'transparent',
      },
    ];
  }

  ngOnInit() {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        if (data.leadsByCategory) {
          this.categoryList = Object.entries(data.leadsByCategory).map(([name, count]) => ({
            name,
            count
          }));
        }
      }
    });
  }

  getFunnelValue(key: string): number {
    return this.summary?.funnel?.[key] || 0;
  }

  getFunnelPercent(key: string): number {
    const val = this.getFunnelValue(key);
    const total = this.summary?.savedLeads || 1;
    return Math.min(100, Math.max(6, Math.round((val / total) * 100)));
  }

  getCategoryPercent(count: number): number {
    const max = Math.max(...this.categoryList.map(c => c.count), 1);
    return Math.round((count / max) * 100);
  }
}
