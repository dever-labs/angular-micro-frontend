import { Component, effect } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { injectMfeState } from '@dever-labs/ngx-mfe-broker';

const DATASETS_LIGHT = [
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
];

const DATASETS_DARK = [
  {
    label: 'My First dataset',
    backgroundColor: 'rgba(144,202,249,0.2)',
    borderColor: 'rgba(144,202,249,1)',
    pointBackgroundColor: 'rgba(144,202,249,1)',
    pointBorderColor: '#27272a',
    pointHoverBackgroundColor: '#27272a',
    pointHoverBorderColor: 'rgba(144,202,249,1)',
    data: [65, 59, 90, 81, 56, 55, 40],
  },
  {
    label: 'My Second dataset',
    backgroundColor: 'rgba(255,143,171,0.2)',
    borderColor: 'rgba(255,143,171,1)',
    pointBackgroundColor: 'rgba(255,143,171,1)',
    pointBorderColor: '#27272a',
    pointHoverBackgroundColor: '#27272a',
    pointHoverBorderColor: 'rgba(255,143,171,1)',
    data: [28, 48, 40, 19, 96, 27, 100],
  },
];

@Component({
    selector: 'lib-power-production-now',
    templateUrl: './power-production-now.component.html',
    styleUrls: ['./power-production-now.component.css'],
    standalone: true,
    imports: [ChartModule],
})
export class PowerProductionNowComponent {
  private readonly state = injectMfeState();
  public data: any;
  public chartOptions: any;

  private readonly LABELS = ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'];

  constructor() {
    effect(() => {
      const dark = this.state.theme().includes('dark');

      this.data = {
        labels: this.LABELS,
        datasets: dark ? DATASETS_DARK : DATASETS_LIGHT,
      };

      this.chartOptions = dark ? this.getDarkTheme() : this.getLightTheme();
    });
  }

  private getLightTheme() {
    return {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#495057' } } },
      scales: {
        r: {
          pointLabels: { color: '#495057' },
          grid: { color: '#ebedef' },
          angleLines: { color: '#ebedef' },
        },
      },
    };
  }

  private getDarkTheme() {
    return {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#ebedef' } } },
      scales: {
        r: {
          pointLabels: { color: '#ebedef' },
          grid: { color: 'rgba(255,255,255,0.2)' },
          angleLines: { color: 'rgba(255,255,255,0.2)' },
        },
      },
    };
  }
}
