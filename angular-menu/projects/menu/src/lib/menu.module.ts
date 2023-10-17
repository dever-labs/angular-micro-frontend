import {NgModule} from "@angular/core";
import {MenuComponent} from "./menu.component";
import {RouterLink} from "@angular/router";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";

@NgModule({
    declarations: [MenuComponent],
    imports: [ButtonModule, InputTextModule, RouterLink],
    exports: [MenuComponent],
})
export class MenuModule {
}
