import { Routes } from '@angular/router';
import { OverviewComponent } from './overview.component';

export const APP_ROUTES: Routes = [
  { path: '', component: OverviewComponent, pathMatch: 'full' },
];
