import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { loadRemoteModule } from "@angular-architects/native-federation";
import { WelcomeComponent } from "./welcome/welcome.component";

const routes: Routes = [
  {
    path: "dashboard",
    loadChildren: () => loadRemoteModule('overview', './Module').then(m => m.OverviewModule)
  },
  {
    path: "**",
    component: WelcomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
