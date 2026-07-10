import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';

/** Static fallback routes. Feature routes are registered dynamically
 *  at startup via the menu API — see provideAppInitializer in app.config.ts. */
export const routes: Routes = [
  { path: '**', component: WelcomeComponent },
];
