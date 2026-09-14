import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LeadService } from '../../core/services/lead.service';
import { Lead, LeadStatus } from '../../core/models/lead.model';
import { Business } from '../../core/models/business.model';
import { ScoreBadgeComponent } from '../../shared/components/score-badge.component';
import { BusinessModalComponent } from '../../shared/components/business-modal.component';

interface KanbanColumn {
  id: LeadStatus;
  title: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-leads-kanban',
  standalone: true,
  imports: [CommonModule, RouterLink, ScoreBadgeComponent, BusinessModalComponent],
  template: `
    <div class="kanban-page-container">
      <div class="saas-card p-6 mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Pipeline Comercial (Kanban)</h1>
          <p class="text-sm text-slate-500">Acompanhe visualmente o funil de prospecção e conversão dos seus leads.</p>
        </div>

        <div class="flex items-center gap-3">
          <a routerLink="/leads" class="btn btn-outline btn-sm">
            📄 Visualizar em Tabela
          </a>
          <a routerLink="/search" class="btn btn-primary btn-sm">
            🔍 Prospectar Mais Empresas
          </a>
        </div>
      </div>

      <!-- Kanban Board Columns -->
      <div class="kanban-board">
        <div *ngFor="let col of columns" class="kanban-col">
          <div class="col-header" [ngClass]="col.colorClass">
            <div class="flex items-center gap-2">
              <span>{{ col.icon }}</span>
              <span class="font-bold text-sm text-slate-800">{{ col.title }}</span>
            </div>
            <span class="col-count">{{ getLeadsByStatus(col.id).length }}</span>
          </div>

          <!-- Cards List in Column -->
          <div class="col-body">
            <div
              *ngFor="let lead of getLeadsByStatus(col.id)"
              class="kanban-card saas-card p-3"
              (click)="openModal(lead.business)">
              
              <div class="flex justify-between items-start mb-1">
                <span class="category-pill">{{ lead.business.category }}</span>
                <app-score-badge [score]="lead.business.leadScore" [showLabel]="false"></app-score-badge>
              </div>

              <h4 class="font-bold text-slate-900 text-sm mt-1">{{ lead.business.name }}</h4>
              <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">📍 {{ lead.business.address }}</p>

              <div class="flex items-center gap-2 my-2 text-xs text-slate-600">
                <span>⭐ {{ lead.business.rating || 'N/A' }}</span>
                <span>•</span>
                <span>{{ lead.business.phone ? '📞 Com telefone' : 'Sem telefone' }}</span>
              </div>

              <!-- Action buttons to move lead across stages -->
              <div class="card-actions pt-2 mt-2 border-t border-slate-100 flex justify-between items-center" (click)="$event.stopPropagation()">
                <button
                  class="step-btn"
                  [disabled]="isFirstStage(col.id)"
                  (click)="movePrevious(lead)"
                  title="Mover para estágio anterior">
                  ◀
                </button>

                <button class="step-btn-text" (click)="openModal(lead.business)">
                  Detalhes / IA
                </button>

                <button
                  class="step-btn"
                  [disabled]="isLastStage(col.id)"
                  (click)="moveNext(lead)"
                  title="Avançar estágio">
                  ▶
                </button>
              </div>
            </div>

            <div *ngIf="getLeadsByStatus(col.id).length === 0" class="empty-col">
              Nenhum lead nesta etapa
            </div>
          </div>
        </div>
      </div>

      <!-- Detail modal -->
      <app-business-modal
        *ngIf="selectedBusiness"
        [business]="selectedBusiness"
        (onClose)="selectedBusiness = null"
        (onLeadUpdated)="loadLeads()">
      </app-business-modal>
    </div>
  `,
  styles: [`
    .kanban-page-container {
      width: 100%;
    }
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(6, minmax(220px, 1fr));
      gap: 1rem;
      overflow-x: auto;
      padding-bottom: 1.5rem;
    }
    .kanban-col {
      background: #f1f5f9;
      border-radius: 0.75rem;
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 220px);
    }
    .col-header {
      padding: 0.75rem 1rem;
      border-radius: 0.75rem 0.75rem 0 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid transparent;
    }
    .header-new { border-bottom-color: #3b82f6; }
    .header-contacted { border-bottom-color: #f59e0b; }
    .header-interested { border-bottom-color: #6366f1; }
    .header-negotiating { border-bottom-color: #d946ef; }
    .header-converted { border-bottom-color: #10b981; }
    .header-lost { border-bottom-color: #94a3b8; }
    .col-count {
      font-size: 0.75rem;
      font-weight: 700;
      background: #ffffff;
      padding: 2px 7px;
      border-radius: 9999px;
      color: #334155;
    }
    .col-body {
      padding: 0.75rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      flex: 1;
    }
    .kanban-card {
      cursor: pointer;
      border-left: 3px solid #cbd5e1;
      transition: all 0.15s ease;
    }
    .kanban-card:hover {
      border-left-color: #2563eb;
      transform: translateY(-2px);
    }
    .empty-col {
      text-align: center;
      font-size: 0.75rem;
      color: #94a3b8;
      padding: 2rem 0.5rem;
      border: 1px dashed #cbd5e1;
      border-radius: 0.5rem;
    }
    .category-pill {
      font-size: 0.7rem;
      font-weight: 600;
      color: #2563eb;
      background: #eff6ff;
      padding: 1px 6px;
      border-radius: 4px;
    }
    .step-btn {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 0.75rem;
      cursor: pointer;
      color: #475569;
    }
    .step-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .step-btn-text {
      background: none;
      border: none;
      font-size: 0.7rem;
      font-weight: 600;
      color: #2563eb;
      cursor: pointer;
    }
    .step-btn-text:hover { text-decoration: underline; }
    .p-6 { padding: 1.5rem; }
    .p-3 { padding: 0.75rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .flex-wrap { flex-wrap: wrap; }
  `]
})
export class LeadsKanbanComponent implements OnInit {
  private leadService = inject(LeadService);

  leads: Lead[] = [];
  selectedBusiness: Business | null = null;

  readonly stageOrder: LeadStatus[] = ['NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATING', 'CONVERTED', 'LOST'];

  readonly columns: KanbanColumn[] = [
    { id: 'NEW', title: 'Novos', icon: '📥', colorClass: 'header-new' },
    { id: 'CONTACTED', title: 'Contatados', icon: '📞', colorClass: 'header-contacted' },
    { id: 'INTERESTED', title: 'Interessados', icon: '⭐', colorClass: 'header-interested' },
    { id: 'NEGOTIATING', title: 'Em Negociação', icon: '🤝', colorClass: 'header-negotiating' },
    { id: 'CONVERTED', title: 'Convertidos', icon: '🏆', colorClass: 'header-converted' },
    { id: 'LOST', title: 'Perdidos', icon: '❌', colorClass: 'header-lost' }
  ];

  ngOnInit() {
    this.loadLeads();
  }

  loadLeads() {
    this.leadService.listLeads().subscribe({
      next: (data) => {
        this.leads = data;
      }
    });
  }

  getLeadsByStatus(status: LeadStatus): Lead[] {
    return this.leads.filter(l => l.status === status);
  }

  isFirstStage(status: LeadStatus): boolean {
    return this.stageOrder.indexOf(status) === 0;
  }

  isLastStage(status: LeadStatus): boolean {
    const idx = this.stageOrder.indexOf(status);
    return idx === this.stageOrder.length - 1;
  }

  moveNext(lead: Lead) {
    const idx = this.stageOrder.indexOf(lead.status);
    if (idx < this.stageOrder.length - 1) {
      const nextStatus = this.stageOrder[idx + 1];
      this.updateLeadStatus(lead, nextStatus);
    }
  }

  movePrevious(lead: Lead) {
    const idx = this.stageOrder.indexOf(lead.status);
    if (idx > 0) {
      const prevStatus = this.stageOrder[idx - 1];
      this.updateLeadStatus(lead, prevStatus);
    }
  }

  private updateLeadStatus(lead: Lead, newStatus: LeadStatus) {
    lead.status = newStatus;
    this.leadService.updateStatus(lead.id, newStatus).subscribe();
  }

  openModal(b: Business) {
    this.selectedBusiness = b;
  }
}
