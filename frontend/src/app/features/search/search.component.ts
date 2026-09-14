import { Component, OnInit, inject, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { SearchService } from '../../core/services/search.service';
import { LeadService } from '../../core/services/lead.service';
import { Business } from '../../core/models/business.model';
import { ScoreBadgeComponent } from '../../shared/components/score-badge.component';
import { BusinessModalComponent } from '../../shared/components/business-modal.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ScoreBadgeComponent, BusinessModalComponent],
  template: `
    <div class="search-page-container">
      <!-- Search Form Box -->
      <section class="saas-card p-6 mb-6">
        <div class="search-header mb-4">
          <h1 class="text-xl font-bold text-slate-900">Encontre oportunidades de prospecção</h1>
          <p class="text-sm text-slate-500">Descubra estabelecimentos comerciais com forte presença, mas sem site próprio identificado.</p>
        </div>

        <form (ngSubmit)="onSearch()" class="search-form-grid">
          <!-- Localização -->
          <div class="form-group">
            <label class="form-label">📍 Localização / Bairro</label>
            <input
              type="text"
              [(ngModel)]="location"
              name="location"
              required
              class="form-input"
              placeholder="Ex.: Tatuapé, São Paulo - SP"
            />
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
              <span *ngIf="!loading">🔍 Buscar Empresas</span>
              <span *ngIf="loading">Buscando na região...</span>
            </button>
          </div>
        </form>
      </section>

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
              <div class="my-2 flex items-center gap-1.5 flex-wrap">
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
                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    class="btn btn-outline btn-sm"
                    (click)="openDetails(b, $event)">
                    Ver detalhes
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
    </div>
  `,
  styles: [`
    .search-page-container {
      max-width: 1300px;
      margin: 0 auto;
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
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: #334155;
    }
    .form-input {
      padding: 0.625rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      background: #ffffff;
      outline: none;
      transition: border-color 0.15s ease;
      font-family: inherit;
    }
    .form-input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    }
    .search-btn {
      height: 42px;
    }
    .filter-pills {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .pill-btn {
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      font-size: 0.775rem;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .pill-btn:hover {
      border-color: #cbd5e1;
      color: #0f172a;
    }
    .pill-btn.active {
      background: #2563eb;
      color: #ffffff;
      border-color: #2563eb;
    }
    .split-view {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 1.25rem;
      height: 720px;
    }
    @media (max-width: 960px) {
      .split-view {
        grid-template-columns: 1fr;
        height: auto;
      }
    }
    .map-column {
      height: 100%;
      min-height: 520px;
      border-radius: 0.75rem;
      overflow: hidden;
      position: relative;
      background-color: #f1f5f9;
    }
    .map-view {
      width: 100%;
      height: 100%;
      min-height: 520px;
    }
    .list-column {
      height: 100%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      padding-right: 4px;
    }
    .business-card {
      transition: all 0.15s ease;
      border-left: 4px solid transparent;
    }
    .business-card:hover {
      border-left-color: #2563eb;
      transform: translateY(-1px);
    }
    .business-card.selected {
      border-left-color: #2563eb;
      background-color: #f0f7ff;
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
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .flex-wrap { flex-wrap: wrap; }
    .progress-bar-bg {
      height: 6px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 9999px;
    }
    .fill-high { background: #10b981; }
    .fill-medium { background: #f59e0b; }
    .fill-low { background: #94a3b8; }
    .card-progress-section {
      margin-top: 0.75rem;
      margin-bottom: 0.95rem;
    }
    .card-actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
      border-top: 1px solid #f1f5f9;
      gap: 0.5rem;
      flex-wrap: wrap;
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

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;

  ngOnInit() {
    this.onSearch();
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

  private initOrUpdateMap() {
    if (!this.mapContainerRef || !this.mapContainerRef.nativeElement) return;

    if (!this.map) {
      this.map = L.map(this.mapContainerRef.nativeElement, {
        zoomControl: true
      }).setView([-23.5393, -46.5760], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
}
