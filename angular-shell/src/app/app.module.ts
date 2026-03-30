import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ToolbarComponent } from "./toolbar/toolbar.component";
import { MenuComponent } from "./menu/menu.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrokerModule } from "@czprz/broker";
import { WelcomeComponent } from './welcome/welcome.component';
import { FooterComponent } from './footer/footer.component';
import { CardModule } from "primeng/card";
import { ChartModule } from "primeng/chart";
import { providePrimeNG } from "primeng/config";
import Aura from "@primeuix/themes/aura";

@NgModule({
  declarations: [AppComponent, ToolbarComponent, MenuComponent, WelcomeComponent, FooterComponent],
  imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, BrokerModule, CardModule, ChartModule],
  providers: [
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-theme',
        },
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
