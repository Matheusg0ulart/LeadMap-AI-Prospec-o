import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SiteDemoService } from '../../core/services/site-demo.service';
import { SiteDemo } from '../../core/models/site-demo.model';

@Component({
  selector: 'app-site-demo-public',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="demo-page" *ngIf="demo; else loadingState" [ngClass]="demo.theme">
      <!-- Barra de Identificação Comercial -->
      <div class="demo-topbar">
        <div class="topbar-content">
          <span class="badge-tag">PRÉVIA DE DEMONSTRAÇÃO</span>
          <span class="topbar-text">
            Este é um protótipo de site de alta conversão para <strong>{{ demo.businessName }}</strong>.
            <span *ngIf="demo.domainAvailable && demo.suggestedDomain" class="domain-alert">
              🌐 O domínio oficial <strong>{{ demo.suggestedDomain }}</strong> está DISPONÍVEL para registro!
            </span>
          </span>
          <a *ngIf="demo.suggestedDomain" href="https://registro.br" target="_blank" class="topbar-btn">Ver no Registro.br</a>
        </div>
      </div>

      <!-- Header / Navegação -->
      <header class="site-header">
        <div class="header-container">
          <div class="brand">
            <div class="brand-icon">
              <span>{{ getInitial(demo.businessName) }}</span>
            </div>
            <div class="brand-text">
              <h1 class="brand-name">{{ demo.businessName }}</h1>
              <span class="brand-category">{{ demo.category }}</span>
            </div>
          </div>

          <div class="header-actions">
            <div class="contact-quick">
              <span class="contact-label">Fale Conosco:</span>
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

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-container">
          <div class="hero-badge">
            <span class="star-icon">⭐</span>
            <span class="badge-text">{{ demo.rating }} estrelas no Google Maps</span>
            <span class="bullet">•</span>
            <span class="badge-sub">+{{ demo.reviewCount }} avaliações</span>
          </div>

          <h2 class="hero-headline">{{ demo.headline }}</h2>
          <p class="hero-subheadline">{{ demo.subheadline }}</p>

          <div class="hero-cta-group">
            <a [href]="getWhatsAppUrl()" target="_blank" class="main-cta-btn">
              <svg class="cta-wa-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.297.144.35.49 1.196.533 1.284.043.088.072.19.014.305-.058.115-.087.19-.174.289l-.26.3c-.087.101-.179.21-.077.385.102.174.454.748.974 1.211.669.595 1.233.78 1.407.867.174.087.276.073.377-.044.101-.116.433-.506.549-.68.116-.174.232-.145.39-.087s1.011.477 1.184.564.289.13.332.203c.043.072.043.419-.101.824z"/>
              </svg>
              <span>{{ demo.primaryCta }}</span>
            </a>
            <a href="#servicos" class="secondary-cta-btn">Conhecer Serviços</a>
          </div>

          <!-- Destaques Rápidos -->
          <div class="highlights-row" *ngIf="demo.highlights && demo.highlights.length">
            <div class="highlight-item" *ngFor="let h of demo.highlights">
              <span class="check-icon">✓</span>
              <span>{{ h }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Seção de Serviços -->
      <section id="servicos" class="services-section">
        <div class="section-container">
          <div class="section-header">
            <span class="section-subtitle">NOSSOS SERVIÇOS & PRODUTOS</span>
            <h3 class="section-title">O que oferecemos para você</h3>
            <p class="section-desc">Qualidade incomparável, rapidez e atendimento focado na sua total satisfação.</p>
          </div>

          <div class="services-grid">
            <div class="service-card" *ngFor="let s of demo.services">
              <div class="service-card-top">
                <span class="service-icon-box">{{ getServiceIcon(s.icon) }}</span>
                <span class="service-tag" *ngIf="s.tag">{{ s.tag }}</span>
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

      <!-- Seção Sobre Nós & Diferenciais -->
      <section class="about-section">
        <div class="section-container about-grid">
          <div class="about-text-col">
            <span class="section-subtitle">QUEM SOMOS</span>
            <h3 class="section-title">{{ demo.aboutTitle }}</h3>
            <p class="about-p">{{ demo.aboutText }}</p>

            <div class="trust-features">
              <div class="trust-card">
                <div class="trust-number">{{ demo.rating }}</div>
                <div class="trust-label">Nota de Satisfação no Google</div>
              </div>
              <div class="trust-card">
                <div class="trust-number">+{{ demo.reviewCount }}</div>
                <div class="trust-label">Clientes Satisfeitos</div>
              </div>
              <div class="trust-card">
                <div class="trust-number">100%</div>
                <div class="trust-label">Atendimento Humanizado</div>
              </div>
            </div>
          </div>

          <div class="about-card-col">
            <div class="hours-card">
              <h4 class="hours-title">📍 Onde Nos Encontrar</h4>
              <p class="hours-address"><strong>Endereço:</strong> {{ demo.address }}</p>
              <div class="divider"></div>
              <h4 class="hours-title">⏰ Horário de Funcionamento</h4>
              <p class="hours-text">{{ demo.businessHours }}</p>
              <div class="divider"></div>
              <h4 class="hours-title">📞 Telefone / WhatsApp</h4>
              <p class="hours-text">{{ demo.phone }}</p>
              <a [href]="getWhatsAppUrl()" target="_blank" class="hours-cta-btn">Abrir Conversa no WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Seção de Depoimentos / Avaliações do Google -->
      <section class="testimonials-section" *ngIf="demo.testimonials && demo.testimonials.length">
        <div class="section-container">
          <div class="section-header">
            <span class="section-subtitle">AVALIAÇÕES REAIS</span>
            <h3 class="section-title">O que nossos clientes dizem</h3>
            <p class="section-desc">Avaliações verificadas de quem já conhece nosso padrão de qualidade no Google Maps.</p>
          </div>

          <div class="testimonials-grid">
            <div class="testimonial-card" *ngFor="let t of demo.testimonials">
              <div class="testimonial-stars">
                <span *ngFor="let s of [1,2,3,4,5]">★</span>
              </div>
              <p class="testimonial-text">"{{ t.comment }}"</p>
              <div class="testimonial-author">
                <div class="author-avatar">{{ t.author.charAt(0) }}</div>
                <div>
                  <div class="author-name">{{ t.author }}</div>
                  <div class="author-time">Avaliação no Google • {{ t.timeAgo }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Banner Final de Ação -->
      <section class="final-cta-section">
        <div class="section-container cta-box">
          <h3 class="cta-title">Pronto para ter o melhor atendimento?</h3>
          <p class="cta-sub">Entre em contato agora mesmo pelo WhatsApp e tire suas dúvidas com a nossa equipe.</p>
          <a [href]="getWhatsAppUrl()" target="_blank" class="cta-banner-btn">
            <span>{{ demo.primaryCta }}</span>
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="site-footer">
        <div class="section-container footer-content">
          <div class="footer-brand">
            <div class="footer-name">{{ demo.businessName }}</div>
            <div class="footer-cat">{{ demo.category }} • {{ demo.address }}</div>
          </div>
          <div class="footer-copy">
            © {{ currentYear }} {{ demo.businessName }}. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      <!-- Botão Flutuante do WhatsApp -->
      <a [href]="getWhatsAppUrl()" target="_blank" class="floating-wa-btn" title="Chamar no WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.297.144.35.49 1.196.533 1.284.043.088.072.19.014.305-.058.115-.087.19-.174.289l-.26.3c-.087.101-.179.21-.077.385.102.174.454.748.974 1.211.669.595 1.233.78 1.407.867.174.087.276.073.377-.044.101-.116.433-.506.549-.68.116-.174.232-.145.39-.087s1.011.477 1.184.564.289.13.332.203c.043.072.043.419-.101.824z"/>
        </svg>
      </a>
    </div>

    <ng-template #loadingState>
      <div class="public-loading-screen">
        <div class="public-loader-card">
          <div class="public-badge">
            <span class="public-pulse"></span>
            <span>LEADMAP AI • GERADOR DE SITES</span>
          </div>

          <h2 class="public-title">Sintetizando Demonstração com IA</h2>
          <p class="public-desc">Montando a estrutura e os argumentos de conversão do comércio.</p>

          <!-- Barra de Progresso com Porcentagem -->
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

          <!-- Etapas Dinâmicas -->
          <div class="public-steps">
            <div class="p-step" [class.done]="loadingProgress >= 25" [class.active]="loadingProgress < 25">
              <span class="p-icon">{{ loadingProgress >= 25 ? '✓' : '🔄' }}</span>
              <span>Análise de reputação no Google Maps</span>
            </div>
            <div class="p-step" [class.done]="loadingProgress >= 55" [class.active]="loadingProgress >= 25 && loadingProgress < 55">
              <span class="p-icon">{{ loadingProgress >= 55 ? '✓' : (loadingProgress >= 25 ? '🔄' : '⚪') }}</span>
              <span>Definição de paleta e identidade visual</span>
            </div>
            <div class="p-step" [class.done]="loadingProgress >= 80" [class.active]="loadingProgress >= 55 && loadingProgress < 80">
              <span class="p-icon">{{ loadingProgress >= 80 ? '✓' : (loadingProgress >= 55 ? '🔄' : '⚪') }}</span>
              <span>Catálogo de serviços e argumentos de venda</span>
            </div>
            <div class="p-step" [class.done]="loadingProgress >= 100" [class.active]="loadingProgress >= 80 && loadingProgress < 100">
              <span class="p-icon">{{ loadingProgress >= 100 ? '✓' : (loadingProgress >= 80 ? '🔄' : '⚪') }}</span>
              <span>Checagem no Registro.br e publicação</span>
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
      color: #1e293b;
      background: #f8fafc;
    }

    /* Barra de Notificação Superior */
    .demo-topbar {
      background: #0f172a;
      color: #e2e8f0;
      padding: 8px 16px;
      font-size: 13px;
      border-bottom: 1px solid #1e293b;
    }
    .topbar-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
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
    .domain-alert {
      color: #4ade80;
      font-weight: 600;
      margin-left: 8px;
    }
    .topbar-btn {
      color: #93c5fd;
      text-decoration: underline;
      font-size: 12px;
      font-weight: 600;
    }

    /* Header */
    .site-header {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 40;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .header-container {
      max-width: 1200px;
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
      gap: 12px;
    }
    .brand-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: #fff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 20px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .brand-name {
      margin: 0;
      font-size: 19px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }
    .brand-category {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 20px;
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
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(37,211,102,0.3);
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
      padding: 64px 20px 72px;
      background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
    }
    .hero-container {
      max-width: 860px;
      margin: 0 auto;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fef3c7;
      border: 1px solid #fde68a;
      color: #92400e;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 24px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .star-icon {
      font-size: 14px;
    }
    .bullet {
      color: #d97706;
    }
    .badge-sub {
      color: #b45309;
      font-weight: 500;
    }
    .hero-headline {
      font-size: 42px;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.18;
      margin: 0 0 18px;
      letter-spacing: -0.5px;
    }
    .hero-subheadline {
      font-size: 18px;
      color: #475569;
      line-height: 1.6;
      margin: 0 0 32px;
    }
    .hero-cta-group {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin-bottom: 36px;
      flex-wrap: wrap;
    }
    .main-cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #25d366;
      color: #ffffff;
      font-size: 16px;
      font-weight: 800;
      padding: 14px 28px;
      border-radius: 10px;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(37,211,102,0.35);
      transition: all 0.2s;
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
      border: 1px solid #cbd5e1;
      color: #334155;
      font-size: 15px;
      font-weight: 700;
      padding: 14px 24px;
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .secondary-cta-btn:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }
    .highlights-row {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    .highlight-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #334155;
      font-weight: 600;
    }
    .check-icon {
      color: #16a34a;
      font-weight: 900;
    }

    /* Seções Gerais */
    .section-container {
      max-width: 1140px;
      margin: 0 auto;
      padding: 0 20px;
    }
    .section-header {
      text-align: center;
      margin-bottom: 48px;
    }
    .section-subtitle {
      font-size: 12px;
      font-weight: 800;
      color: #2563eb;
      letter-spacing: 1px;
      text-transform: uppercase;
      display: block;
      margin-bottom: 6px;
    }
    .section-title {
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 10px;
    }
    .section-desc {
      font-size: 16px;
      color: #64748b;
      margin: 0;
    }

    /* Serviços */
    .services-section {
      padding: 72px 0;
      background: #ffffff;
    }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
    }
    .service-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 26px;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
    }
    .service-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 24px rgba(0,0,0,0.06);
      border-color: #cbd5e1;
    }
    .service-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }
    .service-icon-box {
      font-size: 28px;
    }
    .service-tag {
      font-size: 11px;
      font-weight: 700;
      color: #2563eb;
      background: #eff6ff;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .service-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 8px;
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
      font-size: 13px;
      font-weight: 700;
      color: #2563eb;
      text-decoration: none;
    }
    .service-link:hover .arrow {
      transform: translateX(4px);
    }
    .arrow {
      transition: transform 0.2s;
    }

    /* Sobre Nós & Local */
    .about-section {
      padding: 72px 0;
      background: #f1f5f9;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }
    .about-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 40px;
      align-items: center;
    }
    @media (max-width: 860px) {
      .about-grid {
        grid-template-columns: 1fr;
      }
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
      background: #ffffff;
      padding: 16px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      text-align: center;
    }
    .trust-number {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
    }
    .trust-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      margin-top: 4px;
    }
    .hours-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 14px;
      padding: 28px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.04);
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
      margin: 0;
      line-height: 1.5;
    }
    .divider {
      height: 1px;
      background: #f1f5f9;
      margin: 16px 0;
    }
    .hours-cta-btn {
      display: block;
      margin-top: 20px;
      text-align: center;
      background: #25d366;
      color: #ffffff;
      font-weight: 800;
      font-size: 14px;
      padding: 12px;
      border-radius: 8px;
      text-decoration: none;
      transition: background 0.2s;
    }
    .hours-cta-btn:hover {
      background: #20ba5a;
    }

    /* Depoimentos */
    .testimonials-section {
      padding: 72px 0;
      background: #ffffff;
    }
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
    }
    .testimonial-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 24px;
    }
    .testimonial-stars {
      color: #f59e0b;
      font-size: 16px;
      margin-bottom: 12px;
    }
    .testimonial-text {
      font-size: 15px;
      color: #334155;
      font-style: italic;
      line-height: 1.6;
      margin: 0 0 18px;
    }
    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .author-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 15px;
    }
    .author-name {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .author-time {
      font-size: 12px;
      color: #94a3b8;
    }

    /* Banner Final */
    .final-cta-section {
      padding: 60px 0;
      background: #0f172a;
      color: #ffffff;
    }
    .cta-box {
      text-align: center;
    }
    .cta-title {
      font-size: 32px;
      font-weight: 900;
      margin: 0 0 10px;
    }
    .cta-sub {
      font-size: 16px;
      color: #94a3b8;
      margin: 0 0 28px;
    }
    .cta-banner-btn {
      display: inline-block;
      background: #25d366;
      color: #ffffff;
      font-size: 16px;
      font-weight: 800;
      padding: 14px 32px;
      border-radius: 10px;
      text-decoration: none;
      box-shadow: 0 4px 16px rgba(37,211,102,0.4);
      transition: all 0.2s;
    }
    .cta-banner-btn:hover {
      background: #20ba5a;
      transform: translateY(-2px);
    }

    /* Footer */
    .site-footer {
      background: #090d16;
      color: #64748b;
      padding: 28px 0;
      font-size: 13px;
      border-top: 1px solid #1e293b;
    }
    .footer-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .footer-name {
      color: #f1f5f9;
      font-weight: 700;
      font-size: 15px;
    }
    .footer-cat {
      margin-top: 2px;
    }

    /* Floating WhatsApp */
    .floating-wa-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 58px;
      height: 58px;
      background: #25d366;
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 18px rgba(37,211,102,0.45);
      z-index: 50;
      transition: all 0.2s;
    }
    .floating-wa-btn:hover {
      transform: scale(1.08);
      background: #20ba5a;
    }
    .floating-wa-btn svg {
      width: 32px;
      height: 32px;
    }

    /* Loading State com Barra de Progresso */
    .public-loading-screen {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 24px;
    }
    .public-loader-card {
      background: #ffffff;
      border-radius: 16px;
      max-width: 520px;
      width: 100%;
      padding: 36px 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      text-align: center;
    }
    .public-badge {
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
      margin-bottom: 16px;
    }
    .public-pulse {
      width: 8px;
      height: 8px;
      background: #2563eb;
      border-radius: 50%;
      box-shadow: 0 0 0 rgba(37,99,235,0.4);
      animation: pulse 1.2s infinite;
    }
    .public-title {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 8px;
    }
    .public-desc {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 24px;
    }
    .public-progress-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .public-info-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }
    .public-step-text {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      text-align: left;
    }
    .public-percentage {
      font-size: 16px;
      font-weight: 900;
      color: #2563eb;
      font-family: monospace;
    }
    .public-track {
      width: 100%;
      height: 10px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
      position: relative;
    }
    .public-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%);
      border-radius: 9999px;
      transition: width 0.15s ease-out;
      position: relative;
      overflow: hidden;
    }
    .public-shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: shimmer 1.5s infinite;
    }
    .public-steps {
      display: flex;
      flex-direction: column;
      gap: 10px;
      text-align: left;
    }
    .p-step {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #64748b;
      padding: 6px 10px;
      border-radius: 6px;
      background: #f8fafc;
      transition: all 0.2s;
    }
    .p-step.done {
      color: #15803d;
      background: #f0fdf4;
      font-weight: 600;
    }
    .p-step.active {
      color: #1d4ed8;
      background: #eff6ff;
      font-weight: 600;
    }
    .p-icon {
      font-size: 12px;
      font-weight: 800;
    }

    /* Ajustes Mobile */
    @media (max-width: 640px) {
      .hero-headline {
        font-size: 28px;
      }
      .header-actions .contact-quick {
        display: none;
      }
      .brand-name {
        font-size: 16px;
      }
    }
  `]
})
export class SiteDemoPublicComponent implements OnInit, OnDestroy {
  demo?: SiteDemo;
  currentYear = new Date().getFullYear();

  // Progress Bar
  loadingProgress = 15;
  currentStepText = 'Analisando perfil comercial e avaliações do Google...';
  private progressInterval: any;
  private dataLoaded = false;
  private pendingDemoData?: SiteDemo;

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
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  startProgress() {
    this.loadingProgress = 15;
    this.dataLoaded = false;
    this.currentStepText = 'Analisando perfil no Google Maps...';

    this.progressInterval = setInterval(() => {
      if (this.loadingProgress < 40) {
        this.loadingProgress += 6;
        this.currentStepText = 'Definindo identidade visual e paleta de cores...';
      } else if (this.loadingProgress < 75) {
        this.loadingProgress += 5;
        this.currentStepText = 'Gerando catálogo de serviços e argumentos de venda...';
      } else if (this.loadingProgress < 92) {
        this.loadingProgress += 4;
        this.currentStepText = 'Verificando domínio oficial no Registro.br...';
      } else if (this.dataLoaded && this.loadingProgress < 100) {
        this.loadingProgress = 100;
        this.currentStepText = 'Demonstração pronta!';
        clearInterval(this.progressInterval);
        setTimeout(() => {
          this.demo = this.pendingDemoData;
        }, 300);
      }
    }, 60);
  }

  loadDemoById(id: number) {
    this.siteDemoService.getDemo(id).subscribe({
      next: (res) => {
        this.pendingDemoData = res;
        this.dataLoaded = true;
      },
      error: (err) => {
        console.error('Erro ao carregar demonstração:', err);
        this.dataLoaded = true;
      }
    });
  }

  generateFromQuery(name: string, category?: string, address?: string) {
    this.siteDemoService.generatePreview({
      name,
      category: category || 'Comércio Local',
      address: address || 'São Paulo - SP',
      rating: 4.8,
      reviewCount: 35
    }).subscribe({
      next: (res) => {
        this.pendingDemoData = res;
        this.dataLoaded = true;
      },
      error: () => {
        this.dataLoaded = true;
      }
    });
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
}
