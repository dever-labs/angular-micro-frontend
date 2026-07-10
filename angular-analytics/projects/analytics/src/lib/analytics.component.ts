import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'lib-analytics',
  standalone: true,
  imports: [CardModule],
  template: `
    <div class="page">
      <p-card header="Analytics">
        <p>This is the <strong>Analytics</strong> page.</p>
      </p-card>
    </div>
  `,
  styles: [`.page { padding: 2rem; }`],
})
export class AnalyticsComponent {}
