import { Component, OnInit, inject, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { SearchService } from '../../core/services/search.service';
import { LeadService } from '../../core/services/lead.service';
import { Business } from '../../core/models/business.model';
import { ScoreBadgeComponent } from '../../shared/components/score-badge.component';
import { BusinessModalComponent } from '../../shared/components/business-modal.component';
import { DemoPreviewModalComponent } from '../../shared/components/demo-preview-modal.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ScoreBadgeComponent, BusinessModalComponent, DemoPreviewModalComponent],
  template: `
    <div class="search-page-container animate-fade-in">
      <!-- Search Form Box -->
      <section class="search-form-card">
        <div class="search-header">
          <div class="search-header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <div>
            <h1 class="search-title">Encontre oportunidades de prospecção</h1>
            <p class="search-subtitle">Descubra estabelecimentos com forte presença mas sem site próprio — sua próxima venda está aqui.</p>
          </div>
        </div>

        <form (ngSubmit)="onSearch()" class="search-form-grid">
          <!-- Localização / Bairro com Autocomplete -->
          <div class="form-group relative">
            <label class="form-label">📍 Localização / Bairro / Cidade</label>
            <div class="autocomplete-input-wrapper">
              <input
                type="text"
                [(ngModel)]="location"
                (input)="onLocationInput()"
                (focus)="onLocationFocus()"
                (blur)="onLocationBlur()"
                name="location"
                required
                class="form-input"
                placeholder="Ex.: Belo Horizonte - MG, Tatuapé..."
                autocomplete="off"
              />

              <!-- Autocomplete Dropdown -->
              <div *ngIf="showLocationDropdown && locationSuggestions.length > 0" class="location-autocomplete-dropdown">
                <div
                  *ngFor="let item of locationSuggestions"
                  class="autocomplete-item"
                  (mousedown)="selectLocation(item)"
                >
                  <span class="autocomplete-icon">📍</span>
                  <div class="autocomplete-text">
                    <div class="autocomplete-title">{{ item.mainText }}</div>
                    <div *ngIf="item.subText" class="autocomplete-subtext">{{ item.subText }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Categoria -->
          <div class="form-group">
            <label class="form-label">🏷️ Categoria de Comércio</label>
            <div class="category-input-wrapper">
              <select [(ngModel)]="selectedCategory" name="category" class="form-input" (change)="onCategorySelectChange()">
                <option value="ALL">🔍 Todos os comércios</option>
                <option *ngFor="let cat of presetCategories" [value]="cat">{{ cat }}</option>
                <option value="CUSTOM">✏️ Outra categoria (personalizada)...</option>
              </select>
              <input
                *ngIf="isCustomCategory"
                type="text"
                [(ngModel)]="customCategory"
                name="customCategory"
                class="form-input mt-2"
                placeholder="Digite a categoria personalizada..."
              />
            </div>
          </div>

          <!-- Raio -->
          <div class="form-group">
            <label class="form-label">🎯 Raio de Pesquisa</label>
            <select [(ngModel)]="radius" name="radius" class="form-input">
              <option [value]="1000">1 km</option>
              <option [value]="2000">2 km</option>
              <option [value]="5000">5 km (Recomendado)</option>
              <option [value]="10000">10 km</option>
              <option [value]="20000">20 km</option>
              <option [value]="30000">30 km</option>
              <option [value]="40000">40 km</option>
            </select>
          </div>

          <!-- Submit Button -->
          <div class="form-group flex-end">
            <button type="submit" class="btn btn-primary w-full search-btn" [disabled]="loading">
              <span *ngIf="!loading">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Buscar Empresas
              </span>
              <span *ngIf="loading" style="display:flex;align-items:center;gap:8px">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Buscando...
              </span>
            </button>
          </div>
        </form>

        <!-- Loading Progress Bar -->
        <div *ngIf="loading" class="search-loading-bar">
          <div class="search-loading-text">
            <span class="search-loading-dot"></span>
            Consultando OpenStreetMap, Photon e Nominatim em paralelo...
          </div>
          <div class="search-loading-track"><div class="search-loading-fill"></div></div>
        </div>
      </section>

      <!-- Empty Welcome State (before first search) -->
      <div *ngIf="!searched && !loading" class="welcome-state">
        <div class="welcome-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        </div>
        <h3 class="welcome-title">Pronto para prospectar</h3>
        <p class="welcome-text">Selecione uma localização e categoria acima e clique em <strong>Buscar Empresas</strong> para encontrar estabelecimentos com alto potencial de venda.</p>
        <div class="welcome-tips">
          <div class="tip-item">🎯 Filtre por estabelecimentos sem site</div>
          <div class="tip-item">🗺️ Dados do OpenStreetMap (gratuito)</div>
          <div class="tip-item">⚡ Resultados em menos de 5 segundos</div>
        </div>
      </div>

      <!-- Results Area -->
      <section *ngIf="searched" class="results-container">
        <!-- Results Header & Filters -->
        <div class="results-header saas-card p-4 mb-4">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 class="text-lg font-bold text-slate-800">
                {{ filteredBusinesses.length }} estabelecimentos encontrados
                <span class="text-xs font-normal text-slate-500 ml-1" *ngIf="filteredBusinesses.length > 0">
                  (exibindo {{ displayedBusinesses.length }})
                </span>
              </h2>
              <p class="text-xs text-slate-500">
                {{ withoutWebsiteCount }} com possível ausência de site próprio na região
              </p>
            </div>

            <!-- Filters -->
            <div class="filter-pills">
              <button
                class="pill-btn"
                [class.active]="activeFilter === 'ALL'"
                (click)="setFilter('ALL')">
                Todos ({{ allBusinesses.length }})
              </button>
              <button
                class="pill-btn"
                [class.active]="activeFilter === 'NO_WEBSITE'"
                (click)="setFilter('NO_WEBSITE')">
                🌐 Sem site ({{ withoutWebsiteCount }})
              </button>
              <button
                class="pill-btn"
                [class.active]="activeFilter === 'HIGH_POTENTIAL'"
                (click)="setFilter('HIGH_POTENTIAL')">
                🔥 Alta oportunidade
              </button>
              <button
                class="pill-btn"
                [class.active]="activeFilter === 'HAS_WEBSITE'"
                (click)="setFilter('HAS_WEBSITE')">
                Com site
              </button>

              <a
                [href]="exportCsvUrl"
                target="_blank"
                class="pill-btn bg-emerald-50 text-emerald-800 border-emerald-300 font-bold hover:bg-emerald-100 flex items-center gap-1 ml-2"
                title="Baixar relatórios de leads em formato CSV / Excel">
                📊 Exportar CSV
              </a>
            </div>
          </div>
        </div>

        <!-- Split View: Map + Cards List -->
        <div class="split-view">
          <!-- Map Column -->
          <div class="map-column saas-card">
            <div #mapContainer class="map-view"></div>
          </div>

          <!-- Business Cards Column com scroll infinito e carregar mais -->
          <div class="list-column" (scroll)="onListScroll($event)">
            <div *ngIf="filteredBusinesses.length === 0" class="empty-results saas-card p-8 text-center">
              <div class="text-3xl mb-2">🔎</div>
              <h3 class="font-bold text-slate-700">Nenhum estabelecimento corresponde ao filtro</h3>
              <p class="text-xs text-slate-500 mt-1">Tente alternar para o filtro "Todos" ou aumentar o raio de pesquisa.</p>
            </div>

            <div
              *ngFor="let b of displayedBusinesses"
              class="business-card saas-card p-4 cursor-pointer"
              [class.selected]="selectedBusiness?.id === b.id"
              (click)="focusOnBusiness(b)">
              
              <div class="flex justify-between items-start mb-2">
                <div>
                  <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {{ b.category }}
                  </span>
                  <span *ngIf="b.source" class="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded ml-1" [title]="'Fonte dos dados: ' + b.source">
                    🗺️ {{ b.source }}
                  </span>
                  <span *ngIf="b.ownerName" class="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded ml-1" [title]="'Dono/Sócio: ' + b.ownerName">
                    👑 {{ b.ownerName }}
                  </span>
                  <h3 class="font-bold text-slate-900 text-base mt-1">{{ b.name }}</h3>
                  <div class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    📍 {{ b.address }}
                  </div>
                </div>
                <app-score-badge [score]="b.leadScore"></app-score-badge>
              </div>

              <!-- Rating and Phone Info -->
              <div class="flex items-center gap-4 text-xs text-slate-600 my-2">
                <span class="flex items-center gap-1 font-semibold text-amber-600">
                  ⭐ {{ b.rating || 'N/A' }} <span class="text-slate-400 font-normal">({{ b.reviewCount || 0 }} avaliações)</span>
                </span>
                <span>
                  📞 {{ b.phone ? b.phone : 'Sem telefone' }}
                </span>
              </div>

              <!-- Website & Domain status indicator -->
              <div class="my-2 flex items-center flex-wrap" style="gap: 0.375rem">
                <span
                  class="badge text-xs"
                  [ngClass]="b.website ? 'badge-has-site' : 'badge-no-site'">
                  🌐 {{ b.website ? 'Site informado' : 'Site não encontrado' }}
                </span>
                <span
                  *ngIf="b.domainAvailable === true"
                  class="badge text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1"
                  title="Domínio oficial livre para registro no Registro.br">
                  ✓ {{ b.suggestedDomain }} LIVRE
                </span>
              </div>

              <!-- Potential progress bar -->
              <div class="card-progress-section">
                <div class="flex justify-between text-[11px] font-medium text-slate-500 mb-1.5">
                  <span>Potencial:</span>
                  <span class="font-bold text-slate-700">{{ b.leadScore }}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div
                    class="progress-bar-fill"
                    [style.width.%]="b.leadScore"
                    [ngClass]="getScoreColor(b.leadScore)">
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="card-actions-bar">
                <div class="flex items-center flex-wrap" style="gap: 0.375rem">
                  <button
                    type="button"
                    class="btn btn-outline btn-sm"
                    (click)="openDetails(b, $event)">
                    Ver detalhes
                  </button>

                  <button
                    type="button"
                    class="btn-demo-ia btn-sm"
                    (click)="openDemoPreview(b, $event)"
                    title="Visualizar demonstração de site gerada pela IA">
                    <span>✨ Site IA</span>
                  </button>

                  <a
                    *ngIf="b.phone && b.whatsappUrl"
                    [href]="b.whatsappUrl"
                    target="_blank"
                    (click)="$event.stopPropagation()"
                    class="btn-whatsapp btn-whatsapp-sm"
                    title="Chamar no WhatsApp com mensagem personalizada da IA">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.76-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1 1.04.15 1.76-.72 2.01-1.42.25-.69.25-1.29.17-1.42-.08-.12-.22-.2-.47-.32"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                </div>

                <button
                  type="button"
                  class="btn btn-sm"
                  [ngClass]="b.savedAsLead ? 'btn-success' : 'btn-primary'"
                  (click)="toggleSaveLead(b, $event)">
                  {{ b.savedAsLead ? '✓ Salvo' : '⭐ Salvar lead' }}
                </button>
              </div>
            </div>

            <!-- Botão e indicador de Carregar Mais comércios -->
            <div *ngIf="displayedCount < filteredBusinesses.length" class="load-more-container p-3 text-center">
              <button
                type="button"
                class="btn btn-outline w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                (click)="loadMore()">
                <span>🔄 Carregar mais comércios (+10)</span>
                <span class="text-xs text-slate-500 font-normal">({{ displayedBusinesses.length }} de {{ filteredBusinesses.length }} exibidos)</span>
              </button>
            </div>

            <div *ngIf="displayedBusinesses.length === filteredBusinesses.length && filteredBusinesses.length > 0" class="text-center py-4 text-xs text-slate-400 font-medium">
              ✨ Todos os {{ filteredBusinesses.length }} comércios da região foram carregados
            </div>
          </div>
        </div>
      </section>

      <!-- Business Detail Modal -->
      <app-business-modal
        *ngIf="modalBusiness"
        [business]="modalBusiness"
        (onClose)="modalBusiness = null"
        (onLeadUpdated)="handleLeadUpdated($event)">
      </app-business-modal>

      <!-- Demo Preview Modal (Site IA) -->
      <app-demo-preview-modal
        *ngIf="demoPreviewBusiness"
        [business]="demoPreviewBusiness"
        (close)="demoPreviewBusiness = null">
      </app-demo-preview-modal>
    </div>
  `,
  styles: [`
    .search-page-container {
      max-width: 1300px;
      margin: 0 auto;
    }

    /* Search Form Card */
    .search-form-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
      border: 1px solid var(--border-light, #e8edf4);
      border-radius: 16px;
      padding: 1.75rem;
      margin-bottom: 1.25rem;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
    }

    .search-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .search-header-icon {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #3b7cf8, #6366f1);
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(59, 124, 248, 0.3);
    }

    .search-title {
      font-size: 1.125rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .search-subtitle {
      font-size: 0.8125rem;
      color: #64748b;
      margin-top: 3px;
    }

    .search-form-grid {
      display: grid;
      grid-template-columns: 2fr 2fr 1.5fr 1.5fr;
      gap: 1rem;
      align-items: flex-end;
    }
    @media (max-width: 900px) {
      .search-form-grid {
        grid-template-columns: 1fr;
      }
    }
    .relative {
      position: relative;
    }
    .autocomplete-input-wrapper {
      position: relative;
      width: 100%;
    }
    .location-autocomplete-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 12px 30px -5px rgba(15, 23, 42, 0.14), 0 4px 10px -3px rgba(15, 23, 42, 0.06);
      z-index: 9999;
      max-height: 260px;
      overflow-y: auto;
    }
    .autocomplete-item {
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.12s ease;
    }
    .autocomplete-item:first-child { border-radius: 10px 10px 0 0; }
    .autocomplete-item:last-child { border-bottom: none; border-radius: 0 0 10px 10px; }
    .autocomplete-item:hover { background-color: #f8fafc; }
    .autocomplete-icon { font-size: 0.9rem; color: #3b7cf8; }
    .autocomplete-title { font-weight: 600; font-size: 0.85rem; color: #0f172a; }
    .autocomplete-subtext { font-size: 0.72rem; color: #64748b; margin-top: 1px; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-input {
      width: 100%;
      padding: 0.6rem 0.875rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.875rem;
      background: #ffffff;
      outline: none;
      transition: all 0.15s ease;
      font-family: inherit;
      font-weight: 500;
      color: #0f172a;
      appearance: none;
    }
    .form-input:hover { border-color: #cbd5e1; }
    .form-input:focus {
      border-color: #3b7cf8;
      box-shadow: 0 0 0 3px rgba(59, 124, 248, 0.12);
    }
    .form-input::placeholder { color: #94a3b8; font-weight: 400; }
    select.form-input {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.7rem center;
      padding-right: 2.25rem;
    }
    .search-btn { height: 42px; }
    .filter-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .split-view {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 1.25rem;
      height: 720px;
    }
    @media (max-width: 960px) {
      .split-view { grid-template-columns: 1fr; height: auto; }
    }
    .map-column {
      height: 100%;
      min-height: 520px;
      border-radius: 14px;
      overflow: hidden;
      position: relative;
      background-color: #f1f5f9;
      box-shadow: 0 2px 8px rgba(15,23,42,0.07);
    }
    .map-view { width: 100%; height: 100%; min-height: 520px; }
    .list-column {
      height: 100%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-right: 3px;
    }
    .business-card {
      transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 3px solid transparent;
    }
    .business-card:hover {
      border-left-color: #3b7cf8;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(15,23,42,0.09);
    }
    .business-card.selected {
      border-left-color: #3b7cf8;
      background: linear-gradient(135deg, #f0f7ff, #f5f0ff);
    }
    .p-6 { padding: 1.5rem; }
    .p-4 { padding: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .w-full { width: 100%; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-1 { gap: 0.25rem; }
    .gap-15 { gap: 0.375rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .flex-wrap { flex-wrap: wrap; }
    .progress-bar-bg {
      height: 5px;
      background: #f1f5f9;
      border-radius: 9999px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.5s ease;
    }
    .fill-high { background: linear-gradient(90deg, #10b981, #34d399); }
    .fill-medium { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .fill-low { background: #cbd5e1; }
    .card-progress-section { margin: 0.75rem 0 0.9rem; }
    .card-actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 1px solid #f1f5f9;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .results-header {
      border-radius: 14px;
    }

    /* Spinner animation */
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Loading progress bar */
    .search-loading-bar {
      margin-top: 0.875rem;
      padding: 0.75rem 1rem;
      background: linear-gradient(135deg, #f0f7ff, #f5f0ff);
      border: 1px solid #c7d8fc;
      border-radius: 10px;
    }
    .search-loading-text {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #3b7cf8;
      margin-bottom: 0.6rem;
    }
    .search-loading-dot {
      width: 7px;
      height: 7px;
      background: #3b7cf8;
      border-radius: 50%;
      flex-shrink: 0;
      animation: pulse 1.2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }
    .search-loading-track {
      height: 4px;
      background: #dce8fe;
      border-radius: 9999px;
      overflow: hidden;
    }
    .search-loading-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b7cf8, #6366f1, #3b7cf8);
      background-size: 200% 100%;
      border-radius: 9999px;
      animation: loading-shimmer 1.5s linear infinite;
    }
    @keyframes loading-shimmer {
      0% { background-position: 100% center; width: 20%; }
      50% { width: 70%; }
      100% { background-position: -100% center; width: 90%; }
    }

    /* Welcome / empty state */
    .welcome-state {
      text-align: center;
      padding: 3rem 2rem;
      animation: fadeIn 0.35s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .welcome-icon {
      width: 68px;
      height: 68px;
      background: linear-gradient(135deg, #eef5ff, #ede9fe);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      color: #3b7cf8;
      border: 1.5px solid #c7d8fc;
    }
    .welcome-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }
    .welcome-text {
      font-size: 0.875rem;
      color: #64748b;
      max-width: 500px;
      margin: 0 auto 1.5rem;
      line-height: 1.6;
    }
    .welcome-tips {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .tip-item {
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
      background: #f8fafc;
      border: 1px solid #e8edf4;
      border-radius: 9999px;
      padding: 0.35rem 0.875rem;
    }
  `]
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer') mapContainerRef!: ElementRef<HTMLDivElement>;

  private searchService = inject(SearchService);
  private leadService = inject(LeadService);

  location: string = 'Tatuapé, São Paulo - SP';
  selectedCategory: string = 'ALL';
  customCategory: string = '';
  isCustomCategory: boolean = false;
  radius: number = 5000;

  showLocationDropdown: boolean = false;
  locationSuggestions: Array<{ mainText: string; subText?: string; fullText: string }> = [];

  private popularLocations: Array<{ mainText: string; subText: string; fullText: string }> = [
    { mainText: 'Belo Horizonte - MG', subText: 'Capital • Minas Gerais', fullText: 'Belo Horizonte - MG' },
    { mainText: 'Savassi', subText: 'Bairro • Belo Horizonte - MG', fullText: 'Savassi, Belo Horizonte - MG' },
    { mainText: 'Pampulha', subText: 'Bairro • Belo Horizonte - MG', fullText: 'Pampulha, Belo Horizonte - MG' },
    { mainText: 'Centro', subText: 'Bairro • Belo Horizonte - MG', fullText: 'Centro, Belo Horizonte - MG' },
    { mainText: 'Lourdes', subText: 'Bairro • Belo Horizonte - MG', fullText: 'Lourdes, Belo Horizonte - MG' },
    { mainText: 'São Paulo - SP', subText: 'Capital • São Paulo', fullText: 'São Paulo - SP' },
    { mainText: 'Tatuapé', subText: 'Bairro • São Paulo - SP', fullText: 'Tatuapé, São Paulo - SP' },
    { mainText: 'Moema', subText: 'Bairro • São Paulo - SP', fullText: 'Moema, São Paulo - SP' },
    { mainText: 'Pinheiros', subText: 'Bairro • São Paulo - SP', fullText: 'Pinheiros, São Paulo - SP' },
    { mainText: 'Anália Franco', subText: 'Bairro • São Paulo - SP', fullText: 'Anália Franco, São Paulo - SP' },
    { mainText: 'Vila Madalena', subText: 'Bairro • São Paulo - SP', fullText: 'Vila Madalena, São Paulo - SP' },
    { mainText: 'Itaim Bibi', subText: 'Bairro • São Paulo - SP', fullText: 'Itaim Bibi, São Paulo - SP' },
    { mainText: 'Santana', subText: 'Bairro • São Paulo - SP', fullText: 'Santana, São Paulo - SP' },
    { mainText: 'Mooca', subText: 'Bairro • São Paulo - SP', fullText: 'Mooca, São Paulo - SP' },
    { mainText: 'Jardins', subText: 'Bairro • São Paulo - SP', fullText: 'Jardins, São Paulo - SP' },
    { mainText: 'Rio de Janeiro - RJ', subText: 'Capital • Rio de Janeiro', fullText: 'Rio de Janeiro - RJ' },
    { mainText: 'Copacabana', subText: 'Bairro • Rio de Janeiro - RJ', fullText: 'Copacabana, Rio de Janeiro - RJ' },
    { mainText: 'Ipanema', subText: 'Bairro • Rio de Janeiro - RJ', fullText: 'Ipanema, Rio de Janeiro - RJ' },
    { mainText: 'Barra da Tijuca', subText: 'Bairro • Rio de Janeiro - RJ', fullText: 'Barra da Tijuca, Rio de Janeiro - RJ' },
    { mainText: 'Niterói - RJ', subText: 'Região Metropolitana • Rio de Janeiro', fullText: 'Niterói - RJ' },
    { mainText: 'Curitiba - PR', subText: 'Capital • Paraná', fullText: 'Curitiba - PR' },
    { mainText: 'Batel', subText: 'Bairro • Curitiba - PR', fullText: 'Batel, Curitiba - PR' },
    { mainText: 'Porto Alegre - RS', subText: 'Capital • Rio Grande do Sul', fullText: 'Porto Alegre - RS' },
    { mainText: 'Florianópolis - SC', subText: 'Capital • Santa Catarina', fullText: 'Florianópolis - SC' },
    { mainText: 'Brasília - DF', subText: 'Distrito Federal', fullText: 'Brasília - DF' },
    { mainText: 'Salvador - BA', subText: 'Capital • Bahia', fullText: 'Salvador - BA' },
    { mainText: 'Recife - PE', subText: 'Capital • Pernambuco', fullText: 'Recife - PE' },
    { mainText: 'Fortaleza - CE', subText: 'Capital • Ceará', fullText: 'Fortaleza - CE' },
    { mainText: 'Goiânia - GO', subText: 'Capital • Goiás', fullText: 'Goiânia - GO' },
    { mainText: 'Campinas - SP', subText: 'São Paulo', fullText: 'Campinas - SP' },
    { mainText: 'Ribeirão Preto - SP', subText: 'São Paulo', fullText: 'Ribeirão Preto - SP' },
    { mainText: 'São José dos Campos - SP', subText: 'São Paulo', fullText: 'São José dos Campos - SP' },
    { mainText: 'Santo André - SP', subText: 'São Paulo (ABC)', fullText: 'Santo André - SP' },
    { mainText: 'São Bernardo do Campo - SP', subText: 'São Paulo (ABC)', fullText: 'São Bernardo do Campo - SP' },
    { mainText: 'Osasco - SP', subText: 'São Paulo', fullText: 'Osasco - SP' },
    { mainText: 'Santos - SP', subText: 'Litoral • São Paulo', fullText: 'Santos - SP' },
    { mainText: 'Guarulhos - SP', subText: 'São Paulo', fullText: 'Guarulhos - SP' },
    { mainText: 'Uberlândia - MG', subText: 'Triângulo Mineiro • Minas Gerais', fullText: 'Uberlândia - MG' },
    { mainText: 'Juiz de Fora - MG', subText: 'Minas Gerais', fullText: 'Juiz de Fora - MG' },
    { mainText: 'Contagem - MG', subText: 'Região Metropolitana • Belo Horizonte', fullText: 'Contagem - MG' },
    { mainText: 'Manaus - AM', subText: 'Capital • Amazonas', fullText: 'Manaus - AM' },
    { mainText: 'Belém - PA', subText: 'Capital • Pará', fullText: 'Belém - PA' },
    { mainText: 'Vitória - ES', subText: 'Capital • Espírito Santo', fullText: 'Vitória - ES' }
  ];

  onLocationInput() {
    if (!this.location || this.location.trim().length < 1) {
      this.locationSuggestions = this.popularLocations.slice(0, 6);
      this.showLocationDropdown = true;
      return;
    }

    const term = this.location.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const matches = this.popularLocations.filter(loc => {
      const normMain = loc.mainText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normSub = loc.subText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normMain.includes(term) || normSub.includes(term);
    });

    this.locationSuggestions = matches.slice(0, 8);
    this.showLocationDropdown = true;
  }

  onLocationFocus() {
    this.onLocationInput();
  }

  onLocationBlur() {
    setTimeout(() => {
      this.showLocationDropdown = false;
    }, 200);
  }

  selectLocation(item: { mainText: string; subText?: string; fullText: string }) {
    this.location = item.fullText;
    this.showLocationDropdown = false;
  }

  loading: boolean = false;
  searched: boolean = false;

  presetCategories: string[] = [
    'Barbearia',
    'Restaurante',
    'Salão de beleza',
    'Academia',
    'Loja de roupas',
    'Clínica',
    'Dentista',
    'Oficina mecânica',
    'Pet shop',
    'Padaria',
    'Mercado',
    'Hamburgueria',
    'Pizzaria',
    'Cafeteria',
    'Farmácia',
    'Açougue',
    'Papelaria',
    'Ótica',
    'Relojoaria',
    'Floricultura'
  ];

  allBusinesses: Business[] = [];
  filteredBusinesses: Business[] = [];
  displayedBusinesses: Business[] = [];
  displayedCount: number = 10;
  pageSize: number = 10;
  withoutWebsiteCount: number = 0;
  activeFilter: 'ALL' | 'NO_WEBSITE' | 'HIGH_POTENTIAL' | 'HAS_WEBSITE' = 'ALL';

  selectedBusiness: Business | null = null;
  modalBusiness: Business | null = null;
  demoPreviewBusiness: Business | null = null;

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;

  ngOnInit() {
    // Não inicia busca automaticamente — usuário deve clicar em "Buscar"
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  onCategorySelectChange() {
    this.isCustomCategory = this.selectedCategory === 'CUSTOM';
  }

  onSearch() {
    // "ALL" = busca genérica sem filtro de categoria
    const category = this.isCustomCategory
      ? this.customCategory
      : (this.selectedCategory === 'ALL' ? 'estabelecimento comercial' : this.selectedCategory);

    if (!this.location) return;
    if (this.isCustomCategory && !this.customCategory.trim()) return;

    this.loading = true;
    this.searchService.search({
      location: this.location,
      category: category,
      radius: Number(this.radius)
    }).subscribe({
      next: (res) => {
        // Preserva o estado savedAsLead de buscas anteriores (por externalId)
        const prevSavedMap = new Map(
          this.allBusinesses
            .filter(b => b.savedAsLead)
            .map(b => [b.externalId, b])
        );

        this.allBusinesses = res.businesses.map(b => {
          const prev = prevSavedMap.get(b.externalId);
          if (prev) {
            return { ...b, savedAsLead: true, leadId: prev.leadId, leadStatus: prev.leadStatus };
          }
          return b;
        });

        this.withoutWebsiteCount = res.withoutWebsiteCount;
        this.searched = true;
        this.loading = false;
        this.applyFilter();

        // Delay para garantir que o *ngIf já renderizou o container do mapa
        setTimeout(() => {
          this.initOrUpdateMap();
        }, 150);

        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        }, 500);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erro na pesquisa:', err);
      }
    });
  }

  setFilter(filter: 'ALL' | 'NO_WEBSITE' | 'HIGH_POTENTIAL' | 'HAS_WEBSITE') {
    this.activeFilter = filter;
    this.applyFilter();
    this.updateMapMarkers();
  }

  applyFilter() {
    if (this.activeFilter === 'NO_WEBSITE') {
      this.filteredBusinesses = this.allBusinesses.filter(b => !b.website || b.websiteStatus === 'NOT_FOUND');
    } else if (this.activeFilter === 'HIGH_POTENTIAL') {
      this.filteredBusinesses = this.allBusinesses.filter(b => b.leadScore >= 80);
    } else if (this.activeFilter === 'HAS_WEBSITE') {
      this.filteredBusinesses = this.allBusinesses.filter(b => !!b.website && b.websiteStatus === 'FOUND');
    } else {
      this.filteredBusinesses = [...this.allBusinesses];
    }
    this.displayedCount = 10;
    this.updateDisplayedBusinesses();
  }

  updateDisplayedBusinesses() {
    this.displayedBusinesses = this.filteredBusinesses.slice(0, this.displayedCount);
  }

  loadMore() {
    if (this.displayedCount < this.filteredBusinesses.length) {
      this.displayedCount = Math.min(this.displayedCount + 10, this.filteredBusinesses.length);
      this.updateDisplayedBusinesses();
    }
  }

  onListScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (!target) return;
    const threshold = 120;
    const atBottom = (target.scrollHeight - target.scrollTop - target.clientHeight) <= threshold;
    if (atBottom && this.displayedCount < this.filteredBusinesses.length) {
      this.loadMore();
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'fill-high';
    if (score >= 50) return 'fill-medium';
    return 'fill-low';
  }

  focusOnBusiness(b: Business) {
    this.selectedBusiness = b;
    // Se o comércio clicado no mapa ainda não estiver na lista visível, expande para exibir
    const index = this.filteredBusinesses.findIndex(x => x.id === b.id);
    if (index >= this.displayedCount) {
      this.displayedCount = Math.min(index + 10, this.filteredBusinesses.length);
      this.updateDisplayedBusinesses();
    }
    if (this.map && b.latitude && b.longitude) {
      this.map.flyTo([b.latitude, b.longitude], 16, { duration: 0.8 });
    }
  }

  openDetails(b: Business, event?: Event) {
    if (event) event.stopPropagation();
    this.modalBusiness = b;
  }

  toggleSaveLead(b: Business, event?: Event) {
    if (event) event.stopPropagation();
    if (b.savedAsLead) return;

    this.leadService.saveLead({ businessId: b.id }).subscribe({
      next: (lead) => {
        b.savedAsLead = true;
        b.leadId = lead.id;
        b.leadStatus = lead.status;
      }
    });
  }

  handleLeadUpdated(updated: Business) {
    const idx = this.allBusinesses.findIndex(x => x.id === updated.id);
    if (idx !== -1) {
      this.allBusinesses[idx] = updated;
      this.applyFilter();
    }
  }

  openDemoPreview(business: Business, event?: Event) {
    if (event) { event.stopPropagation(); }
    this.demoPreviewBusiness = business;
  }

  private initOrUpdateMap() {
    if (!this.mapContainerRef || !this.mapContainerRef.nativeElement) return;

    if (!this.map) {
      this.map = L.map(this.mapContainerRef.nativeElement, {
        zoomControl: true
      }).setView([-23.5393, -46.5760], 14);

      L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>'
      }).addTo(this.map);

      this.markersLayer = L.layerGroup().addTo(this.map);
    }

    // Força Leaflet a recalcular dimensões imediatamente e após render
    if (this.map) {
      this.map.invalidateSize();
    }

    this.updateMapMarkers();
  }

  private updateMapMarkers() {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();

    if (this.filteredBusinesses.length === 0) return;

    const bounds = L.latLngBounds([]);

    this.filteredBusinesses.forEach(b => {
      if (b.latitude && b.longitude) {
        const markerColor = b.leadScore >= 80 ? 'marker-high' : (b.leadScore >= 50 ? 'marker-medium' : 'marker-low');
        
        // Custom HTML marker with score
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="custom-lead-marker ${markerColor}" style="width: 32px; height: 32px;">${b.leadScore}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([b.latitude, b.longitude], { icon: customIcon });

        // Popup conforme Seção 11 da especificação
        const popupContent = `
          <div style="min-width: 200px; font-family: inherit;">
            <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 4px;">${b.name}</div>
            <div style="font-size: 12px; color: #d97706; margin-bottom: 4px;">⭐ ${b.rating || 'N/A'} <span style="color: #64748b;">(${b.reviewCount || 0} avaliações)</span></div>
            <div style="font-size: 12px; color: #475569; margin-bottom: 4px;">📍 ${b.address}</div>
            <div style="font-size: 12px; color: ${b.website ? '#16a34a' : '#dc2626'}; font-weight: 600; margin-bottom: 4px;">
              🌐 ${b.website ? 'Site informado' : 'Site não encontrado'}
            </div>
            <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">📞 ${b.phone ? b.phone : 'Sem telefone'}</div>
            <div style="font-size: 12px; font-weight: 700; color: #2563eb; margin-bottom: 8px;">Score: ${b.leadScore}/100</div>
            <div style="display: flex; gap: 6px;">
              <button id="popup-btn-${b.id}" style="padding: 4px 8px; background: #2563eb; color: #fff; border: none; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: 600;">Ver detalhes</button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`popup-btn-${b.id}`);
          if (btn) {
            btn.onclick = () => {
              this.openDetails(b);
            };
          }
        });

        marker.on('click', () => {
          this.selectedBusiness = b;
        });

        this.markersLayer!.addLayer(marker);
        bounds.extend([b.latitude, b.longitude]);
      }
    });

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }

  get exportCsvUrl(): string {
    return this.searchService.getCsvExportUrl(this.selectedCategory, this.activeFilter);
  }
}
