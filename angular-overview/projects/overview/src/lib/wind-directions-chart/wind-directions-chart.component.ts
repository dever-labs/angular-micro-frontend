import { Component, OnInit } from '@angular/core';
import {Subscription} from "rxjs";

@Component({
    selector: 'lib-wind-directions-chart',
    templateUrl: './wind-directions-chart.component.html',
    styleUrls: ['./wind-directions-chart.component.css'],
    standalone: false
})
export class WindDirectionsChartComponent implements OnInit {
  public data: any;
  public chartOptions: any;
  public subscription!: Subscription;

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

    this.chartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#495057' },
        },
      },
      scales: {
        r: {
          grid: { color: '#ebedef' },
        },
      },
    };
  }

  getLightTheme() {
    return {
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
