import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AppStateService } from '@czprz/broker';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { MenuModule } from 'primeng/menu';

@Component({
    selector: 'lib-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    standalone: true,
    imports: [ButtonModule, PopoverModule, MenuModule],
})
export class ToolbarComponent {
  public userMenuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user' },
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out' },
  ];

  constructor(private readonly appState: AppStateService) {}

  public changeTheme(theme: string): void {
    this.appState.theme.set(theme);
  }
}
