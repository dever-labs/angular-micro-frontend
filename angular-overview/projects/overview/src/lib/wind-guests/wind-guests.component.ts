import { Component, effect } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { injectMfeState } from '@dever-labs/ngx-mfe-broker';

const LIGHT_COLORS       = ['#42A5F5', '#66BB6A', '#FFA726'];
const LIGHT_HOVER_COLORS = ['#64B5F6', '#81C784', '#FFB74D'];
const DARK_COLORS        = ['#90CAF9', '#A5D6A7', '#FFCC80'];
const DARK_HOVER_COLORS  = ['#BBDEFB', '#C8E6C9', '#FFE0B2'];

@Component({
    selector: 'lib-wind-guests',
    templateUrl: './wind-guests.component.html',
    styleUrls: ['./wind-guests.component.css'],
    standalone: true,
    imports: [ChartModule],
})
export class WindGuestsComponent {
  private readonly state = injectMfeState();
  public data: any;
  public chartOptions: any;

  constructor() {
    effect(() => {
      const dark = this.state.theme().includes('dark');

      this.data = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          data: [300, 50, 100],
          backgroundColor: dark ? DARK_COLORS : LIGHT_COLORS,
          hoverBackgroundColor: dark ? DARK_HOVER_COLORS : LIGHT_HOVER_COLORS,
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
