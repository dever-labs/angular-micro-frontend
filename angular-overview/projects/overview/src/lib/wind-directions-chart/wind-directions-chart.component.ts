import { Component, effect, inject, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AppStateService } from '@czprz/broker';

@Component({
    selector: 'lib-wind-directions-chart',
    templateUrl: './wind-directions-chart.component.html',
    styleUrls: ['./wind-directions-chart.component.css'],
    standalone: true,
    imports: [ChartModule],
})
export class WindDirectionsChartComponent implements OnInit {
  private readonly appState = inject(AppStateService);
  public data: any;
  public chartOptions: any;

  constructor() {
    effect(() => {
      this.chartOptions = this.appState.theme().includes('dark')
        ? this.getDarkTheme()
        : this.getLightTheme();
    });
  }

  ngOnInit() {
    this.data = {
      datasets: [
        {
          data: [11, 16, 7, 3, 14],
          backgroundColor: [
            '#42A5F5',
            '#66BB6A',
            '#FFA726',
            '#26C6DA',
            '#7E57C2',
          ],
          label: 'My dataset',
        },
      ],
      labels: ['Red', 'Green', 'Yellow', 'Grey', 'Blue'],
    };
  }

  getLightTheme() {
    return {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#495057',
          },
        },
      },
      scales: {
        r: {
          grid: {
            color: '#ebedef',
          },
        },
      },
    };
  }

  getDarkTheme() {
    return {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#ebedef',
          },
        },
      },
      scales: {
        r: {
          grid: {
            color: 'rgba(255,255,255,0.2)',
          },
        },
      },
    };
  }
}
