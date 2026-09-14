import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Business } from '../../core/models/business.model';
import { LeadStatus } from '../../core/models/lead.model';
import { AiAnalysis } from '../../core/models/ai-analysis.model';
import { BusinessService } from '../../core/services/business.service';
import { LeadService } from '../../core/services/lead.service';
import { ScoreBadgeComponent } from './score-badge.component';

@Component({
  selector: 'app-business-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ScoreBadgeComponent],
  template: `
    <div class="modal-backdrop" (click)="close()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <div class="flex items-center gap-2">
              <span class="category-tag">{{ business.category }}</span>
              <span *ngIf="business.source" class="source-tag">{{ business.source }}</span>
            </div>
            <h2 class="modal-title">{{ business.name }}</h2>
          </div>
          <button class="close-btn" (click)="close()">✕</button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Overview row -->
          <div class="info-grid">
            <div class="info-box">
              <span class="info-label">Avaliação no Mapa</span>
              <div class="flex items-center gap-1 font-bold text-amber-600">
                ⭐ {{ business.rating || 'N/A' }}
                <span class="text-xs text-slate-500 font-normal">({{ business.reviewCount || 0 }} avaliações)</span>
              </div>
            </div>

            <div class="info-box">
              <span class="info-label">Presença de Site</span>
              <div class="font-semibold" [ngClass]="business.website ? 'text-emerald-600' : 'text-rose-600'">
                🌐 {{ business.website ? 'Site informado' : 'Site não encontrado' }}
              </div>
            </div>

            <div class="info-box">
              <span class="info-label">Potencial Comercial</span>
              <app-score-badge [score]="business.leadScore"></app-score-badge>
            </div>

            <div class="info-box">
              <span class="info-label">Contato</span>
              <div class="font-medium text-slate-700">
                📞 {{ business.phone || 'Não informado' }}
              </div>
            </div>
          </div>

          <!-- Address & Social -->
          <div class="address-section">
            <p class="text-sm text-slate-600">
              <strong>📍 Endereço:</strong> {{ business.address || 'Não informado' }}
            </p>
            <p *ngIf="business.instagram" class="text-sm text-pink-600 mt-1">
              <strong>📸 Instagram:</strong> {{ business.instagram }}
            </p>
            <p *ngIf="business.website" class="text-sm text-blue-600 mt-1">
              <strong>🔗 Website:</strong> <a [href]="business.website" target="_blank" class="underline">{{ business.website }}</a>
            </p>
          </div>

          <!-- Registro.br Domain Availability Box -->
          <div class="domain-card p-3.5 rounded-lg border my-3 transition-colors"
               [ngClass]="business.domainAvailable === true ? 'bg-emerald-50/80 border-emerald-300' : 'bg-slate-50 border-slate-200'">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">🌐</span>
                <div>
                  <div class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Domínio Oficial no Registro.br:</div>
                  <div class="font-mono text-sm font-bold text-slate-900">{{ business.suggestedDomain || 'Calculando...' }}</div>
                </div>
              </div>
              <div>
                <span *ngIf="business.domainAvailable === true" class="badge bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  ✓ Disponível para Registro!
                </span>
                <span *ngIf="business.domainAvailable === false" class="badge bg-slate-200 text-slate-700 font-medium text-xs px-2.5 py-1 rounded-full">
                  Já Registrado
                </span>
                <span *ngIf="business.domainAvailable === null || business.domainAvailable === undefined" class="badge bg-amber-100 text-amber-800 font-medium text-xs px-2.5 py-1 rounded-full">
                  Verificando...
                </span>
              </div>
            </div>
            <p *ngIf="business.domainAvailable === true" class="text-xs text-emerald-800 mt-2.5 bg-emerald-100/60 p-2 rounded border border-emerald-200">
              🔥 <strong>Gatilho Mental de Venda:</strong> Esse endereço está livre agora! Avise o responsável que ele pode registrar o nome oficial da empresa antes que concorrentes adquiram a marca na web.
            </p>
          </div>

          <!-- WhatsApp Direct Pitch Action Box -->
          <div *ngIf="business.phone" class="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 my-4 flex items-center justify-between flex-wrap gap-3 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.76-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1 1.04.15 1.76-.72 2.01-1.42.25-.69.25-1.29.17-1.42-.08-.12-.22-.2-.47-.32"/>
                </svg>
              </div>
              <div>
                <div class="font-bold text-slate-900 text-sm">
                  Contato Direto via WhatsApp
                </div>
                <div class="text-xs text-slate-500 mt-0.5">
                  Mensagem personalizada pronta para <strong>{{ business.phone }}</strong>
                </div>
              </div>
            </div>
            <a *ngIf="business.whatsappUrl"
               [href]="business.whatsappUrl"
               target="_blank"
               class="btn-whatsapp btn-whatsapp-md"
               title="Iniciar conversa no WhatsApp com script de vendas pronto">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.76-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1 1.04.15 1.76-.72 2.01-1.42.25-.69.25-1.29.17-1.42-.08-.12-.22-.2-.47-.32"/>
              </svg>
              <span>Abrir WhatsApp</span>
            </a>
          </div>

          <!-- Score Breakdown Progress Bar -->
          <div class="score-progress-container">
            <div class="flex justify-between text-xs font-semibold mb-1">
              <span>Lead Score Estimado</span>
              <span>{{ business.leadScore }}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" [style.width.%]="business.leadScore" [ngClass]="getScoreColorClass()"></div>
            </div>
            <div class="text-[11px] text-slate-500 mt-1">
              * Estimativa com base em ausência de site, volume de avaliações e presença digital.
            </div>
          </div>

          <!-- Lead Management Section (If already saved or saving now) -->
          <div class="lead-action-box">
            <div class="flex items-center justify-between">
              <div class="font-semibold text-slate-800">
                Status do Lead:
                <span class="status-indicator" [ngClass]="business.savedAsLead ? 'saved' : 'not-saved'">
                  {{ business.savedAsLead ? (business.leadStatus || 'NOVO') : 'Não salvo como lead' }}
                </span>
              </div>
              <button *ngIf="!business.savedAsLead" class="btn btn-primary btn-sm" [disabled]="savingLead" (click)="saveAsLead()">
                {{ savingLead ? 'Salvando...' : '⭐ Salvar como Lead' }}
              </button>
            </div>

            <div *ngIf="business.savedAsLead" class="mt-3">
              <label class="block text-xs font-semibold text-slate-600 mb-1">Anotações do Lead:</label>
              <textarea [(ngModel)]="leadNotes" class="notes-textarea" placeholder="Adicione notas de contato, histórico da conversa, etc."></textarea>
              <div class="flex justify-end mt-2">
                <button class="btn btn-outline btn-sm" [disabled]="savingNotes" (click)="saveNotes()">
                  {{ savingNotes ? 'Salvando...' : 'Salvar Anotações' }}
                </button>
              </div>
            </div>
          </div>

          <!-- AI Commercial Analysis Section -->
          <div class="ai-section">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="ai-sparkle">✨</span>
                <h3 class="text-sm font-bold text-slate-900">Análise Comercial com IA</h3>
              </div>
              <button class="btn btn-outline btn-sm" [disabled]="loadingAi" (click)="runAiAnalysis()">
                {{ loadingAi ? 'Analisando...' : (aiAnalysis ? '🔄 Atualizar Análise' : 'Gerar Diagnóstico com IA') }}
              </button>
            </div>

            <div *ngIf="aiAnalysis" class="ai-results">
              <div class="mb-3">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Diagnóstico do Negócio</h4>
                <p class="text-sm text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">{{ aiAnalysis.analysis }}</p>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Sugestão de Abordagem Comercial</h4>
                  <button class="text-xs text-blue-600 hover:underline font-semibold" (click)="copyApproach()">
                    {{ copied ? 'Copiado! ✓' : '📋 Copiar Mensagem' }}
                  </button>
                </div>
                <div class="text-sm text-slate-800 bg-blue-50/70 p-3 rounded border border-blue-200 font-sans italic">
                  "{{ aiAnalysis.suggestedApproach }}"
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn btn-outline" (click)="close()">Fechar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 1rem;
    }
    .modal-card {
      background: #ffffff;
      border-radius: 1rem;
      width: 100%;
      max-width: 650px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0.25rem;
    }
    .category-tag {
      font-size: 0.75rem;
      font-weight: 600;
      background: #eff6ff;
      color: #2563eb;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .source-tag {
      font-size: 0.75rem;
      color: #64748b;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
    }
    .close-btn:hover { color: #0f172a; }
    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    .info-box {
      background: #f8fafc;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
    }
    .info-label {
      font-size: 0.75rem;
      color: #64748b;
      display: block;
      margin-bottom: 0.25rem;
      font-weight: 500;
    }
    .address-section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 0.875rem;
    }
    .score-progress-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 0.875rem;
    }
    .progress-bar-bg {
      height: 8px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }
    .progress-high { background: #10b981; }
    .progress-medium { background: #f59e0b; }
    .progress-low { background: #94a3b8; }
    .lead-action-box {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      padding: 1rem;
    }
    .status-indicator {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      margin-left: 0.5rem;
    }
    .status-indicator.saved {
      background: #dcfce7;
      color: #15803d;
    }
    .status-indicator.not-saved {
      background: #f1f5f9;
      color: #64748b;
      border: 1px dashed #cbd5e1;
    }
    .notes-textarea {
      width: 100%;
      height: 70px;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
      padding: 0.5rem;
      font-size: 0.875rem;
      font-family: inherit;
    }
    .ai-section {
      background: #ffffff;
      border: 1px solid #bfdbfe;
      border-radius: 0.5rem;
      padding: 1rem;
    }
    .ai-sparkle { font-size: 1.1rem; }
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
    }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .justify-end { justify-content: flex-end; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
  `]
})
export class BusinessModalComponent {
  @Input({ required: true }) business!: Business;
  @Output() onClose = new EventEmitter<void>();
  @Output() onLeadUpdated = new EventEmitter<Business>();

  private businessService = inject(BusinessService);
  private leadService = inject(LeadService);

  leadNotes: string = '';
  savingLead: boolean = false;
  savingNotes: boolean = false;
  loadingAi: boolean = false;
  aiAnalysis: AiAnalysis | null = null;
  copied: boolean = false;

  ngOnInit() {
    if (this.business.savedAsLead && this.business.leadId) {
      this.leadService.getLeadById(this.business.leadId).subscribe({
        next: (lead) => {
          this.leadNotes = lead.notes || '';
        }
      });
    }
  }

  close() {
    this.onClose.emit();
  }

  getScoreColorClass(): string {
    if (this.business.leadScore >= 80) return 'progress-high';
    if (this.business.leadScore >= 50) return 'progress-medium';
    return 'progress-low';
  }

  saveAsLead() {
    this.savingLead = true;
    this.leadService.saveLead({ businessId: this.business.id, notes: this.leadNotes }).subscribe({
      next: (lead) => {
        this.business.savedAsLead = true;
        this.business.leadId = lead.id;
        this.business.leadStatus = lead.status;
        this.savingLead = false;
        this.onLeadUpdated.emit(this.business);
      },
      error: () => {
        this.savingLead = false;
      }
    });
  }

  saveNotes() {
    if (!this.business.leadId) return;
    this.savingNotes = true;
    this.leadService.updateNotes(this.business.leadId, this.leadNotes).subscribe({
      next: () => {
        this.savingNotes = false;
      },
      error: () => {
        this.savingNotes = false;
      }
    });
  }

  runAiAnalysis() {
    this.loadingAi = true;
    this.businessService.analyze(this.business.id).subscribe({
      next: (analysis) => {
        this.aiAnalysis = analysis;
        this.loadingAi = false;
      },
      error: () => {
        this.loadingAi = false;
      }
    });
  }

  copyApproach() {
    if (!this.aiAnalysis) return;
    navigator.clipboard.writeText(this.aiAnalysis.suggestedApproach);
    this.copied = true;
    setTimeout(() => this.copied = false, 2500);
  }
}
