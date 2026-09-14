import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LeadService } from '../../core/services/lead.service';
import { Lead, LeadStatus } from '../../core/models/lead.model';
import { Business } from '../../core/models/business.model';
import { ScoreBadgeComponent } from '../../shared/components/score-badge.component';
import { BusinessModalComponent } from '../../shared/components/business-modal.component';

@Component({
  selector: 'app-leads-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ScoreBadgeComponent, BusinessModalComponent],
  template: `
    <div class="leads-page-container">
      <div class="header-section saas-card p-6 mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 class="text-xl font-bold text-slate-900">Meus Leads Salvos</h1>
          <p class="text-sm text-slate-500">Gerencie todos os estabelecimentos identificados e acompanhe o contato comercial.</p>
        </div>

        <div class="flex items-center gap-3">
          <a routerLink="/kanban" class="btn btn-outline btn-sm">
            📋 Ver Funil Kanban
          </a>
          <a routerLink="/search" class="btn btn-primary btn-sm">
            🔍 Prospectar Mais Empresas
          </a>
        </div>
      </div>

      <!-- Filters & Search Bar -->
      <div class="saas-card p-4 mb-4 flex justify-between items-center flex-wrap gap-3">
        <div class="flex items-center gap-3 flex-1 min-w-[280px]">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
            placeholder="Filtrar por nome, categoria ou cidade..."
            class="filter-search-input"
          />
        </div>

        <div class="flex items-center gap-2">
          <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="status-select-filter">
            <option value="ALL">Todos os Status</option>
            <option value="NEW">Novos</option>
            <option value="CONTACTED">Contatados</option>
            <option value="INTERESTED">Interessados</option>
            <option value="NEGOTIATING">Em Negociação</option>
            <option value="CONVERTED">Convertidos</option>
            <option value="LOST">Perdidos</option>
          </select>
        </div>
      </div>

      <!-- Leads Table -->
      <div class="saas-card overflow-hidden">
        <div *ngIf="loading" class="p-8 text-center text-slate-500">
          Carregando leads...
        </div>

        <div *ngIf="!loading && filteredLeads.length === 0" class="p-12 text-center">
          <div class="text-4xl mb-3">💼</div>
          <h3 class="font-bold text-slate-800 text-lg">Nenhum lead encontrado</h3>
          <p class="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Você ainda não possui leads salvos com este filtro. Faça uma busca para encontrar empresas sem site e salvá-las!
          </p>
          <a routerLink="/search" class="btn btn-primary mt-4">
            Começar Pesquisa
          </a>
        </div>

        <table *ngIf="!loading && filteredLeads.length > 0" class="leads-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Categoria</th>
              <th>Avaliações</th>
              <th>Score</th>
              <th>Status Comercial</th>
              <th>Data</th>
              <th class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let lead of filteredLeads">
              <td>
                <div class="font-bold text-slate-900">{{ lead.business.name }}</div>
                <div class="text-xs text-slate-500">📍 {{ lead.business.address }}</div>
                <div *ngIf="lead.business.domainAvailable === true" class="mt-1">
                  <span class="badge text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✓ {{ lead.business.suggestedDomain }} LIVRE
                  </span>
                </div>
              </td>
              <td>
                <span class="category-pill">{{ lead.business.category }}</span>
              </td>
              <td>
                <span class="text-xs font-semibold text-amber-600">⭐ {{ lead.business.rating || 'N/A' }}</span>
                <span class="text-xs text-slate-400"> ({{ lead.business.reviewCount || 0 }})</span>
              </td>
              <td>
                <app-score-badge [score]="lead.business.leadScore" [showLabel]="false"></app-score-badge>
              </td>
              <td>
                <select
                  [(ngModel)]="lead.status"
                  (change)="changeStatus(lead)"
                  class="status-dropdown"
                  [ngClass]="getStatusColor(lead.status)">
                  <option value="NEW">Novo</option>
                  <option value="CONTACTED">Contatado</option>
                  <option value="INTERESTED">Interessado</option>
                  <option value="NEGOTIATING">Em Negociação</option>
                  <option value="CONVERTED">Convertido</option>
                  <option value="LOST">Perdido</option>
                </select>
              </td>
              <td class="text-xs text-slate-500">
                {{ formatDate(lead.createdAt) }}
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-2">
                  <a
                    *ngIf="lead.business.phone && lead.business.whatsappUrl"
                    [href]="lead.business.whatsappUrl"
                    target="_blank"
                    class="btn-whatsapp btn-whatsapp-sm"
                    title="Chamar no WhatsApp com mensagem da IA">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.76-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1 1.04.15 1.76-.72 2.01-1.42.25-.69.25-1.29.17-1.42-.08-.12-.22-.2-.47-.32"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                  <button class="btn btn-outline btn-sm" (click)="openModal(lead.business)">
                    Ver Detalhes / IA
                  </button>
                  <button class="delete-btn" (click)="deleteLead(lead.id)" title="Excluir Lead">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Business Modal -->
      <app-business-modal
        *ngIf="selectedBusiness"
        [business]="selectedBusiness"
        (onClose)="selectedBusiness = null"
        (onLeadUpdated)="loadLeads()">
      </app-business-modal>
    </div>
  `,
  styles: [`
    .leads-page-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .filter-search-input {
      width: 100%;
      padding: 0.5rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      outline: none;
    }
    .status-select-filter {
      padding: 0.5rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      background: #ffffff;
      outline: none;
    }
    .leads-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .leads-table th {
      background-color: #f8fafc;
      color: #64748b;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .leads-table td {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.875rem;
    }
    .leads-table tr:hover {
      background-color: #f8fafc;
    }
    .category-pill {
      font-size: 0.75rem;
      font-weight: 600;
      color: #2563eb;
      background: #eff6ff;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .status-dropdown {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid transparent;
      outline: none;
      cursor: pointer;
    }
    .status-new { background: #dbeafe; color: #1d4ed8; }
    .status-contacted { background: #fef3c7; color: #b45309; }
    .status-interested { background: #e0e7ff; color: #4338ca; }
    .status-negotiating { background: #fae8ff; color: #86198f; }
    .status-converted { background: #dcfce7; color: #15803d; }
    .status-lost { background: #f1f5f9; color: #64748b; }
    .delete-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 4px 6px;
      border-radius: 4px;
      transition: background 0.15s ease;
    }
    .delete-btn:hover { background: #fee2e2; }
    .p-6 { padding: 1.5rem; }
    .p-4 { padding: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .justify-end { justify-content: flex-end; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .flex-wrap { flex-wrap: wrap; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .overflow-hidden { overflow: hidden; }
  `]
})
export class LeadsListComponent implements OnInit {
  private leadService = inject(LeadService);

  leads: Lead[] = [];
  filteredLeads: Lead[] = [];
  loading: boolean = false;
  searchQuery: string = '';
  statusFilter: string = 'ALL';
  selectedBusiness: Business | null = null;

  ngOnInit() {
    this.loadLeads();
  }

  loadLeads() {
    this.loading = true;
    this.leadService.listLeads().subscribe({
      next: (data) => {
        this.leads = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredLeads = this.leads.filter(lead => {
      const matchesStatus = this.statusFilter === 'ALL' || lead.status === this.statusFilter;
      const q = this.searchQuery.toLowerCase().trim();
      const matchesQuery = !q ||
        lead.business.name.toLowerCase().includes(q) ||
        (lead.business.category && lead.business.category.toLowerCase().includes(q)) ||
        (lead.business.address && lead.business.address.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }

  changeStatus(lead: Lead) {
    this.leadService.updateStatus(lead.id, lead.status).subscribe();
  }

  deleteLead(id: number) {
    if (confirm('Tem certeza de que deseja remover este lead?')) {
      this.leadService.deleteLead(id).subscribe({
        next: () => {
          this.leads = this.leads.filter(l => l.id !== id);
          this.applyFilters();
        }
      });
    }
  }

  openModal(business: Business) {
    this.selectedBusiness = business;
  }

  getStatusColor(status: LeadStatus): string {
    switch (status) {
      case 'NEW': return 'status-new';
      case 'CONTACTED': return 'status-contacted';
      case 'INTERESTED': return 'status-interested';
      case 'NEGOTIATING': return 'status-negotiating';
      case 'CONVERTED': return 'status-converted';
      case 'LOST': return 'status-lost';
      default: return 'status-new';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
}
