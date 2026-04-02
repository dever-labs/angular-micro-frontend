import { Component } from '@angular/core';
import { AppStateService } from '@czprz/broker';

@Component({
    selector: 'lib-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    standalone: false
})
export class ToolbarComponent {
  constructor(private readonly appState: AppStateService) {}

  public changeTheme(theme: string): void {
    this.appState.theme.set(theme);
  }
}
