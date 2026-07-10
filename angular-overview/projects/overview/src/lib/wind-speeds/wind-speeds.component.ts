import { Component, effect, inject } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AppStateService } from '@czprz/broker';

const LIGHT_COLORS = ['#FF6384', '#36A2EB', '#FFCE56'];
const DARK_COLORS  = ['#FF8FAB', '#82C4F8', '#FFE08C'];

@Component({
    selector: 'lib-wind-speeds',
    templateUrl: './wind-speeds.component.html',
    styleUrls: ['./wind-speeds.component.css'],
    standalone: true,
    imports: [ChartModule],
})
export class WindSpeedsComponent {
  private readonly appState = inject(AppStateService);
  public data: any;
  public chartOptions: any;

  constructor() {
    effect(() => {
      const dark = this.appState.theme().includes('dark');
      const colors = dark ? DARK_COLORS : LIGHT_COLORS;

      this.data = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          data: [300, 50, 100],
          backgroundColor: colors,
          hoverBackgroundColor: colors,
        }],
      };

      this.chartOptions = dark ? this.getDarkTheme() : this.getLightTheme();
    });
  }

  private getLightTheme() {
    return {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#495057' } } },
    };
  }

  private getDarkTheme() {
    return {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#ebedef' } } },
    };
  }
}
