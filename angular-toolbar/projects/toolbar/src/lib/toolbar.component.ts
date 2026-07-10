import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MfeStateService } from '@dever-labs/ngx-mfe-broker';
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
  private readonly mfeState = inject(MfeStateService);

  readonly currentTheme = this.mfeState.get<string>('theme').asReadonly();

  public userMenuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user' },
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out' },
  ];

  public changeTheme(theme: string): void {
    this.mfeState.set('theme', theme);
  }
}
