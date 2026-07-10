import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { WindDirectionsChartComponent } from './wind-directions-chart/wind-directions-chart.component';
import { WindSpeedsComponent } from './wind-speeds/wind-speeds.component';
import { WindGuestsComponent } from './wind-guests/wind-guests.component';
import { PowerProductionNowComponent } from './power-production-now/power-production-now.component';
import { PowerProductionComponent } from './power-production/power-production.component';

@Component({
    selector: 'lib-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
    standalone: true,
    imports: [
      CardModule,
      WindDirectionsChartComponent,
      WindSpeedsComponent,
      WindGuestsComponent,
      PowerProductionNowComponent,
      PowerProductionComponent,
    ],
})
export class OverviewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
