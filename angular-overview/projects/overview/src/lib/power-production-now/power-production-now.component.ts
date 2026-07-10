import { Component, effect, inject, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AppStateService } from '@czprz/broker';

@Component({
    selector: 'lib-power-production-now',
    templateUrl: './power-production-now.component.html',
    styleUrls: ['./power-production-now.component.css'],
    standalone: true,
    imports: [ChartModule],
})
export class PowerProductionNowComponent implements OnInit {
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
      labels: [
        'Eating',
        'Drinking',
        'Sleeping',
        'Designing',
        'Coding',
        'Cycling',
        'Running',
      ],
      datasets: [
        {
          label: 'My First dataset',
          backgroundColor: 'rgba(179,181,198,0.2)',
          borderColor: 'rgba(179,181,198,1)',
          pointBackgroundColor: 'rgba(179,181,198,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(179,181,198,1)',
          data: [65, 59, 90, 81, 56, 55, 40],
        },
        {
          label: 'My Second dataset',
          backgroundColor: 'rgba(255,99,132,0.2)',
          borderColor: 'rgba(255,99,132,1)',
          pointBackgroundColor: 'rgba(255,99,132,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(255,99,132,1)',
          data: [28, 48, 40, 19, 96, 27, 100],
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
      scales: {
        r: {
          pointLabels: {
            color: '#495057',
          },
          grid: {
            color: '#ebedef',
          },
          angleLines: {
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
          pointLabels: {
            color: '#ebedef',
          },
          grid: {
            color: 'rgba(255,255,255,0.2)',
          },
          angleLines: {
            color: 'rgba(255,255,255,0.2)',
          },
        },
      },
    };
  }
}
