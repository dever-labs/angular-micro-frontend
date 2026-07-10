import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'lib-reports',
  standalone: true,
  imports: [CardModule],
  template: `
    <div class="page">
      <p-card header="Reports">
        <p>This is the <strong>Reports</strong> page.</p>
      </p-card>
    </div>
  `,
  styles: [`.page { padding: 2rem; }`],
})
export class ReportsComponent {}
