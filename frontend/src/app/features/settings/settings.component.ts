import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <div class="saas-card p-6 mb-6">
        <h1 class="text-xl font-bold text-slate-900">Configurações da Plataforma</h1>
        <p class="text-sm text-slate-500">Gerencie integrações de mapas, chaves de API externas e critérios de pontuação.</p>
      </div>

      <div class="grid-2-col gap-6">
        <!-- Map Providers & API Keys -->
        <div class="saas-card p-6">
          <h2 class="text-base font-bold text-slate-900 mb-2">Provedor de Dados Comerciais</h2>
          <p class="text-xs text-slate-500 mb-4">
            O LeadMap utiliza arquitetura modular com fallback inteligente automático.
          </p>

          <div class="form-group mb-4">
            <label class="text-xs font-bold text-slate-700">Provedor Ativo:</label>
            <select [(ngModel)]="provider" class="form-input">
              <option value="composite">Automático / Fallback Inteligente (Recomendado)</option>
              <option value="osm">OpenStreetMap / Overpass (Gratuito)</option>
              <option value="google">Google Places API (Requer Chave)</option>
            </select>
          </div>

          <div class="form-group mb-4">
            <label class="text-xs font-bold text-slate-700">Chave Google Places API (opcional):</label>
            <input
              type="password"
              [(ngModel)]="googleApiKey"
              placeholder="AIzaSy..."
              class="form-input"
            />
            <span class="text-[11px] text-slate-400 mt-1">
              * Conforme a Seção 8 & 24, as chaves nunca ficam expostas no frontend; configure também no backend via <code>GOOGLE_MAPS_API_KEY</code>.
            </span>
          </div>

          <button class="btn btn-primary btn-sm" (click)="savePreferences()">
            Salvar Preferências
          </button>
          <span *ngIf="saved" class="text-xs text-emerald-600 font-semibold ml-2">✓ Configurações salvas!</span>
        </div>

        <!-- Score Parameters Info -->
        <div class="saas-card p-6">
          <h2 class="text-base font-bold text-slate-900 mb-2">Motor de Cálculo do Lead Score</h2>
          <p class="text-xs text-slate-500 mb-4">
            Critérios ponderados oficiais definidos na Seção 13 da especificação:
          </p>

          <ul class="score-rules-list">
            <li>
              <span>🌐 Site não encontrado / ausente:</span>
              <strong class="text-emerald-600">+40 pts</strong>
            </li>
            <li>
              <span>⭐ Mais de 100 avaliações no mapa:</span>
              <strong class="text-blue-600">+20 pts</strong>
            </li>
            <li>
              <span>⭐ Entre 50 e 100 avaliações:</span>
              <strong class="text-blue-600">+15 pts</strong>
            </li>
            <li>
              <span>⭐ Entre 20 e 49 avaliações:</span>
              <strong class="text-blue-600">+10 pts</strong>
            </li>
            <li>
              <span>🏆 Avaliação média superior a 4,5:</span>
              <strong class="text-amber-600">+15 pts</strong>
            </li>
            <li>
              <span>📸 Instagram / rede social identificada:</span>
              <strong class="text-pink-600">+10 pts</strong>
            </li>
            <li>
              <span>📞 Telefone disponível:</span>
              <strong class="text-slate-600">+5 pts</strong>
            </li>
            <li class="border-t border-slate-200 pt-2 font-bold">
              <span>Teto Máximo:</span>
              <span>100 pts</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page { max-width: 1100px; margin: 0 auto; }
    .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; }
    @media (max-width: 800px) { .grid-2-col { grid-template-columns: 1fr; } }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-family: inherit;
    }
    .score-rules-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.825rem;
    }
    .score-rules-list li {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
    }
    .p-6 { padding: 1.5rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mt-1 { margin-top: 0.25rem; }
    .ml-2 { margin-left: 0.5rem; }
  `]
})
export class SettingsComponent {
  provider: string = 'composite';
  googleApiKey: string = '';
  saved: boolean = false;

  savePreferences() {
    this.saved = true;
    setTimeout(() => this.saved = false, 2500);
  }
}
