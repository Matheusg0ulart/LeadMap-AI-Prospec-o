import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-2">
      <div class="score-pill" [ngClass]="getPillClass()">
        <span class="font-bold">{{ score }}</span><span class="text-[10px] opacity-75">/100</span>
      </div>
      <div *ngIf="showLabel" class="text-xs font-semibold uppercase tracking-wider" [ngClass]="getTextClass()">
        {{ getClassification() }}
      </div>
    </div>
  `,
  styles: [`
    .score-pill {
      display: inline-flex;
      align-items: baseline;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.825rem;
    }
    .pill-high {
      background-color: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }
    .pill-medium {
      background-color: #fef3c7;
      color: #b45309;
      border: 1px solid #fcd34d;
    }
    .pill-low {
      background-color: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }
    .text-high { color: #16a34a; }
    .text-medium { color: #d97706; }
    .text-low { color: #64748b; }
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
