import { AfterViewInit, Component, ViewChild, ViewContainerRef } from "@angular/core";
import { loadRemoteModule } from "@angular-architects/native-federation";

@Component({
    selector: "app-menu",
    templateUrl: "./menu.component.html",
    styleUrls: ["./menu.component.scss"],
    standalone: false
})
export class MenuComponent implements AfterViewInit {
  @ViewChild("menuPlaceholder", { read: ViewContainerRef })
  menuPlaceholder!: ViewContainerRef;

  async ngAfterViewInit(): Promise<void> {
    try {
      const m = await loadRemoteModule('menu', './Component');
      this.menuPlaceholder.createComponent(m.MenuComponent);
    } catch (err) {
      console.error('[shell] Failed to load menu remote:', err);
    }
  }
}
