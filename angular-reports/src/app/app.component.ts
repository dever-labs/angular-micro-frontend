import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReportsComponent } from '../../projects/reports/src/lib/reports.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReportsComponent],
  template: '<lib-reports></lib-reports><router-outlet></router-outlet>',
})
export class AppComponent {}
