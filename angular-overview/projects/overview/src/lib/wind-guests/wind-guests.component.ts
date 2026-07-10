import { Component, effect, inject, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AppStateService } from '@czprz/broker';

@Component({
    selector: 'lib-wind-guests',
    templateUrl: './wind-guests.component.html',
    styleUrls: ['./wind-guests.component.css'],
    standalone: true,
    imports: [ChartModule],
})
export class WindGuestsComponent implements OnInit {
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
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
          hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D'],
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
