import { Component, effect } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { injectAppState } from '@app/mfe-state-model';

const LIGHT_COLORS = ['#42A5F5', '#66BB6A', '#FFA726', '#26C6DA', '#7E57C2'];
const DARK_COLORS  = ['#90CAF9', '#A5D6A7', '#FFCC80', '#80DEEA', '#CE93D8'];

@Component({
    selector: 'lib-wind-directions-chart',
    templateUrl: './wind-directions-chart.component.html',
    styleUrls: ['./wind-directions-chart.component.css'],
    standalone: true,
    imports: [ChartModule],
})
export class WindDirectionsChartComponent {
  private readonly state = injectAppState();
  public data: any;
  public chartOptions: any;

  constructor() {
    effect(() => {
      const dark = this.state.theme().includes('dark');
      const colors = dark ? DARK_COLORS : LIGHT_COLORS;

      this.data = {
        datasets: [{
          data: [11, 16, 7, 3, 14],
          backgroundColor: colors,
          label: 'My dataset',
        }],
        labels: ['Red', 'Green', 'Yellow', 'Grey', 'Blue'],
      };

      this.chartOptions = dark ? this.getDarkTheme() : this.getLightTheme();
    });
  }

  private getLightTheme() {
    return {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#495057' } } },
      scales: { r: { grid: { color: '#ebedef' } } },
    };
  }

  private getDarkTheme() {
    return {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#ebedef' } } },
      scales: { r: { grid: { color: 'rgba(255,255,255,0.2)' } } },
    };
  }
}
