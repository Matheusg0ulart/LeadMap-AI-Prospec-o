import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="score-badge-wrapper" [ngClass]="getPillClass()">
      <span class="score-value">{{ score }}</span><span class="score-unit">/100</span>
    </div>
  `,
  styles: [`
    .score-badge-wrapper {
      display: inline-flex;
      align-items: baseline;
      gap: 1px;
      padding: 3px 9px;
      border-radius: 9999px;
      font-size: 0.825rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      border: 1.5px solid transparent;
      flex-shrink: 0;
    }
    .score-value { font-weight: 800; }
    .score-unit { font-size: 0.65rem; opacity: 0.65; margin-left: 1px; font-weight: 600; }

    .pill-high {
      background: linear-gradient(135deg, #dcfce7, #d1fae5);
      color: #15803d;
      border-color: #86efac;
    }
    .pill-medium {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #b45309;
      border-color: #fcd34d;
    }
    .pill-low {
      background: #f1f5f9;
      color: #64748b;
      border-color: #e2e8f0;
    }
  `]
})
export class ScoreBadgeComponent {
  @Input() score: number = 0;
  @Input() showLabel: boolean = true;

  getPillClass(): string {
    if (this.score >= 80) return 'pill-high';
    if (this.score >= 50) return 'pill-medium';
    return 'pill-low';
  }

  getTextClass(): string {
    if (this.score >= 80) return 'text-high';
    if (this.score >= 50) return 'text-medium';
    return 'text-low';
  }

  getClassification(): string {
    if (this.score >= 80) return 'Alto potencial';
    if (this.score >= 50) return 'Potencial médio';
    return 'Baixo potencial';
  }
}
