import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExportComponent } from '../../projects/export/src/lib/export.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ExportComponent],
  template: '<lib-export></lib-export><router-outlet></router-outlet>',
})
export class AppComponent {}
