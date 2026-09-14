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
    <div class="dashboard-page">
      <!-- Welcome Header -->
      <div class="saas-card p-6 mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Painel de Prospecção LeadMap</h1>
          <p class="text-sm text-slate-500 mt-1">
            Métricas consolidadas de mercado, oportunidades sem site e pipeline de vendas ativas.
          </p>
        </div>

        <div class="flex gap-3">
          <a routerLink="/search" class="btn btn-primary">
            🔍 Nova Prospecção
          </a>
        </div>
      </div>

      <!-- KPI Metrics Grid -->
      <div class="metrics-grid mb-6">
        <div class="saas-card metric-box border-l-4 border-l-blue-500">
          <div class="metric-icon">🏢</div>
          <div>
            <div class="metric-label">Empresas Encontradas</div>
            <div class="metric-value">{{ summary?.totalBusinessesFound || 0 }}</div>
            <div class="metric-sub">Base pesquisada na região</div>
          </div>
        </div>

        <div class="saas-card metric-box border-l-4 border-l-emerald-500">
          <div class="metric-icon">🎯</div>
          <div>
            <div class="metric-label">Possíveis Oportunidades</div>
            <div class="metric-value text-emerald-600">{{ summary?.opportunitiesWithoutWebsite || 0 }}</div>
            <div class="metric-sub">Sem site próprio identificado</div>
          </div>
        </div>

        <div class="saas-card metric-box border-l-4 border-l-indigo-500">
          <div class="metric-icon">⭐</div>
          <div>
            <div class="metric-label">Leads Salvos</div>
            <div class="metric-value text-indigo-600">{{ summary?.savedLeads || 0 }}</div>
            <div class="metric-sub">Em acompanhamento</div>
          </div>
        </div>

        <div class="saas-card metric-box border-l-4 border-l-amber-500">
          <div class="metric-icon">📞</div>
          <div>
            <div class="metric-label">Leads Contatados</div>
            <div class="metric-value text-amber-600">{{ summary?.contactedLeads || 0 }}</div>
            <div class="metric-sub">Primeiro contato realizado</div>
          </div>
        </div>

        <div class="saas-card metric-box border-l-4 border-l-teal-500">
          <div class="metric-icon">🏆</div>
          <div>
            <div class="metric-label">Conversões</div>
            <div class="metric-value text-teal-600">{{ summary?.conversions || 0 }}</div>
            <div class="metric-sub">Contratos fechados</div>
          </div>
        </div>
      </div>

      <!-- Two Columns: Funnel + Categories Breakdown -->
      <div class="charts-grid mb-6">
        <!-- Funil Comercial -->
        <div class="saas-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-slate-900">Funil de Vendas Comercial</h2>
            <a routerLink="/kanban" class="text-xs text-blue-600 font-semibold hover:underline">Ver no Kanban →</a>
          </div>

          <div class="funnel-bars">
            <div *ngFor="let stage of funnelStages" class="funnel-row">
              <div class="funnel-stage-header">
                <span class="font-medium text-xs text-slate-700">{{ stage.label }}</span>
                <span class="font-bold text-xs text-slate-900">{{ getFunnelValue(stage.key) }}</span>
              </div>
              <div class="funnel-bar-track">
                <div
                  class="funnel-bar-fill"
                  [style.width.%]="getFunnelPercent(stage.key)"
                  [ngClass]="stage.color">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Distribuição de Potencial por Score -->
        <div class="saas-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-slate-900">Distribuição por Lead Score</h2>
            <span class="text-xs text-slate-400">Classificação Seção 14</span>
          </div>

          <div class="score-dist-container">
            <div class="dist-card high">
              <div class="dist-top">
                <span class="dist-badge">80–100 pts</span>
                <span class="font-bold text-xl text-emerald-700">{{ summary?.scoreDistribution?.['ALTO_POTENCIAL'] || 0 }}</span>
              </div>
              <div class="dist-title">Alto Potencial</div>
              <p class="dist-desc">Empresas sem site com alta avaliação e engajamento no mapa.</p>
            </div>

            <div class="dist-card medium">
              <div class="dist-top">
                <span class="dist-badge">50–79 pts</span>
                <span class="font-bold text-xl text-amber-700">{{ summary?.scoreDistribution?.['POTENCIAL_MEDIO'] || 0 }}</span>
              </div>
              <div class="dist-title">Potencial Médio</div>
              <p class="dist-desc">Empresas com boa atuação local que podem ser convertidas.</p>
            </div>

            <div class="dist-card low">
              <div class="dist-top">
                <span class="dist-badge">0–49 pts</span>
                <span class="font-bold text-xl text-slate-700">{{ summary?.scoreDistribution?.['BAIXO_POTENCIAL'] || 0 }}</span>
              </div>
              <div class="dist-title">Baixo Potencial</div>
              <p class="dist-desc">Possuem site ou menor número de registros online.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories breakdown row -->
      <div class="saas-card p-6">
        <h2 class="text-base font-bold text-slate-900 mb-4">Oportunidades por Categoria</h2>
        <div class="category-bars-grid">
          <div *ngFor="let cat of categoryList" class="category-bar-item">
            <div class="flex justify-between text-xs font-semibold mb-1 text-slate-700">
              <span>{{ cat.name }}</span>
              <span>{{ cat.count }} empresas</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill bg-blue-600" [style.width.%]="getCategoryPercent(cat.count)"></div>
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
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1rem;
    }
    .metric-box {
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .metric-icon {
      font-size: 2rem;
    }
    .metric-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .metric-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
      margin: 0.2rem 0;
    }
    .metric-sub {
      font-size: 0.725rem;
      color: #94a3b8;
    }
    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    @media (max-width: 900px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
    .funnel-bars {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .funnel-row {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .funnel-stage-header {
      display: flex;
      justify-content: space-between;
    }
    .funnel-bar-track {
      height: 8px;
      background: #f1f5f9;
      border-radius: 9999px;
      overflow: hidden;
    }
    .funnel-bar-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }
    .bg-new { background: #3b82f6; }
    .bg-contacted { background: #f59e0b; }
    .bg-interested { background: #6366f1; }
    .bg-negotiating { background: #d946ef; }
    .bg-converted { background: #10b981; }
    .score-dist-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .dist-card {
      padding: 0.875rem;
      border-radius: 0.5rem;
      border: 1px solid transparent;
    }
    .dist-card.high { background: #ecfdf5; border-color: #a7f3d0; }
    .dist-card.medium { background: #fffbeb; border-color: #fde68a; }
    .dist-card.low { background: #f8fafc; border-color: #e2e8f0; }
    .dist-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }
    .dist-badge {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 6px;
      background: #ffffff;
      border-radius: 4px;
    }
    .dist-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: #0f172a;
    }
    .dist-desc {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.2rem;
    }
    .category-bars-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .progress-bar-bg {
      height: 7px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 9999px;
    }
    .bg-blue-600 { background: #2563eb; }
    .p-6 { padding: 1.5rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .flex-wrap { flex-wrap: wrap; }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  summary: DashboardSummary | null = null;

  readonly funnelStages = [
    { key: 'NEW', label: '📥 Novos Leads', color: 'bg-new' },
    { key: 'CONTACTED', label: '📞 Contatados', color: 'bg-contacted' },
    { key: 'INTERESTED', label: '⭐ Interessados', color: 'bg-interested' },
    { key: 'NEGOTIATING', label: '🤝 Em Negociação', color: 'bg-negotiating' },
    { key: 'CONVERTED', label: '🏆 Convertidos', color: 'bg-converted' }
  ];

  categoryList: { name: string; count: number }[] = [];

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
    return Math.min(100, Math.max(8, Math.round((val / total) * 100)));
  }

  getCategoryPercent(count: number): number {
    const max = Math.max(...this.categoryList.map(c => c.count), 1);
    return Math.round((count / max) * 100);
  }
}
