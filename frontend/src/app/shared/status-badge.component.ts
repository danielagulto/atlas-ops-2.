import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="status-badge" [class.healthy]="tone === 'healthy'" [class.warning]="tone === 'warning'" [class.danger]="tone === 'danger'" [class.info]="tone === 'info'"><i></i>{{ label }}</span>`,
  styles: [`
    .status-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;background:#f0f2f5;color:#667386}
    i{width:6px;height:6px;border-radius:50%;background:currentColor}
    .healthy{background:#eaf7f0;color:#25845e}.warning{background:#fff5e6;color:#b47a21}.danger{background:#fff0ef;color:#c45b55}.info{background:#edf2ff;color:#5578dc}
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) label = '';
  @Input() tone: 'healthy' | 'warning' | 'danger' | 'info' = 'info';
}
