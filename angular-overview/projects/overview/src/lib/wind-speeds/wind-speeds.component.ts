import { Component, effect, inject, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AppStateService } from '@czprz/broker';

@Component({
    selector: 'lib-wind-speeds',
    templateUrl: './wind-speeds.component.html',
    styleUrls: ['./wind-speeds.component.css'],
    standalone: true,
    imports: [ChartModule],
})
export class WindSpeedsComponent implements OnInit {
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
      labels: ['A', 'B', 'C'],
      datasets: [
        {
          data: [300, 50, 100],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        },
      ],
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
    };
  }
}
