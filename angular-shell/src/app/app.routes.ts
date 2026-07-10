import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { WelcomeComponent } from './welcome/welcome.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      loadRemoteModule('overview', './routes').then(m => m.APP_ROUTES),
  },
  {
    path: '**',
    component: WelcomeComponent,
  },
];
