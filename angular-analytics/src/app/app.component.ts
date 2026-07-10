import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnalyticsComponent } from '../../projects/analytics/src/lib/analytics.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AnalyticsComponent],
  template: '<lib-analytics></lib-analytics><router-outlet></router-outlet>',
})
export class AppComponent {}
