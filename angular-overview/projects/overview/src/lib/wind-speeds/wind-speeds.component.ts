import { Component, OnInit } from '@angular/core';
import {Subscription} from "rxjs";

@Component({
    selector: 'lib-wind-speeds',
    templateUrl: './wind-speeds.component.html',
    styleUrls: ['./wind-speeds.component.css'],
    standalone: false
})
export class WindSpeedsComponent implements OnInit {
  public data: any;
  public chartOptions: any;
  public subscription!: Subscription;

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

    this.chartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#495057' },
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
    };
  }
}
