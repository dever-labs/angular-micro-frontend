import { Component, OnInit } from '@angular/core';
import {Subscription} from "rxjs";

@Component({
    selector: 'lib-wind-guests',
    templateUrl: './wind-guests.component.html',
    styleUrls: ['./wind-guests.component.css'],
    standalone: false
})
export class WindGuestsComponent implements OnInit {
  public data: any;
  public chartOptions: any;
  public subscription!: Subscription;

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
