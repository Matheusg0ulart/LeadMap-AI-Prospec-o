import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Business } from '../../core/models/business.model';
import { SiteDemoService } from '../../core/services/site-demo.service';
import { SiteDemo } from '../../core/models/site-demo.model';

@Component({
  selector: 'app-demo-preview-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-card">
        <!-- Header do Modal -->
        <div class="modal-header">
          <div class="header-info">
            <div class="header-badge">
              <span class="sparkle">✨</span>
              <span>SITE DE DEMONSTRAÇÃO (IA)</span>
            </div>
            <h3 class="modal-title">{{ business.name }}</h3>
            <span class="modal-category">{{ business.category }} • {{ business.address }}</span>
          </div>

          <!-- Ações Superiores -->
          <div class="header-controls">
            <!-- Alternador de Dispositivo -->
            <div class="device-switcher" *ngIf="isReady">
              <button
                type="button"
                class="device-btn"
                [class.active]="viewMode === 'desktop'"
                (click)="viewMode = 'desktop'"
                title="Visualização em Computador"
              >
                💻 Desktop
              </button>
              <button
                type="button"
                class="device-btn"
                [class.active]="viewMode === 'mobile'"
                (click)="viewMode = 'mobile'"
                title="Visualização em Smartphone"
              >
                📱 Celular
              </button>
            </div>

            <!-- Botão Fechar -->
            <button type="button" class="close-btn" (click)="close.emit()" title="Fechar">✕</button>
          </div>
        </div>

        <!-- Barra de Ações Rápidas de Venda -->
        <div class="sales-action-bar">
          <div class="link-box">
            <span class="link-label">Link da Prévia:</span>
            <input type="text" class="link-input" [value]="demoUrl" readonly />
            <button type="button" class="copy-btn" (click)="copyLink()">
              {{ copied ? '✓ Copiado!' : '📋 Copiar Link' }}
            </button>
          </div>

          <div class="action-buttons">
            <a [href]="demoUrl" target="_blank" class="open-tab-btn">
              <span>↗ Abrir em Nova Aba</span>
            </a>

            <button type="button" class="wa-action-btn" (click)="openWhatsAppWithDemo()" [disabled]="!business.phone">
              <svg class="wa-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.297.144.35.49 1.196.533 1.284.043.088.072.19.014.305-.058.115-.087.19-.174.289l-.26.3c-.087.101-.179.21-.077.385.102.174.454.748.974 1.211.669.595 1.233.78 1.407.867.174.087.276.073.377-.044.101-.116.433-.506.549-.68.116-.174.232-.145.39-.087s1.011.477 1.184.564.289.13.332.203c.043.072.043.419-.101.824z"/>
              </svg>
              <span>Chamar com Link do Site</span>
            </button>
          </div>
        </div>

        <!-- Preview Body Container -->
        <div class="modal-body" [class.mobile-frame-wrapper]="viewMode === 'mobile'">
          <!-- Barra e Painel de Carregamento com IA -->
          <div class="generation-loader" *ngIf="!isReady">
            <div class="loader-card">
              <div class="loader-header-tag">
                <span class="pulse-ring"></span>
                <span>GERADOR DE SITES IA • LEADMAP</span>
              </div>

              <h4 class="loader-title">Criando Demonstração do Site</h4>
              <p class="loader-subtitle">Analisando dados comerciais de <strong>{{ business.name }}</strong></p>

              <!-- Barra de Progresso Principal -->
              <div class="progress-box">
                <div class="progress-info-row">
                  <span class="progress-step-label">{{ currentStepText }}</span>
                  <span class="progress-percentage">{{ loadingProgress }}%</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill" [style.width.%]="loadingProgress">
                    <div class="progress-shimmer"></div>
                  </div>
                </div>
              </div>

              <!-- Lista de Etapas Dinâmicas com Checkmarks -->
              <div class="steps-checklist">
                <div class="step-item" [class.done]="loadingProgress >= 25" [class.active]="loadingProgress < 25">
                  <div class="step-icon-badge">
                    <span *ngIf="loadingProgress >= 25">✓</span>
                    <span *ngIf="loadingProgress < 25" class="spin-icon">⏳</span>
                  </div>
                  <div class="step-desc">
                    <span class="step-title">Coleta de Perfil & Avaliações</span>
                    <span class="step-sub">Extraindo nota e reputação do Google Maps</span>
                  </div>
                </div>

                <div class="step-item" [class.done]="loadingProgress >= 55" [class.active]="loadingProgress >= 25 && loadingProgress < 55">
                  <div class="step-icon-badge">
                    <span *ngIf="loadingProgress >= 55">✓</span>
                    <span *ngIf="loadingProgress >= 25 && loadingProgress < 55" class="spin-icon">⏳</span>
                    <span *ngIf="loadingProgress < 25">⚪</span>
                  </div>
                  <div class="step-desc">
                    <span class="step-title">Identidade Visual & Paleta</span>
                    <span class="step-sub">Adaptando cores e layout para {{ business.category }}</span>
                  </div>
                </div>

                <div class="step-item" [class.done]="loadingProgress >= 80" [class.active]="loadingProgress >= 55 && loadingProgress < 80">
                  <div class="step-icon-badge">
                    <span *ngIf="loadingProgress >= 80">✓</span>
                    <span *ngIf="loadingProgress >= 55 && loadingProgress < 80" class="spin-icon">⏳</span>
                    <span *ngIf="loadingProgress < 55">⚪</span>
                  </div>
                  <div class="step-desc">
                    <span class="step-title">Catálogo de Serviços & Argumentos</span>
                    <span class="step-sub">Redigindo chamadas e gatilhos de conversão</span>
                  </div>
                </div>

                <div class="step-item" [class.done]="loadingProgress >= 100" [class.active]="loadingProgress >= 80 && loadingProgress < 100">
                  <div class="step-icon-badge">
                    <span *ngIf="loadingProgress >= 100">✓</span>
                    <span *ngIf="loadingProgress >= 80 && loadingProgress < 100" class="spin-icon">⏳</span>
                    <span *ngIf="loadingProgress < 80">⚪</span>
                  </div>
                  <div class="step-desc">
                    <span class="step-title">Verificação de Domínio & Finalização</span>
                    <span class="step-sub">Checando Registro.br e renderizando prévia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Container do Iframe (revelado quando pronto) -->
          <div class="iframe-container" [class.mobile-device]="viewMode === 'mobile'" [class.revealed]="isReady">
            <div class="device-speaker" *ngIf="viewMode === 'mobile'"></div>
            <iframe
              *ngIf="safeIframeUrl"
              [src]="safeIframeUrl"
              class="preview-iframe"
              frameborder="0"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .modal-card {
      background: #ffffff;
      width: 100%;
      max-width: 1200px;
      height: 92vh;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Header */
    .modal-header {
      padding: 16px 24px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background: #ffffff;
    }
    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 4px;
    }
    .modal-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .modal-category {
      font-size: 13px;
      color: #64748b;
    }
    .header-controls {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .device-switcher {
      display: flex;
      background: #f1f5f9;
      padding: 3px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .device-btn {
      border: none;
      background: transparent;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .device-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .close-btn {
      border: none;
      background: #f1f5f9;
      color: #475569;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .close-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    /* Barra de Ações Rápidas */
    .sales-action-bar {
      padding: 10px 24px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .link-box {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-grow: 1;
      max-width: 600px;
    }
    .link-label {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      white-space: nowrap;
    }
    .link-input {
      flex-grow: 1;
      font-size: 12px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 10px;
      color: #334155;
      font-family: monospace;
      outline: none;
    }
    .copy-btn {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .copy-btn:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
    }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .open-tab-btn {
      text-decoration: none;
      font-size: 12px;
      font-weight: 700;
      color: #2563eb;
      background: #ffffff;
      border: 1px solid #bfdbfe;
      padding: 6px 12px;
      border-radius: 6px;
      transition: all 0.15s;
    }
    .open-tab-btn:hover {
      background: #eff6ff;
    }
    .wa-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #25d366;
      border: none;
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(37,211,102,0.3);
      transition: all 0.15s;
    }
    .wa-action-btn:hover:not(:disabled) {
      background: #20ba5a;
    }
    .wa-action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .wa-icon {
      width: 15px;
      height: 15px;
    }

    /* Modal Body & Frames */
    .modal-body {
      flex: 1;
      background: #e2e8f0;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-body.mobile-frame-wrapper {
      padding: 20px;
      background: #cbd5e1;
    }

    /* === Painel de Carregamento & Barra de Progresso === */
    .generation-loader {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 30;
      padding: 20px;
    }
    .loader-card {
      background: #ffffff;
      border-radius: 16px;
      max-width: 540px;
      width: 100%;
      padding: 32px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      border: 1px solid #e2e8f0;
      text-align: center;
      animation: scaleIn 0.25s ease-out;
    }
    @keyframes scaleIn {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .loader-header-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 9999px;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }
    .pulse-ring {
      width: 8px;
      height: 8px;
      background: #2563eb;
      border-radius: 50%;
      box-shadow: 0 0 0 rgba(37,99,235, 0.4);
      animation: pulse 1.2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37,99,235, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(37,99,235, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37,99,235, 0); }
    }
    .loader-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px;
    }
    .loader-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 24px;
    }

    /* Barra de Progresso */
    .progress-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .progress-info-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 10px;
    }
    .progress-step-label {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      text-align: left;
    }
    .progress-percentage {
      font-size: 16px;
      font-weight: 900;
      color: #2563eb;
      font-family: monospace;
    }
    .progress-bar-track {
      width: 100%;
      height: 10px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
      position: relative;
    }
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%);
      border-radius: 9999px;
      transition: width 0.15s ease-out;
      position: relative;
      overflow: hidden;
    }
    .progress-shimmer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    /* Checklist de Etapas */
    .steps-checklist {
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-align: left;
    }
    .step-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border-radius: 8px;
      background: #ffffff;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .step-item.active {
      background: #eff6ff;
      border-color: #bfdbfe;
    }
    .step-item.done {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    .step-icon-badge {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 800;
      background: #e2e8f0;
      color: #64748b;
      shrink: 0;
    }
    .step-item.done .step-icon-badge {
      background: #22c55e;
      color: #ffffff;
    }
    .step-item.active .step-icon-badge {
      background: #3b82f6;
      color: #ffffff;
    }
    .step-desc {
      display: flex;
      flex-direction: column;
    }
    .step-title {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
    }
    .step-sub {
      font-size: 11px;
      color: #64748b;
    }
    .spin-icon {
      animation: spin 1s infinite linear;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Iframe & Device Frames */
    .iframe-container {
      width: 100%;
      height: 100%;
      background: #ffffff;
      transition: opacity 0.3s ease-in-out, transform 0.25s ease-in-out;
      opacity: 0;
    }
    .iframe-container.revealed {
      opacity: 1;
    }
    .iframe-container.mobile-device {
      width: 390px;
      height: 96%;
      max-height: 780px;
      border-radius: 36px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 0 10px #1e293b;
      overflow: hidden;
      position: relative;
      border: 3px solid #334155;
    }
    .device-speaker {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 4px;
      background: #334155;
      border-radius: 4px;
      z-index: 10;
    }
    .preview-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
  `]
})
export class DemoPreviewModalComponent implements OnInit, OnDestroy {
  @Input() business!: Business;
  @Output() close = new EventEmitter<void>();

  viewMode: 'desktop' | 'mobile' = 'desktop';
  copied = false;
  demoUrl = '';
  safeIframeUrl?: SafeResourceUrl;
  demoData?: SiteDemo;

  // Barra de Carregamento & Progresso
  loadingProgress = 15;
  currentStepText = 'Analisando perfil comercial e avaliações do Google...';
  isReady = false;
  private dataLoaded = false;
  private progressInterval: any;

  constructor(
    private siteDemoService: SiteDemoService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const origin = window.location.origin;
    if (this.business.id) {
      this.demoUrl = `${origin}/demo/${this.business.id}`;
    } else {
      this.demoUrl = `${origin}/demo?name=${encodeURIComponent(this.business.name)}`;
    }
    this.safeIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.demoUrl);

    this.startProgress();

    // Carrega dados completos do demo para uso no botão do WhatsApp
    if (this.business.id) {
      this.siteDemoService.getDemo(this.business.id).subscribe({
        next: (demo) => {
          this.demoData = demo;
          this.dataLoaded = true;
        },
        error: () => {
          this.dataLoaded = true;
        }
      });
    } else {
      this.siteDemoService.generatePreview(this.business).subscribe({
        next: (demo) => {
          this.demoData = demo;
          this.dataLoaded = true;
        },
        error: () => {
          this.dataLoaded = true;
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  startProgress() {
    this.loadingProgress = 15;
    this.isReady = false;
    this.dataLoaded = false;
    this.currentStepText = 'Analisando dados do estabelecimento no Google Maps...';

    this.progressInterval = setInterval(() => {
      if (this.loadingProgress < 40) {
        this.loadingProgress += 5;
        this.currentStepText = `Definindo identidade visual e tema para ${this.business.category || 'o comércio'}...`;
      } else if (this.loadingProgress < 75) {
        this.loadingProgress += 5;
        this.currentStepText = 'Gerando catálogo de serviços e argumentos persuasivos...';
      } else if (this.loadingProgress < 92) {
        this.loadingProgress += 4;
        this.currentStepText = 'Verificando disponibilidade do domínio no Registro.br...';
      } else if (this.dataLoaded && this.loadingProgress < 100) {
        this.loadingProgress = 100;
        this.currentStepText = '✨ Demonstração finalizada!';
        clearInterval(this.progressInterval);
        setTimeout(() => {
          this.isReady = true;
        }, 350);
      }
    }, 70);
  }

  copyLink() {
    navigator.clipboard.writeText(this.demoUrl).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2500);
    });
  }

  openWhatsAppWithDemo() {
    if (!this.business.phone) return;
    const digits = this.business.phone.replace(/\\D/g, '');
    let cleanPhone = digits;
    if (!digits.startsWith('55') && (digits.length === 10 || digits.length === 11)) {
      cleanPhone = '55' + digits;
    }

    let pitch = '';
    if (this.demoData && this.demoData.whatsappPitchWithDemo) {
      pitch = this.demoData.whatsappPitchWithDemo;
    } else {
      pitch = `Olá! Tudo bem? Falo com o responsável pela ${this.business.name}? 👋\n\n` +
              `Notei que vocês ainda não tinham um site próprio oficial, então preparei uma demonstração exclusiva de como ficaria a presença digital de vocês no Google:\n` +
              `👉 ${this.demoUrl}\n\n` +
              (this.business.domainAvailable && this.business.suggestedDomain ? `Além disso, o domínio [${this.business.suggestedDomain}] está DISPONÍVEL para registro agora!\n\n` : '') +
              `O que achou da prévia? Teria 2 minutos para conversarmos?`;
    }

    const encoded = encodeURIComponent(pitch);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }
}
