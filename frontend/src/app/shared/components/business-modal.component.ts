import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Business } from '../../core/models/business.model';
import { BusinessService } from '../../core/services/business.service';
import { LeadService } from '../../core/services/lead.service';
import { SearchService } from '../../core/services/search.service';
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
              <span *ngIf="business.source" class="source-tag">🗺️ {{ business.source }}</span>
            </div>
            <h2 class="modal-title">{{ business.name }}</h2>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn btn-primary btn-sm text-xs font-bold bg-indigo-600 hover:bg-indigo-700" (click)="openContract()" title="Gerar contrato de venda preenchido em 1 clique">
              📑 Gerar Contrato (1 Clique)
            </button>
            <button class="btn btn-outline btn-sm text-xs" (click)="openAuditReport()" title="Gerar relatório de auditoria comercial em PDF para o cliente">
              📄 Auditoria PDF
            </button>
            <button class="close-btn" (click)="close()">✕</button>
          </div>
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
              <div class="flex items-center justify-between">
                <span class="info-label">Contato</span>
                <button *ngIf="!editingPhone && business.id" (click)="startEditingPhone()" class="text-xs text-blue-600 hover:underline font-semibold" title="Editar telefone">
                  ✏️ Editar
                </button>
              </div>
              <div *ngIf="!editingPhone" class="font-medium text-slate-700">
                📞 {{ business.phone || 'Não informado' }}
              </div>
              <div *ngIf="editingPhone" class="flex items-center gap-1 mt-1">
                <input type="text" [(ngModel)]="phoneInput" class="px-2 py-1 text-xs border rounded w-full font-mono text-slate-800" placeholder="(11) 99999-9999" (keyup.enter)="savePhone()" />
                <button (click)="savePhone()" [disabled]="savingPhone" class="bg-emerald-600 text-white text-xs px-2 py-1 rounded hover:bg-emerald-700 font-bold">
                  {{ savingPhone ? '...' : '✓' }}
                </button>
                <button (click)="editingPhone = false" class="bg-slate-200 text-slate-700 text-xs px-2 py-1 rounded hover:bg-slate-300">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- Feature 1: DESTAQUE PRINCIPAL - CNPJ, SÓCIOS E DONO -->
          <div class="cnpj-enrich-card p-4 rounded-xl border bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md my-1">
            <div class="flex items-center justify-between mb-3 border-b border-slate-700/80 pb-2">
              <div class="flex items-center gap-2">
                <span class="text-xl">🏢</span>
                <div>
                  <h3 class="text-sm font-bold text-slate-100">Registro Fiscal & Proprietários (Receita Federal)</h3>
                  <p class="text-[11px] text-slate-400">Identificação do Dono e Sócios para Abordagem Direta</p>
                </div>
              </div>
              <button
                class="btn btn-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 border-none font-bold text-xs shadow-sm flex items-center gap-1"
                [disabled]="enrichingCnpj"
                (click)="enrichCnpj()">
                <span *ngIf="!enrichingCnpj">🔍 {{ business.cnpj ? 'Atualizar Sócios/CNPJ' : 'Enriquecer CNPJ & Dono' }}</span>
                <span *ngIf="enrichingCnpj">Consultando Receita...</span>
              </button>
            </div>

            <!-- Dados Enriquecidos -->
            <div *ngIf="business.ownerName || business.cnpj" class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div class="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                <span class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">👑 Proprietário / Sócio Principal</span>
                <span class="text-sm font-bold text-amber-300 mt-0.5 block">{{ business.ownerName || 'Não identificado' }}</span>
                <span *ngIf="business.partnerDetails" class="text-[11px] text-slate-300 block mt-1">👥 {{ business.partnerDetails }}</span>
              </div>

              <div class="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                <span class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">📋 Dados Fiscais</span>
                <span class="font-mono text-xs text-emerald-400 font-bold block">CNPJ: {{ business.cnpj || 'Em verificação' }}</span>
                <span class="text-[11px] text-slate-300 block truncate">Razão: {{ business.legalName || business.name }}</span>
                <span *ngIf="business.capitalSocial" class="text-[11px] text-slate-400 block mt-0.5">Capital: {{ business.capitalSocial }}</span>
              </div>

              <div *ngIf="business.officialPhone || business.officialEmail" class="md:col-span-2 bg-slate-800/80 p-2.5 rounded border border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <span *ngIf="business.officialPhone" class="text-slate-200">📞 <strong>Telefone Oficial:</strong> {{ business.officialPhone }}</span>
                <span *ngIf="business.officialEmail" class="text-slate-200">✉️ <strong>Email Oficial:</strong> {{ business.officialEmail }}</span>
              </div>
            </div>

            <div *ngIf="!business.ownerName && !business.cnpj" class="text-xs text-slate-400 bg-slate-800/50 p-2.5 rounded text-center border border-slate-700/50">
              💡 Clique no botão acima para puxar os dados oficiais do CNPJ, nome dos sócios/proprietários e telefone da Receita Federal.
            </div>
          </div>

          <!-- Feature 1 Solicitada: ANÁLISE DE REDES SOCIAIS E EXTRAÇÃO DE BIO DO INSTAGRAM POR IA -->
          <div class="p-4 rounded-xl border bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 my-1">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-xl">📸</span>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Análise de Redes Sociais & Extração de Bio</h3>
                  <p class="text-[11px] text-slate-500">A IA analisa o Instagram e captura telefones/links da bio</p>
                </div>
              </div>
              <button
                class="btn btn-sm bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs shadow-sm hover:from-pink-700 hover:to-purple-700 border-none"
                [disabled]="analyzingSocial"
                (click)="analyzeSocialMedia()">
                <span *ngIf="!analyzingSocial">📱 Analisar Redes Sociais com IA</span>
                <span *ngIf="analyzingSocial">Extraindo links e bio...</span>
              </button>
            </div>

            <div *ngIf="socialAnalysis" class="mt-3 bg-white p-3 rounded-lg border border-pink-200 text-xs">
              <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
                <span class="font-bold text-pink-700 text-xs">Perfil: {{ socialAnalysis.instagramHandle }}</span>
                <span class="badge bg-purple-100 text-purple-800 font-semibold text-[11px] px-2 py-0.5 rounded">
                  👥 ~{{ socialAnalysis.followersCount }} seguidores | {{ socialAnalysis.activityStatus }}
                </span>
              </div>
              <div *ngIf="socialAnalysis.extractedPhones && socialAnalysis.extractedPhones.length > 0" class="mb-2 p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-900">
                ✅ <strong>Telefone/WhatsApp extraído da Bio:</strong> {{ socialAnalysis.extractedPhones.join(', ') }}
              </div>
              <div class="text-slate-700 font-sans italic bg-pink-50/60 p-2.5 rounded border border-pink-100">
                "{{ socialAnalysis.pitchArgument }}"
              </div>
            </div>
          </div>

          <!-- Feature 3 Solicitada: CALCULADORA DE ROI E PREJUÍZO ESTIMADO POR FALTA DE SITE -->
          <div class="p-4 rounded-xl border bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 my-1">
            <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="text-xl">💰</span>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Calculadora de ROI & Prejuízo por Falta de Site</h3>
                  <p class="text-[11px] text-slate-500">Estimativa de vendas perdidas mensalmente no Google</p>
                </div>
              </div>
              <button
                class="btn btn-sm bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs shadow-sm hover:from-amber-700 hover:to-orange-700 border-none"
                [disabled]="calculatingRoi"
                (click)="calculateRoi()">
                <span *ngIf="!calculatingRoi">📊 Calcular Prejuízo Estimado</span>
                <span *ngIf="calculatingRoi">Simulando ROI...</span>
              </button>
            </div>

            <div *ngIf="roiData" class="mt-3 bg-white p-3.5 rounded-lg border border-amber-200 text-xs">
              <div class="grid grid-cols-2 gap-3 text-center mb-3">
                <div class="bg-amber-100/60 p-2 rounded border border-amber-200">
                  <span class="text-[10px] text-amber-800 font-bold uppercase block">Prejuízo Mensal Estimado</span>
                  <span class="text-base font-black text-rose-600 block mt-0.5">{{ roiData.prejuizoMensalFormatado }}</span>
                </div>
                <div class="bg-amber-100/60 p-2 rounded border border-amber-200">
                  <span class="text-[10px] text-amber-800 font-bold uppercase block">Prejuízo Anual Estimado</span>
                  <span class="text-base font-black text-rose-700 block mt-0.5">{{ roiData.prejuizoAnualFormatado }}</span>
                </div>
              </div>
              <div class="flex items-center justify-between bg-amber-50 p-2 rounded border border-amber-200 mb-2">
                <span class="text-slate-700">Clientes perdidos/mês: <strong>~{{ roiData.clientesPerdidosMes }} clientes</strong></span>
                <button class="text-xs text-amber-700 hover:underline font-bold" (click)="copyRoiArgument()">
                  {{ copiedRoi ? 'Copiado! ✓' : '📋 Copiar Argumento de ROI' }}
                </button>
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
          <div class="domain-card p-3 rounded-lg border my-1 transition-colors"
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
              </div>
            </div>
          </div>

          <!-- WhatsApp Direct Pitch Action Box com Nome do Dono -->
          <div *ngIf="business.phone" class="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 my-1 flex items-center justify-between flex-wrap gap-3 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.76-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1 1.04.15 1.76-.72 2.01-1.42.25-.69.25-1.29.17-1.42-.08-.12-.22-.2-.47-.32"/>
                </svg>
              </div>
              <div>
                <div class="font-bold text-slate-900 text-sm flex items-center gap-1">
                  Abordagem WhatsApp
                  <span *ngIf="business.ownerName" class="text-xs font-normal text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Foco: {{ business.ownerName }}
                  </span>
                </div>
                <div class="text-xs text-slate-500 mt-0.5">
                  Mensagem direta e personalizada para <strong>{{ business.phone }}</strong>
                </div>
              </div>
            </div>
            <a *ngIf="business.whatsappUrl"
               [href]="business.whatsappUrl"
               target="_blank"
               class="btn-whatsapp btn-whatsapp-md"
               title="Iniciar conversa no WhatsApp">
              <span>Abrir WhatsApp com Pitch</span>
            </a>
          </div>

          <!-- Feature 2: Assistente de Objeções & Script de Cold Call -->
          <div class="objection-section border rounded-xl p-4 bg-slate-50 my-1">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-lg">🧠</span>
                <h3 class="text-sm font-bold text-slate-900">Assistente de Objeções & Ligação Fria</h3>
              </div>
              <button class="btn btn-outline btn-sm text-xs font-semibold" [disabled]="loadingObjections" (click)="loadObjections()">
                {{ loadingObjections ? 'Gerando...' : (objectionKit ? '🔄 Atualizar Script' : '💡 Ver Script de Ligação') }}
              </button>
            </div>

            <div *ngIf="objectionKit" class="objection-content mt-3 text-xs">
              <!-- Cold Call Script Steps -->
              <div class="mb-4 bg-white p-3 rounded-lg border border-slate-200">
                <h4 class="font-bold text-slate-800 uppercase tracking-wider mb-2 text-[11px] text-blue-700">
                  📞 Script de Ligação Fria (Passo a Passo)
                </h4>
                <div *ngFor="let step of objectionKit.coldCallScript" class="mb-2.5 pb-2 border-b border-slate-100 last:border-none">
                  <div class="font-bold text-slate-900 text-[11px]">{{ step.step }}</div>
                  <div class="text-slate-700 font-sans italic bg-blue-50/50 p-2 rounded mt-1">"{{ step.script }}"</div>
                </div>
              </div>

              <!-- Objections Handling Cards -->
              <div class="bg-white p-3 rounded-lg border border-slate-200">
                <h4 class="font-bold text-slate-800 uppercase tracking-wider mb-2 text-[11px] text-amber-700">
                  🛡️ Resposta a Objeções Comuns
                </h4>
                <div *ngFor="let obj of objectionKit.objections" class="mb-3 bg-amber-50/40 p-2.5 rounded border border-amber-200/60">
                  <div class="font-bold text-slate-900 mb-1">{{ obj.objection }}</div>
                  <div class="text-slate-700 font-sans"><strong>Resposta Comercial:</strong> "{{ obj.answer }}"</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lead Management Section -->
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
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn btn-outline" (click)="close()">Fechar</button>
          <button
            class="btn btn-primary font-bold bg-indigo-600 hover:bg-indigo-700 text-xs"
            (click)="openContract()">
            📑 Gerar Contrato (1 Clique)
          </button>
          <button
            class="btn-demo-ia"
            style="padding: 7px 16px; font-size: 13px;"
            (click)="openSiteDemo()"
            title="Ver demonstração do site gerada pela IA">
            ✨ Ver Site IA (Demo)
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(8px) saturate(150%);
      -webkit-backdrop-filter: blur(8px) saturate(150%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 1rem;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-card {
      background: #ffffff;
      border-radius: 18px;
      width: 100%;
      max-width: 740px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.25), 0 8px 20px -6px rgba(15, 23, 42, 0.1);
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(226, 232, 240, 0.8);
      animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.94) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
      border-radius: 18px 18px 0 0;
    }
    .modal-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: #0f172a;
      margin-top: 0.3rem;
      letter-spacing: -0.025em;
    }
    .category-tag {
      font-size: 0.7rem;
      font-weight: 700;
      background: linear-gradient(135deg, #eef5ff, #ede9fe);
      color: #3b7cf8;
      padding: 3px 9px;
      border-radius: 9999px;
      border: 1px solid #bcd4fe;
      letter-spacing: 0.01em;
    }
    .source-tag {
      font-size: 0.7rem;
      color: #64748b;
      background: #f1f5f9;
      padding: 2px 7px;
      border-radius: 9999px;
    }
    .close-btn {
      background: #f1f5f9;
      border: none;
      font-size: 0.9rem;
      color: #64748b;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .close-btn:hover { background: #e2e8f0; color: #0f172a; }
    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    .info-box {
      background: #f8fafc;
      padding: 0.85rem;
      border-radius: 10px;
      border: 1px solid #e8edf4;
      transition: all 0.15s ease;
    }
    .info-box:hover { background: #f1f5f9; border-color: #dde3ec; }
    .info-label {
      font-size: 0.675rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #94a3b8;
      display: block;
      margin-bottom: 0.3rem;
    }
    .address-section {
      background: #f8fafc;
      padding: 0.875rem 1rem;
      border-radius: 10px;
      border: 1px solid #e8edf4;
    }
    .lead-action-box {
      background: #ffffff;
      border: 1.5px solid #e8edf4;
      border-radius: 12px;
      padding: 1rem;
    }
    .status-indicator {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 9999px;
      margin-left: 0.5rem;
    }
    .status-indicator.saved {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }
    .status-indicator.not-saved {
      background: #f8fafc;
      color: #94a3b8;
      border: 1px dashed #cbd5e1;
    }
    .notes-textarea {
      width: 100%;
      height: 70px;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      font-family: inherit;
      transition: all 0.15s ease;
      outline: none;
      resize: vertical;
    }
    .notes-textarea:focus {
      border-color: #3b7cf8;
      box-shadow: 0 0 0 3px rgba(59, 124, 248, 0.12);
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #f1f5f9;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      align-items: center;
      background: #fafbfc;
      border-radius: 0 0 18px 18px;
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
  private searchService = inject(SearchService);

  leadNotes: string = '';
  savingLead: boolean = false;
  savingNotes: boolean = false;

  enrichingCnpj: boolean = false;
  analyzingSocial: boolean = false;
  socialAnalysis: any = null;

  calculatingRoi: boolean = false;
  roiData: any = null;
  copiedRoi: boolean = false;

  loadingObjections: boolean = false;
  objectionKit: any = null;

  editingPhone: boolean = false;
  phoneInput: string = '';
  savingPhone: boolean = false;

  startEditingPhone() {
    this.phoneInput = this.business.phone || '';
    this.editingPhone = true;
  }

  savePhone() {
    if (!this.business.id) return;
    this.savingPhone = true;
    this.businessService.updatePhone(this.business.id, this.phoneInput).subscribe({
      next: (updated) => {
        this.business.phone = updated.phone;
        this.business.whatsappPitch = updated.whatsappPitch;
        this.business.whatsappUrl = updated.whatsappUrl;
        this.editingPhone = false;
        this.savingPhone = false;
        this.onLeadUpdated.emit(this.business);
      },
      error: () => {
        this.savingPhone = false;
      }
    });
  }

  ngOnInit() {
    if (this.business.savedAsLead && this.business.leadId) {
      this.leadService.getLeadById(this.business.leadId).subscribe({
        next: (lead) => {
          this.leadNotes = lead.notes || '';
        }
      });
    }
  }

  enrichCnpj() {
    if (!this.business.id) return;
    this.enrichingCnpj = true;
    this.searchService.enrichCnpj(this.business.id).subscribe({
      next: (updated) => {
        Object.assign(this.business, updated);
        this.enrichingCnpj = false;
        this.onLeadUpdated.emit(this.business);
      },
      error: () => {
        this.enrichingCnpj = false;
      }
    });
  }

  analyzeSocialMedia() {
    if (!this.business.id) return;
    this.analyzingSocial = true;
    this.searchService.analyzeSocial(this.business.id).subscribe({
      next: (analysis) => {
        this.socialAnalysis = analysis;
        this.analyzingSocial = false;
        if (analysis.extractedPhones && analysis.extractedPhones.length > 0 && !this.business.phone) {
          this.business.phone = analysis.extractedPhones[0];
          this.onLeadUpdated.emit(this.business);
        }
      },
      error: () => {
        this.analyzingSocial = false;
      }
    });
  }

  calculateRoi() {
    if (!this.business.id) return;
    this.calculatingRoi = true;
    this.searchService.getRoi(this.business.id).subscribe({
      next: (roi) => {
        this.roiData = roi;
        this.calculatingRoi = false;
      },
      error: () => {
        this.calculatingRoi = false;
      }
    });
  }

  copyRoiArgument() {
    if (!this.roiData) return;
    navigator.clipboard.writeText(this.roiData.whatsappArgument);
    this.copiedRoi = true;
    setTimeout(() => this.copiedRoi = false, 2500);
  }

  loadObjections() {
    if (!this.business.id) return;
    this.loadingObjections = true;
    this.searchService.getObjectionKit(this.business.id).subscribe({
      next: (kit) => {
        this.objectionKit = kit;
        this.loadingObjections = false;
      },
      error: () => {
        this.loadingObjections = false;
      }
    });
  }

  openAuditReport() {
    if (!this.business.id) return;
    const url = this.searchService.getAuditReportUrl(this.business.id);
    window.open(url, '_blank');
  }

  openContract() {
    if (!this.business.id) return;
    const url = this.searchService.getContractUrl(this.business.id);
    window.open(url, '_blank');
  }

  close() {
    this.onClose.emit();
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

  openSiteDemo() {
    const origin = window.location.origin;
    const url = this.business.id
      ? `${origin}/demo/${this.business.id}`
      : `${origin}/demo?name=${encodeURIComponent(this.business.name)}&category=${encodeURIComponent(this.business.category || '')}`;
    window.open(url, '_blank');
  }
}
