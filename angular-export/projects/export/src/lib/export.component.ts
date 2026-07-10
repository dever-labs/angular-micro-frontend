import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'lib-export',
  standalone: true,
  imports: [CardModule],
  template: `
    <div class="page">
      <p-card header="Export">
        <p>This is the <strong>Export</strong> page.</p>
      </p-card>
    </div>
  `,
  styles: [`.page { padding: 2rem; }`],
})
export class ExportComponent {}
