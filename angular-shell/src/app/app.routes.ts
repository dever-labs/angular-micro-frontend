import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { WelcomeComponent } from './welcome/welcome.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      loadRemoteModule('overview', './Component').then(m => m.OverviewComponent),
  },
  {
    path: '**',
    component: WelcomeComponent,
  },
];
