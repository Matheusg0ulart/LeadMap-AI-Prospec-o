import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SiteDemoService } from '../../core/services/site-demo.service';
import { SiteDemo, DemoFaq } from '../../core/models/site-demo.model';

@Component({
  selector: 'app-site-demo-public',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="demo-page" *ngIf="demo; else loadingState" [ngClass]="demo.theme">
      <!-- Barra Superior de Identificação -->
      <div class="demo-topbar">
        <div class="topbar-content">
          <div class="topbar-left">
            <span class="badge-tag">PRÉVIA DEMONSTRATIVA</span>
            <span class="ai-badge" *ngIf="demo.aiPowered">✨ GERADO COM GEMINI AI</span>
            <span class="topbar-text">
              Protótipo de alta conversão para <strong>{{ demo.businessName }}</strong>
            </span>
          </div>

          <div class="topbar-right">
            <span *ngIf="demo.domainAvailable && demo.suggestedDomain" class="domain-alert">
              🌐 O domínio <strong>{{ demo.suggestedDomain }}</strong> está DISPONÍVEL!
            </span>
            <a *ngIf="demo.suggestedDomain" href="https://registro.br" target="_blank" class="topbar-btn">
              Garantir Domínio
            </a>
          </div>
        </div>
      </div>

      <!-- Header Principal -->
      <header class="site-header">
        <div class="header-container">
          <div class="brand">
            <div class="brand-icon">
              <span>{{ getInitial(demo.businessName) }}</span>
            </div>
            <div class="brand-text">
              <div class="brand-row">
                <h1 class="brand-name">{{ demo.businessName }}</h1>
                <span class="status-live">
                  <span class="live-dot"></span> Aberto Agora
                </span>
              </div>
              <span class="brand-category">{{ demo.category }}</span>
            </div>
          </div>

          <div class="header-actions">
            <div class="contact-quick">
              <span class="contact-label">Atendimento Rápido:</span>
              <a [href]="'tel:' + demo.phone" class="phone-link">{{ demo.phone }}</a>
            </div>
            <a [href]="getWhatsAppUrl()" target="_blank" class="header-cta-btn">
              <svg class="wa-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.297.144.35.49 1.196.533 1.284.043.088.072.19.014.305-.058.115-.087.19-.174.289l-.26.3c-.087.101-.179.21-.077.385.102.174.454.748.974 1.211.669.595 1.233.78 1.407.867.174.087.276.073.377-.044.101-.116.433-.506.549-.68.116-.174.232-.145.39-.087s1.011.477 1.184.564.289.13.332.203c.043.072.043.419-.101.824z"/>
              </svg>
              <span>{{ demo.primaryCta }}</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Hero Section (Split Layout) -->
      <section class="hero-section">
        <div class="hero-container">
          <div class="hero-content">
            <div class="hero-badge">
              <span class="star-icon">⭐</span>
              <span class="badge-text">{{ demo.rating }} estrelas no Google</span>
              <span class="bullet">•</span>
              <span class="badge-sub">+{{ demo.reviewCount }} avaliações verificadas</span>
            </div>

            <p class="hero-slogan" *ngIf="demo.slogan">{{ demo.slogan }}</p>
            <h2 class="hero-headline">{{ demo.headline }}</h2>
            <p class="hero-subheadline">{{ demo.subheadline }}</p>

            <div class="hero-cta-group">
              <a [href]="getWhatsAppUrl()" target="_blank" class="main-cta-btn">
                <svg class="cta-wa-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.297.144.35.49 1.196.533 1.284.043.088.072.19.014.305-.058.115-.087.19-.174.289l-.26.3c-.087.101-.179.21-.077.385.102.174.454.748.974 1.211.669.595 1.233.78 1.407.867.174.087.276.073.377-.044.101-.116.433-.506.549-.68.116-.174.232-.145.39-.087s1.011.477 1.184.564.289.13.332.203c.043.072.043.419-.101.824z"/>
                </svg>
                <span>{{ demo.primaryCta }}</span>
              </a>
              <a href="#servicos" class="secondary-cta-btn">Ver Serviços & Preços</a>
            </div>

            <!-- Destaques / Selos de Confiança -->
            <div class="highlights-row" *ngIf="demo.highlights && demo.highlights.length">
              <div class="highlight-item" *ngFor="let h of demo.highlights">
                <span class="check-icon">✓</span>
                <span>{{ h }}</span>
              </div>
            </div>
          </div>

          <!-- Card Visual com Foto do Nicho -->
          <div class="hero-visual" *ngIf="demo.heroImageUrl">
            <div class="visual-wrapper">
              <img [src]="demo.heroImageUrl" [alt]="demo.businessName" class="hero-img" loading="lazy" />
              <div class="floating-proof-card">
                <div class="proof-header">
                  <span class="proof-stars">★★★★★</span>
                  <span class="proof-score">{{ demo.rating }}</span>
                </div>
                <p class="proof-text">Reconhecido no Google Maps</p>
                <div class="proof-pill">Atendimento 100% Personalizado</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Barra de Estatísticas / Métricas de Impacto -->
      <section class="stats-bar">
        <div class="section-container stats-grid">
          <div class="stat-card">
            <div class="stat-num">{{ demo.rating }} ★</div>
            <div class="stat-label">Nota no Google Maps</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">+{{ demo.reviewCount }}</div>
            <div class="stat-label">Clientes Avaliaram</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">100%</div>
            <div class="stat-label">Procedência & Qualidade</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">&lt; 5 min</div>
            <div class="stat-label">Resposta no WhatsApp</div>
          </div>
        </div>
      </section>

      <!-- Seção de Serviços / Produtos -->
      <section id="servicos" class="services-section">
        <div class="section-container">
          <div class="section-header">
            <span class="section-subtitle">O QUE OFERECEMOS</span>
            <h3 class="section-title">Serviços e Soluções em Destaque</h3>
            <p class="section-desc">Padrão de atendimento superior com total transparência e foco no seu bem-estar.</p>
          </div>

          <div class="services-grid">
            <div class="service-card" *ngFor="let s of demo.services">
              <div class="service-card-top">
                <span class="service-icon-box">{{ getServiceIcon(s.icon) }}</span>
                <div class="service-badges">
                  <span class="service-tag" *ngIf="s.tag">{{ s.tag }}</span>
                  <span class="service-price" *ngIf="s.priceBadge">{{ s.priceBadge }}</span>
                </div>
              </div>
              <h4 class="service-title">{{ s.title }}</h4>
              <p class="service-desc">{{ s.description }}</p>
              <a [href]="getWhatsAppServiceUrl(s.title)" target="_blank" class="service-link">
                <span>Quero este serviço</span>
                <span class="arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Seção de Diferenciais (Por Que Nos Escolher) -->
      <section class="pillars-section" *ngIf="demo.pillars && demo.pillars.length">
        <div class="section-container">
          <div class="section-header">
            <span class="section-subtitle">NOSSOS PILARES</span>
            <h3 class="section-title">Por Que Escolher a {{ demo.businessName }}?</h3>
            <p class="section-desc">Nosso compromisso é entregar excelência em cada detalhe do atendimento.</p>
          </div>

          <div class="pillars-grid">
            <div class="pillar-card" *ngFor="let p of demo.pillars">
              <div class="pillar-icon">{{ getPillarIcon(p.icon) }}</div>
              <h4 class="pillar-title">{{ p.title }}</h4>
              <p class="pillar-desc">{{ p.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Galeria de Fotos / Visual Showcase -->
      <section class="gallery-section" *ngIf="demo.galleryImages && demo.galleryImages.length">
        <div class="section-container">
          <div class="section-header">
            <span class="section-subtitle">AMBIENTE & TRABALHO</span>
            <h3 class="section-title">Conheça Nossos Padrões</h3>
            <p class="section-desc">Estrutura preparada para receber você com conforto e dedicação.</p>
          </div>

          <div class="gallery-grid">
            <div class="gallery-item" *ngFor="let img of demo.galleryImages; let i = index">
              <img [src]="img" [alt]="demo.businessName + ' foto ' + (i+1)" loading="lazy" />
              <div class="gallery-overlay">
                <span class="gallery-zoom">🔍 Ver Detalhes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Seção Sobre Nós & Contato / Localização -->
      <section class="about-section">
        <div class="section-container about-grid">
          <div class="about-text-col">
            <span class="section-subtitle">CONHEÇA NOSSA HISTÓRIA</span>
            <h3 class="section-title">{{ demo.aboutTitle }}</h3>
            <p class="about-p">{{ demo.aboutText }}</p>

            <div class="trust-features">
              <div class="trust-card">
                <div class="trust-number">{{ demo.rating }}</div>
                <div class="trust-label">Nota Média Google Maps</div>
              </div>
              <div class="trust-card">
                <div class="trust-number">+{{ demo.reviewCount }}</div>
                <div class="trust-label">Clientes Satisfeitos</div>
              </div>
              <div class="trust-card">
                <div class="trust-number">100%</div>
                <div class="trust-label">Atendimento Dedicado</div>
              </div>
            </div>
          </div>

          <div class="about-card-col">
            <div class="hours-card">
              <div class="card-badge-header">
                <span class="dot-active"></span> INFORMAÇÕES DE CONTATO
              </div>
              <h4 class="hours-title">📍 Onde Nos Encontrar</h4>
              <p class="hours-address"><strong>Endereço:</strong> {{ demo.address }}</p>
              <a [href]="getMapsUrl()" target="_blank" class="maps-link">Ver localização no Google Maps ↗</a>

              <div class="divider"></div>

              <h4 class="hours-title">⏰ Horário de Atendimento</h4>
              <p class="hours-text">{{ demo.businessHours }}</p>

              <div class="divider"></div>

              <h4 class="hours-title">📞 Telefone & WhatsApp</h4>
              <p class="hours-text"><strong>{{ demo.phone }}</strong></p>

              <a [href]="getWhatsAppUrl()" target="_blank" class="hours-cta-btn">
                Abrir Conversa no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Seção de Depoimentos do Google -->
      <section class="testimonials-section" *ngIf="demo.testimonials && demo.testimonials.length">
        <div class="section-container">
          <div class="section-header">
            <span class="section-subtitle">AVALIAÇÕES REAIS</span>
            <h3 class="section-title">O Que Nossos Clientes Dizem</h3>
            <p class="section-desc">Avaliações verificadas de quem já confiou na nossa equipe pelo Google Maps.</p>
          </div>

          <div class="testimonials-grid">
            <div class="testimonial-card" *ngFor="let t of demo.testimonials">
              <div class="testimonial-top">
                <div class="testimonial-stars">
                  <span *ngFor="let s of [1,2,3,4,5]">★</span>
                </div>
                <span class="google-badge">Verificado no Google</span>
              </div>
              <p class="testimonial-text">"{{ t.comment }}"</p>
              <div class="testimonial-author">
                <div class="author-avatar">{{ t.author.charAt(0) }}</div>
                <div>
                  <div class="author-name">{{ t.author }}</div>
                  <div class="author-time">Avaliação pública • {{ t.timeAgo }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Perguntas Frequentes (FAQ) -->
      <section class="faq-section" *ngIf="demo.faqs && demo.faqs.length">
        <div class="section-container">
          <div class="section-header">
            <span class="section-subtitle">TIRE SUAS DÚVIDAS</span>
            <h3 class="section-title">Perguntas Frequentes</h3>
            <p class="section-desc">Esclareça suas dúvidas com rapidez ou nos chame no WhatsApp.</p>
          </div>

          <div class="faq-list">
            <div class="faq-item" *ngFor="let f of demo.faqs" (click)="toggleFaq(f)" [class.open]="f.open">
              <div class="faq-question">
                <span>{{ f.question }}</span>
                <span class="faq-toggle">{{ f.open ? '−' : '+' }}</span>
              </div>
              <div class="faq-answer" *ngIf="f.open">
                <p>{{ f.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Banner Final de Chamada -->
      <section class="final-cta-section">
        <div class="section-container cta-box">
          <span class="cta-pill">ATENDIMENTO IMEDIATO</span>
          <h3 class="cta-title">Pronto para Ter a Melhor Experiência?</h3>
          <p class="cta-sub">
            Converse agora mesmo com a equipe da <strong>{{ demo.businessName }}</strong> e tire suas dúvidas sem compromisso.
          </p>
          <a [href]="getWhatsAppUrl()" target="_blank" class="cta-banner-btn">
            <svg class="wa-icon-large" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.297.144.35.49 1.196.533 1.284.043.088.072.19.014.305-.058.115-.087.19-.174.289l-.26.3c-.087.101-.179.21-.077.385.102.174.454.748.974 1.211.669.595 1.233.78 1.407.867.174.087.276.073.377-.044.101-.116.433-.506.549-.68.116-.174.232-.145.39-.087s1.011.477 1.184.564.289.13.332.203c.043.072.043.419-.101.824z"/>
            </svg>
            <span>{{ demo.primaryCta }}</span>
          </a>
        </div>
      </section>

      <!-- Rodapé -->
      <footer class="site-footer">
        <div class="section-container footer-content">
          <div class="footer-brand">
            <div class="footer-name">{{ demo.businessName }}</div>
            <div class="footer-cat">{{ demo.category }} • {{ demo.address }}</div>
          </div>
          <div class="footer-copy">
            © {{ currentYear }} {{ demo.businessName }}. Demonstração produzida por LeadMap AI.
          </div>
        </div>
      </footer>

      <!-- Barra Fixa Inferior para Mobile (100% Responsivo) -->
      <div class="mobile-sticky-bar">
        <a [href]="'tel:' + demo.phone" class="mobile-call-btn" title="Ligar">
          📞 Ligar
        </a>
        <a [href]="getWhatsAppUrl()" target="_blank" class="mobile-wa-btn">
          <span>💬 Conversar no WhatsApp</span>
        </a>
      </div>

      <!-- Botão Flutuante do WhatsApp -->
      <div class="floating-wa-wrapper">
        <div class="floating-wa-tooltip">
          👋 Olá! Precisa de orçamento ou ajuda?
        </div>
        <a [href]="getWhatsAppUrl()" target="_blank" class="floating-wa-btn" title="Falar no WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.297.144.35.49 1.196.533 1.284.043.088.072.19.014.305-.058.115-.087.19-.174.289l-.26.3c-.087.101-.179.21-.077.385.102.174.454.748.974 1.211.669.595 1.233.78 1.407.867.174.087.276.073.377-.044.101-.116.433-.506.549-.68.116-.174.232-.145.39-.087s1.011.477 1.184.564.289.13.332.203c.043.072.043.419-.101.824z"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- Tela de Carregamento Rápido -->
    <ng-template #loadingState>
      <div class="public-loading-screen">
        <div class="public-loader-card">
          <div class="public-badge">
            <span class="public-pulse"></span>
            <span>LEADMAP AI • SÍNTESE INTELIGENTE</span>
          </div>

          <h2 class="public-title">Construindo Demonstração com IA</h2>
          <p class="public-desc">Analisando reputação no Google Maps e gerando copy de alta conversão.</p>

          <div class="public-progress-box">
            <div class="public-info-row">
              <span class="public-step-text">{{ currentStepText }}</span>
              <span class="public-percentage">{{ loadingProgress }}%</span>
            </div>
            <div class="public-track">
              <div class="public-fill" [style.width.%]="loadingProgress">
                <div class="public-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Temas de Cor Dinâmicos */
    .demo-page.emerald {
      --primary: #059669;
      --primary-hover: #047857;
      --accent: #10b981;
      --hero-bg: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
    }
    .demo-page.gold-dark {
      --primary: #d97706;
      --primary-hover: #b45309;
      --accent: #f59e0b;
      --hero-bg: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      --hero-color: #ffffff;
    }
    .demo-page.crimson {
      --primary: #dc2626;
      --primary-hover: #b91c1c;
      --accent: #ef4444;
      --hero-bg: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%);
    }
    .demo-page.blue {
      --primary: #0284c7;
      --primary-hover: #0369a1;
      --accent: #38bdf8;
      --hero-bg: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    }
    .demo-page.slate {
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --accent: #3b82f6;
      --hero-bg: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }
    .demo-page.purple {
      --primary: #7e22ce;
      --primary-hover: #6b21a8;
      --accent: #a855f7;
      --hero-bg: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
    }
    .demo-page.amber {
      --primary: #b45309;
      --primary-hover: #92400e;
      --accent: #d97706;
      --hero-bg: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    }
    .demo-page.indigo {
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --accent: #6366f1;
      --hero-bg: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
    }

    /* Barra Superior Informativa */
    .demo-topbar {
      background: #090d16;
      color: #cbd5e1;
      padding: 9px 16px;
      font-size: 13px;
      border-bottom: 1px solid #1e293b;
    }
    .topbar-content {
      max-width: 1240px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }
    .topbar-left, .topbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .badge-tag {
      background: #2563eb;
      color: #fff;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    .ai-badge {
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
      color: #ffffff;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      letter-spacing: 0.4px;
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
    }
    .domain-alert {
      color: #4ade80;
      font-weight: 600;
    }
    .topbar-btn {
      background: rgba(255,255,255,0.12);
      color: #ffffff;
      padding: 3px 10px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 12px;
      font-weight: 600;
      transition: background 0.2s;
    }
    .topbar-btn:hover {
      background: rgba(255,255,255,0.22);
    }

    /* Header Navegação */
    .site-header {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    }
    .header-container {
      max-width: 1240px;
      margin: 0 auto;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-icon {
      width: 46px;
      height: 46px;
      background: var(--primary, #0f172a);
      color: #ffffff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 22px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-name {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }
    .status-live {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 700;
      color: #15803d;
      background: #dcfce7;
      padding: 2px 8px;
      border-radius: 9999px;
    }
    .live-dot {
      width: 6px;
      height: 6px;
      background: #16a34a;
      border-radius: 50%;
      box-shadow: 0 0 6px #16a34a;
    }
    .brand-category {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .contact-quick {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .contact-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
    }
    .phone-link {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      text-decoration: none;
    }
    .header-cta-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #25d366;
      color: #ffffff;
      font-weight: 700;
      font-size: 14px;
      padding: 10px 18px;
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.2s ease;
      box-shadow: 0 3px 12px rgba(37,211,102,0.3);
    }
    .header-cta-btn:hover {
      background: #20ba5a;
      transform: translateY(-1px);
    }
    .wa-icon {
      width: 18px;
      height: 18px;
    }

    /* Hero Section */
    .hero-section {
      padding: 56px 20px 64px;
      background: var(--hero-bg, #f8fafc);
      position: relative;
      overflow: hidden;
      border-bottom: 1px solid #e2e8f0;
    }
    .demo-page.gold-dark .hero-section {
      color: #ffffff;
    }
    .hero-container {
      max-width: 1240px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      align-items: center;
      gap: 48px;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      color: #92400e;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 18px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }
    .demo-page.gold-dark .hero-badge {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.2);
      color: #fbbf24;
    }
    .bullet {
      color: #d97706;
    }
    .badge-sub {
      color: #64748b;
      font-weight: 500;
    }
    .demo-page.gold-dark .badge-sub {
      color: #cbd5e1;
    }
    .hero-slogan {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--primary, #2563eb);
      margin: 0 0 10px;
    }
    .hero-headline {
      font-size: 42px;
      font-weight: 900;
      color: inherit;
      line-height: 1.16;
      margin: 0 0 18px;
      letter-spacing: -0.02em;
    }
    .hero-subheadline {
      font-size: 18px;
      color: #475569;
      line-height: 1.6;
      margin: 0 0 32px;
    }
    .demo-page.gold-dark .hero-subheadline {
      color: #cbd5e1;
    }
    .hero-cta-group {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }
    .main-cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #25d366;
      color: #ffffff;
      font-weight: 800;
      font-size: 16px;
      padding: 14px 26px;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s ease;
      box-shadow: 0 4px 16px rgba(37,211,102,0.35);
    }
    .main-cta-btn:hover {
      background: #20ba5a;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(37,211,102,0.45);
    }
    .cta-wa-icon {
      width: 22px;
      height: 22px;
    }
    .secondary-cta-btn {
      display: inline-flex;
      align-items: center;
      background: #ffffff;
      color: #0f172a;
      font-weight: 700;
      font-size: 15px;
      padding: 14px 22px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      text-decoration: none;
      transition: all 0.2s;
    }
    .secondary-cta-btn:hover {
      background: #f1f5f9;
      border-color: #94a3b8;
    }
    .highlights-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .highlight-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #334155;
    }
    .demo-page.gold-dark .highlight-item {
      color: #e2e8f0;
    }
    .check-icon {
      color: var(--primary, #16a34a);
      font-weight: 900;
    }

    /* Hero Visual Card */
    .hero-visual {
      position: relative;
    }
    .visual-wrapper {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 16px 36px rgba(0,0,0,0.12);
      border: 4px solid #ffffff;
    }
    .hero-img {
      width: 100%;
      height: 380px;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }
    .hero-img:hover {
      transform: scale(1.03);
    }
    .floating-proof-card {
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(12px);
      padding: 14px 18px;
      border-radius: 14px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      border: 1px solid rgba(255,255,255,0.6);
      color: #0f172a;
    }
    .proof-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;
    }
    .proof-stars {
      color: #f59e0b;
      font-size: 16px;
    }
    .proof-score {
      font-weight: 800;
      font-size: 15px;
    }
    .proof-text {
      font-size: 13px;
      color: #475569;
      margin: 0 0 6px;
      font-weight: 500;
    }
    .proof-pill {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      color: var(--primary, #2563eb);
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 6px;
    }

    /* Stats Bar */
    .stats-bar {
      background: #ffffff;
      padding: 28px 20px;
      border-bottom: 1px solid #e2e8f0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .stat-card {
      text-align: center;
      padding: 12px;
      border-right: 1px solid #f1f5f9;
    }
    .stat-card:last-child {
      border-right: none;
    }
    .stat-num {
      font-size: 28px;
      font-weight: 900;
      color: var(--primary, #0f172a);
      line-height: 1.1;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
    }

    /* Seções Gerais */
    .section-container {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 20px;
    }
    .section-header {
      text-align: center;
      max-width: 720px;
      margin: 0 auto 48px;
    }
    .section-subtitle {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: var(--primary, #2563eb);
      display: block;
      margin-bottom: 8px;
    }
    .section-title {
      font-size: 32px;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.25;
      margin: 0 0 12px;
      letter-spacing: -0.02em;
    }
    .section-desc {
      font-size: 16px;
      color: #64748b;
      margin: 0;
    }

    /* Serviços Grid */
    .services-section {
      padding: 72px 0;
      background: #f8fafc;
    }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
    }
    .service-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      transition: all 0.25s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .service-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.08);
      border-color: #cbd5e1;
    }
    .service-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .service-icon-box {
      font-size: 32px;
      line-height: 1;
    }
    .service-badges {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .service-tag {
      background: #eff6ff;
      color: #2563eb;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .service-price {
      background: #dcfce7;
      color: #15803d;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .service-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 8px;
      line-height: 1.3;
    }
    .service-desc {
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
      margin: 0 0 20px;
      flex-grow: 1;
    }
    .service-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--primary, #2563eb);
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      transition: gap 0.2s;
    }
    .service-link:hover {
      gap: 10px;
    }

    /* Pilares (Por Que Nos Escolher) */
    .pillars-section {
      padding: 68px 0;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
    }
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
    }
    .pillar-card {
      padding: 24px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      transition: background 0.2s;
    }
    .pillar-card:hover {
      background: #f1f5f9;
    }
    .pillar-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }
    .pillar-title {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 8px;
    }
    .pillar-desc {
      font-size: 14px;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }

    /* Galeria de Fotos */
    .gallery-section {
      padding: 68px 0;
      background: #f8fafc;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .gallery-item {
      position: relative;
      border-radius: 14px;
      overflow: hidden;
      height: 240px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.06);
    }
    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .gallery-item:hover img {
      transform: scale(1.06);
    }
    .gallery-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .gallery-item:hover .gallery-overlay {
      opacity: 1;
    }
    .gallery-zoom {
      background: rgba(255,255,255,0.9);
      color: #0f172a;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
    }

    /* Sobre Nós & Contato */
    .about-section {
      padding: 72px 0;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
    }
    .about-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 48px;
      align-items: center;
    }
    .about-p {
      font-size: 16px;
      color: #475569;
      line-height: 1.7;
      margin: 0 0 28px;
    }
    .trust-features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .trust-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .trust-number {
      font-size: 24px;
      font-weight: 900;
      color: var(--primary, #0f172a);
      margin-bottom: 4px;
    }
    .trust-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
    }
    .hours-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
    }
    .card-badge-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #15803d;
      margin-bottom: 16px;
    }
    .dot-active {
      width: 8px;
      height: 8px;
      background: #16a34a;
      border-radius: 50%;
    }
    .hours-title {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px;
    }
    .hours-address, .hours-text {
      font-size: 14px;
      color: #475569;
      margin: 0 0 8px;
      line-height: 1.5;
    }
    .maps-link {
      display: inline-block;
      font-size: 13px;
      font-weight: 700;
      color: #2563eb;
      text-decoration: none;
      margin-bottom: 12px;
    }
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 14px 0;
    }
    .hours-cta-btn {
      display: block;
      width: 100%;
      text-align: center;
      background: #25d366;
      color: #ffffff;
      font-weight: 800;
      font-size: 15px;
      padding: 12px 18px;
      border-radius: 10px;
      text-decoration: none;
      margin-top: 18px;
      transition: background 0.2s;
      box-sizing: border-box;
    }
    .hours-cta-btn:hover {
      background: #20ba5a;
    }

    /* Depoimentos */
    .testimonials-section {
      padding: 72px 0;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }
    .testimonial-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .testimonial-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .testimonial-stars {
      color: #f59e0b;
      font-size: 17px;
    }
    .google-badge {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .testimonial-text {
      font-size: 15px;
      color: #334155;
      line-height: 1.6;
      margin: 0 0 18px;
      font-style: italic;
    }
    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .author-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
    }
    .author-name {
      font-weight: 700;
      font-size: 14px;
      color: #0f172a;
    }
    .author-time {
      font-size: 12px;
      color: #94a3b8;
    }

    /* FAQ */
    .faq-section {
      padding: 72px 0;
      background: #ffffff;
    }
    .faq-list {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .faq-item {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #f8fafc;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .faq-item:hover {
      border-color: #cbd5e1;
    }
    .faq-question {
      padding: 18px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 700;
      font-size: 16px;
      color: #0f172a;
    }
    .faq-toggle {
      font-size: 20px;
      color: #64748b;
      line-height: 1;
    }
    .faq-answer {
      padding: 0 22px 18px;
      font-size: 15px;
      color: #475569;
      line-height: 1.6;
      border-top: 1px solid #f1f5f9;
    }
    .faq-answer p {
      margin: 12px 0 0;
    }

    /* Banner Final de Conversão */
    .final-cta-section {
      padding: 64px 20px;
      background: #f8fafc;
    }
    .cta-box {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      border-radius: 24px;
      padding: 56px 32px;
      text-align: center;
      box-shadow: 0 16px 36px rgba(0,0,0,0.12);
    }
    .cta-pill {
      display: inline-block;
      background: rgba(255,255,255,0.14);
      color: #38bdf8;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    .cta-title {
      font-size: 36px;
      font-weight: 900;
      margin: 0 0 14px;
      line-height: 1.2;
    }
    .cta-sub {
      font-size: 18px;
      color: #cbd5e1;
      max-width: 640px;
      margin: 0 auto 32px;
      line-height: 1.6;
    }
    .cta-banner-btn {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #25d366;
      color: #ffffff;
      font-weight: 800;
      font-size: 18px;
      padding: 16px 36px;
      border-radius: 14px;
      text-decoration: none;
      box-shadow: 0 6px 24px rgba(37,211,102,0.4);
      transition: all 0.2s ease;
    }
    .cta-banner-btn:hover {
      background: #20ba5a;
      transform: translateY(-2px);
    }
    .wa-icon-large {
      width: 24px;
      height: 24px;
    }

    /* Footer */
    .site-footer {
      background: #090d16;
      color: #94a3b8;
      padding: 32px 0;
      font-size: 14px;
      border-top: 1px solid #1e293b;
    }
    .footer-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }
    .footer-name {
      font-weight: 800;
      color: #ffffff;
      font-size: 16px;
      margin-bottom: 4px;
    }
    .footer-cat {
      font-size: 13px;
    }

    /* Mobile Sticky Bar (Apenas em telas pequenas) */
    .mobile-sticky-bar {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #ffffff;
      padding: 10px 16px;
      box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
      z-index: 90;
      gap: 10px;
      border-top: 1px solid #e2e8f0;
    }
    .mobile-call-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      font-size: 14px;
      padding: 12px 16px;
      border-radius: 10px;
      text-decoration: none;
      flex: 1;
    }
    .mobile-wa-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #25d366;
      color: #ffffff;
      font-weight: 800;
      font-size: 15px;
      padding: 12px 20px;
      border-radius: 10px;
      text-decoration: none;
      flex: 2;
    }

    /* Floating WhatsApp Button */
    .floating-wa-wrapper {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .floating-wa-tooltip {
      background: #ffffff;
      color: #0f172a;
      font-size: 13px;
      font-weight: 700;
      padding: 8px 14px;
      border-radius: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      border: 1px solid #e2e8f0;
      white-space: nowrap;
      animation: bounce 2s infinite;
    }
    .floating-wa-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #25d366;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 24px rgba(37,211,102,0.45);
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .floating-wa-btn:hover {
      background: #20ba5a;
      transform: scale(1.08);
    }
    .floating-wa-btn svg {
      width: 32px;
      height: 32px;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    /* Tela de Carregamento Rápido */
    .public-loading-screen {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #090d16 0%, #1e293b 100%);
    }
    .public-loader-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 40px 32px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 48px rgba(0,0,0,0.3);
    }
    .public-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #eff6ff;
      color: #2563eb;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    .public-pulse {
      width: 8px;
      height: 8px;
      background: #2563eb;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.8; }
    }
    .public-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 8px;
    }
    .public-desc {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 24px;
    }
    .public-progress-box {
      margin-top: 12px;
    }
    .public-info-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 8px;
    }
    .public-percentage {
      font-weight: 800;
      color: #2563eb;
    }
    .public-track {
      height: 10px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }
    .public-fill {
      height: 100%;
      background: linear-gradient(90deg, #2563eb 0%, #38bdf8 100%);
      transition: width 0.3s ease;
    }

    /* RESPONSIVIDADE 100% (Mobile, Tablet, Desktop) */
    @media (max-width: 1024px) {
      .hero-container {
        grid-template-columns: 1fr;
        gap: 36px;
      }
      .hero-img {
        height: 300px;
      }
      .about-grid {
        grid-template-columns: 1fr;
        gap: 36px;
      }
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
      .stat-card {
        border-right: none;
        border-bottom: 1px solid #f1f5f9;
      }
    }

    @media (max-width: 768px) {
      .hero-section {
        padding: 36px 16px 44px;
      }
      .hero-headline {
        font-size: 28px;
      }
      .hero-subheadline {
        font-size: 15px;
      }
      .section-title {
        font-size: 24px;
      }
      .header-actions .contact-quick {
        display: none;
      }
      .header-cta-btn {
        padding: 8px 14px;
        font-size: 13px;
      }
      .gallery-grid {
        grid-template-columns: 1fr;
      }
      .gallery-item {
        height: 200px;
      }
      .trust-features {
        grid-template-columns: 1fr;
      }
      .floating-wa-tooltip {
        display: none;
      }
      .mobile-sticky-bar {
        display: flex;
      }
      .floating-wa-wrapper {
        bottom: 80px;
        right: 16px;
      }
      .site-footer {
        padding-bottom: 88px;
      }
    }
  `]
})
export class SiteDemoPublicComponent implements OnInit, OnDestroy {
  demo?: SiteDemo;
  currentYear = new Date().getFullYear();

  private cdr = inject(ChangeDetectorRef);

  // Barra de Progresso Rápida
  loadingProgress = 40;
  currentStepText = 'Analisando dados comerciais...';
  private progressTimer: any;

  constructor(
    private route: ActivatedRoute,
    private siteDemoService: SiteDemoService
  ) {}

  ngOnInit() {
    this.startProgress();

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadDemoById(+id);
      } else {
        this.route.queryParams.subscribe(qp => {
          if (qp['name']) {
            this.generateFromQuery(qp['name'], qp['category'], qp['address']);
          } else {
            this.loadDemoById(144);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.progressTimer) {
      clearTimeout(this.progressTimer);
    }
  }

  startProgress() {
    this.loadingProgress = 40;
    this.currentStepText = 'Analisando perfil comercial no Google Maps...';
    this.cdr.detectChanges();

    this.progressTimer = setTimeout(() => {
      if (!this.demo) {
        this.loadingProgress = 85;
        this.currentStepText = 'Estruturando identidade e catálogo com IA...';
        this.cdr.detectChanges();
      }
    }, 200);
  }

  loadDemoById(id: number) {
    this.siteDemoService.getDemo(id).subscribe({
      next: (res) => {
        this.loadingProgress = 100;
        this.currentStepText = 'Demonstração pronta!';
        this.demo = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar demonstração:', err);
      }
    });
  }

  generateFromQuery(name: string, category?: string, address?: string) {
    this.siteDemoService.generatePreview({
      name,
      category: category || 'Comércio Local',
      address: address || 'São Paulo - SP',
      rating: 4.9,
      reviewCount: 48
    }).subscribe({
      next: (res) => {
        this.loadingProgress = 100;
        this.currentStepText = 'Demonstração pronta!';
        this.demo = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao gerar demonstração:', err);
      }
    });
  }

  toggleFaq(faq: DemoFaq) {
    faq.open = !faq.open;
    this.cdr.detectChanges();
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : 'L';
  }

  getServiceIcon(icon: string): string {
    switch (icon) {
      case 'scissors': return '✂️';
      case 'utensils': return '🥩';
      case 'sparkles': return '✨';
      case 'shield': return '🛡️';
      case 'heart': return '❤️';
      case 'truck': return '🚚';
      case 'star': return '⭐';
      default: return '💎';
    }
  }

  getPillarIcon(icon: string): string {
    switch (icon) {
      case 'shield': return '🛡️';
      case 'heart': return '❤️';
      case 'clock': return '⏱️';
      case 'award': return '🏆';
      case 'star': return '⭐';
      case 'truck': return '🚚';
      case 'sparkles': return '✨';
      default: return '✔️';
    }
  }

  getWhatsAppUrl(): string {
    if (!this.demo) return '#';
    const num = this.demo.whatsappNumber || '5511999999999';
    const text = encodeURIComponent(`Olá! Vi o site oficial da ${this.demo.businessName} e gostaria de informações sobre os serviços.`);
    return `https://wa.me/${num}?text=${text}`;
  }

  getWhatsAppServiceUrl(serviceTitle: string): string {
    if (!this.demo) return '#';
    const num = this.demo.whatsappNumber || '5511999999999';
    const text = encodeURIComponent(`Olá! Vi no site de vocês sobre "${serviceTitle}" e gostaria de mais informações!`);
    return `https://wa.me/${num}?text=${text}`;
  }

  getMapsUrl(): string {
    if (!this.demo || !this.demo.address) return '#';
    const query = encodeURIComponent(`${this.demo.businessName}, ${this.demo.address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
}
